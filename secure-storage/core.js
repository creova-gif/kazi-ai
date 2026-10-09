// @creova/secure-storage v1.1.1
// Source of truth: creova-gif/kazi-ai/secure-storage v1.1.1; keep in sync.
// Vendored IDENTICALLY into: kazi-ai/secure-storage, clinic-ai/mobile/secure-storage.
// Do not edit one copy only: bump VERSION, update SHA256SUMS, copy to both repos.
//
// Design
// - Small values (UTF-8 <= SMALL_LIMIT bytes) go straight into expo-secure-store.
// - Large values are AES-256-GCM encrypted (@noble/ciphers) and the ciphertext
//   is stored in AsyncStorage. The 256-bit data key is generated on-device
//   (expo-crypto CSPRNG) and stored ONLY in expo-secure-store with
//   keychainAccessible AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY.
// - The data key is loaded per operation, used, then zeroed. It is never
//   returned, exported, logged, or written anywhere other than SecureStore.
// - Fail closed, never lose data: storage/read errors throw SecureStorageError;
//   nothing is ever deleted or re-keyed because of an error. Only a key that
//   is genuinely absent (SecureStore returned null) may be created.
// - Every operation runs through one serial queue, so key creation, manifest
//   updates, writes and wipe never interleave.
// - Legacy plaintext AsyncStorage entries are migrated on first use, verified
//   by read-back, and only then deleted.
// - Nothing in this module logs; errors never include stored values.
// - Public API: get / set / remove / wipe.
import { gcm } from '@noble/ciphers/aes.js';
import { utf8ToBytes, bytesToUtf8 } from '@noble/ciphers/utils.js';

export const VERSION = '1.1.1';
export const SMALL_LIMIT = 1800; // bytes; below iOS/Android SecureStore practical limits
const KEY_LEN = 32;
const NONCE_LEN = 12;
const FORMAT = 'v1:';
const NAME_RE = /^[A-Za-z0-9_-]{1,64}$/;

/** Typed error. `code` is one of the ERROR_CODES; message never contains stored data. */
export class SecureStorageError extends Error {
  constructor(code, message) {
    super(`secure-storage: ${message}`);
    this.name = 'SecureStorageError';
    this.code = code;
  }
}
export const ERROR_CODES = Object.freeze({
  STORE_UNAVAILABLE: 'STORE_UNAVAILABLE', // SecureStore/AsyncStorage threw
  KEY_MISSING: 'KEY_MISSING',             // encrypted data exists but its key is gone
  KEY_CORRUPT: 'KEY_CORRUPT',             // stored key is not a valid 256-bit key
  DECRYPT_FAILED: 'DECRYPT_FAILED',       // ciphertext tampered/corrupt; data kept
  MANIFEST_UNREADABLE: 'MANIFEST_UNREADABLE',
  MIGRATION_FAILED: 'MIGRATION_FAILED',   // legacy plaintext kept
  RNG_FAILURE: 'RNG_FAILURE',
  WIPE_INCOMPLETE: 'WIPE_INCOMPLETE',
  INVALID_ARGUMENT: 'INVALID_ARGUMENT',
});
const E = ERROR_CODES;

function toB64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return btoa(s);
}
function fromB64(str) {
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/**
 * @param {object} deps  { SecureStore, AsyncStorage, randomBytes(n) => Uint8Array }
 * @param {object} opts  { namespace, legacyKeys?: { [name]: asyncStorageKey }, requireAuthentication?: boolean }
 */
export function createSecureStorage(deps, opts) {
  const { SecureStore, AsyncStorage, randomBytes } = deps;
  const ns = opts && opts.namespace;
  if (!ns || !NAME_RE.test(ns)) throw new SecureStorageError(E.INVALID_ARGUMENT, 'invalid namespace');
  const legacyKeys = (opts && opts.legacyKeys) || {};
  for (const n of Object.keys(legacyKeys)) {
    if (!NAME_RE.test(n)) throw new SecureStorageError(E.INVALID_ARGUMENT, 'invalid name');
  }
  const ssOpts = {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    requireAuthentication: opts && opts.requireAuthentication === true,
  };

  const keyId = `${ns}.dek`;
  const manifestId = `${ns}.manifest`;
  const ssId = (name) => `${ns}.v.${name}`;
  const blobId = (name) => `@${ns}/blob/${name}`;
  const blobPrefix = `@${ns}/blob/`;
  const knownNames = new Set(Object.keys(legacyKeys)); // names seen this session
  const checkName = (name) => {
    if (typeof name !== 'string' || !NAME_RE.test(name)) throw new SecureStorageError(E.INVALID_ARGUMENT, 'invalid name');
  };

  // Wrap a storage call: any throw becomes a typed STORE_UNAVAILABLE error.
  async function io(fn) {
    try { return await fn(); } catch (e) {
      if (e instanceof SecureStorageError) throw e;
      throw new SecureStorageError(E.STORE_UNAVAILABLE, 'storage backend error');
    }
  }
  function rand(n) {
    let b;
    try { b = randomBytes(n); } catch { b = null; }
    if (!(b instanceof Uint8Array) || b.length !== n) throw new SecureStorageError(E.RNG_FAILURE, 'RNG failure');
    return b;
  }

  // ---- serial queue: every public operation runs one at a time ----
  let tail = Promise.resolve();
  function serial(fn) {
    const run = tail.then(fn, fn);
    tail = run.then(() => undefined, () => undefined);
    return run;
  }

  // ---- manifest (names only, never values) ----
  async function readManifest() {
    const raw = await io(() => SecureStore.getItemAsync(manifestId, ssOpts));
    if (raw == null) return [];
    let arr;
    try { arr = JSON.parse(raw); } catch { arr = null; }
    if (!Array.isArray(arr) || !arr.every((n) => typeof n === 'string' && NAME_RE.test(n))) {
      throw new SecureStorageError(E.MANIFEST_UNREADABLE, 'manifest unreadable');
    }
    return arr;
  }
  async function addToManifest(name) {
    const m = await readManifest(); // throws if unreadable: never replaced by []
    if (!m.includes(name)) {
      m.push(name);
      await io(() => SecureStore.setItemAsync(manifestId, JSON.stringify(m), ssOpts));
    }
  }

  // ---- key handling ----
  // Returns { key } where key is a fresh copy the caller must zero, or { key: null }
  // if the key is genuinely absent and create === false.
  async function loadKey(create) {
    const stored = await io(() => SecureStore.getItemAsync(keyId, ssOpts)); // throws on error
    if (stored != null) {
      let key = null;
      try { key = fromB64(stored); } catch { key = null; }
      if (!key || key.length !== KEY_LEN) {
        if (key) key.fill(0);
        throw new SecureStorageError(E.KEY_CORRUPT, 'stored key is invalid');
      }
      return key;
    }
    if (!create) return null;
    // Genuinely absent. Any existing blobs were encrypted under a lost key:
    // they are left untouched (never deleted here).
    const fresh = rand(KEY_LEN);
    const key = new Uint8Array(fresh);
    fresh.fill(0);
    await io(() => SecureStore.setItemAsync(keyId, toB64(key), ssOpts));
    return key;
  }

  function aad(name) { return utf8ToBytes(`${ns}/${name}/${FORMAT}`); }

  async function rawSet(name, value) {
    if (typeof value !== 'string') throw new SecureStorageError(E.INVALID_ARGUMENT, 'value must be a string');
    knownNames.add(name);
    const bytes = utf8ToBytes(value);
    await addToManifest(name);
    if (bytes.length <= SMALL_LIMIT) {
      await io(() => SecureStore.setItemAsync(ssId(name), value, ssOpts));
      await io(() => AsyncStorage.removeItem(blobId(name)));
      return;
    }
    const key = await loadKey(true);
    let payload;
    try {
      const nonce = rand(NONCE_LEN);
      const ct = gcm(key, nonce, aad(name)).encrypt(bytes);
      const out = new Uint8Array(NONCE_LEN + ct.length);
      out.set(nonce, 0); out.set(ct, NONCE_LEN);
      payload = FORMAT + toB64(out);
    } finally { key.fill(0); }
    await io(() => AsyncStorage.setItem(blobId(name), payload));
    await io(() => SecureStore.deleteItemAsync(ssId(name), ssOpts));
  }

  async function rawGet(name) {
    const small = await io(() => SecureStore.getItemAsync(ssId(name), ssOpts));
    if (small != null) return small;
    const blob = await io(() => AsyncStorage.getItem(blobId(name)));
    if (blob == null) return null;
    const key = await loadKey(false);
    if (!key) throw new SecureStorageError(E.KEY_MISSING, 'encrypted value exists but key is missing; data kept');
    try {
      if (!blob.startsWith(FORMAT)) throw new Error('format');
      const data = fromB64(blob.slice(FORMAT.length));
      if (data.length < NONCE_LEN + 16) throw new Error('short');
      return bytesToUtf8(gcm(key, data.subarray(0, NONCE_LEN), aad(name)).decrypt(data.subarray(NONCE_LEN)));
    } catch {
      // Data is kept as-is for recovery/investigation; never deleted here.
      throw new SecureStorageError(E.DECRYPT_FAILED, 'could not decrypt stored value; data kept');
    } finally { key.fill(0); }
  }

  async function rawRemove(name) {
    await io(() => SecureStore.deleteItemAsync(ssId(name), ssOpts));
    await io(() => AsyncStorage.removeItem(blobId(name)));
  }

  let migrated = false;
  async function ensureMigrated() {
    if (migrated) return;
    for (const [name, legacy] of Object.entries(legacyKeys)) {
      const plain = await io(() => AsyncStorage.getItem(legacy));
      if (plain == null) continue;
      await rawSet(name, plain);
      const back = await rawGet(name);
      if (back !== plain) {
        // Plaintext kept; nothing deleted. Retried next time.
        throw new SecureStorageError(E.MIGRATION_FAILED, 'migration verification failed; legacy data kept');
      }
      await io(() => AsyncStorage.removeItem(legacy));
    }
    migrated = true;
  }

  async function rawWipe() {
    const failures = [];
    const attempt = async (fn) => { try { await fn(); } catch { failures.push(1); } };
    let names = [...knownNames];
    try { names = [...new Set([...names, ...(await readManifest())])]; } catch { failures.push(1); }
    for (const name of names) await attempt(() => SecureStore.deleteItemAsync(ssId(name), ssOpts));
    for (const name of names) await attempt(() => AsyncStorage.removeItem(blobId(name)));
    await attempt(async () => {
      const keys = await AsyncStorage.getAllKeys();
      const ours = keys.filter((k) => k.startsWith(blobPrefix));
      if (ours.length) await AsyncStorage.multiRemove(ours);
    });
    for (const legacy of Object.values(legacyKeys)) await attempt(() => AsyncStorage.removeItem(legacy));
    await attempt(() => SecureStore.deleteItemAsync(keyId, ssOpts));
    await attempt(() => SecureStore.deleteItemAsync(manifestId, ssOpts));
    if (failures.length) throw new SecureStorageError(E.WIPE_INCOMPLETE, `wipe incomplete (${failures.length} step(s) failed)`);
    migrated = true; // nothing left to migrate
  }

  // async wrappers: invalid arguments reject (never throw synchronously).
  return {
    async get(name) { checkName(name); return serial(async () => { await ensureMigrated(); return rawGet(name); }); },
    async set(name, value) { checkName(name); return serial(async () => { await ensureMigrated(); return rawSet(name, value); }); },
    async remove(name) { checkName(name); return serial(async () => { await ensureMigrated(); return rawRemove(name); }); },
    async wipe() { return serial(rawWipe); },
  };
}
