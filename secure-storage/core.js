// @creova/secure-storage v1.0.0
// Source of truth: creova-gif/kazi-ai/secure-storage v1.0.0; keep in sync.
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
// - Legacy plaintext AsyncStorage entries are migrated on first use, verified
//   by read-back, and only then deleted.
// - Nothing in this module logs; errors never include stored values.
// - Public API: get / set / remove / wipe.
import { gcm } from '@noble/ciphers/aes.js';
import { utf8ToBytes, bytesToUtf8 } from '@noble/ciphers/utils.js';

export const VERSION = '1.0.0';
export const SMALL_LIMIT = 1800; // bytes; below iOS/Android SecureStore practical limits
const KEY_LEN = 32;
const NONCE_LEN = 12;
const FORMAT = 'v1:';
const NAME_RE = /^[A-Za-z0-9_-]{1,64}$/;

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
  if (!ns || !NAME_RE.test(ns)) throw new Error('secure-storage: invalid namespace');
  const legacyKeys = (opts && opts.legacyKeys) || {};
  const ssOpts = {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    requireAuthentication: opts && opts.requireAuthentication === true,
  };

  const keyId = `${ns}.dek`;
  const manifestId = `${ns}.manifest`;
  const ssId = (name) => `${ns}.v.${name}`;
  const blobId = (name) => `@${ns}/blob/${name}`;
  const blobPrefix = `@${ns}/blob/`;
  const checkName = (name) => {
    if (typeof name !== 'string' || !NAME_RE.test(name)) throw new Error('secure-storage: invalid name');
  };

  async function readManifest() {
    try {
      const raw = await SecureStore.getItemAsync(manifestId, ssOpts);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.filter((n) => typeof n === 'string' && NAME_RE.test(n)) : [];
    } catch {
      return [];
    }
  }
  async function addToManifest(name) {
    const m = await readManifest();
    if (!m.includes(name)) {
      m.push(name);
      await SecureStore.setItemAsync(manifestId, JSON.stringify(m), ssOpts);
    }
  }

  // Returns a fresh copy of the data key; caller MUST zero it after use.
  // A missing or corrupt key is unrecoverable for existing blobs: they are
  // discarded (cannot be decrypted anyway) and a new key is generated.
  async function withKey(create, fn) {
    let key = null;
    try {
      let stored = null;
      try { stored = await SecureStore.getItemAsync(keyId, ssOpts); } catch { stored = null; }
      if (stored) {
        try { key = fromB64(stored); } catch { key = null; }
        if (key && key.length !== KEY_LEN) { key.fill(0); key = null; }
      }
      stored = null;
      if (!key) {
        await dropAllBlobs();
        if (!create) return fn(null);
        const fresh = randomBytes(KEY_LEN);
        if (!(fresh instanceof Uint8Array) || fresh.length !== KEY_LEN) throw new Error('secure-storage: RNG failure');
        key = new Uint8Array(fresh);
        fresh.fill(0);
        await SecureStore.setItemAsync(keyId, toB64(key), ssOpts);
      }
      return await fn(key);
    } finally {
      if (key) key.fill(0);
    }
  }

  async function dropAllBlobs() {
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter((k) => k.startsWith(blobPrefix));
    if (ours.length) await AsyncStorage.multiRemove(ours);
  }

  function aad(name) { return utf8ToBytes(`${ns}/${name}/${FORMAT}`); }

  async function rawSet(name, value) {
    if (typeof value !== 'string') throw new Error('secure-storage: value must be a string');
    const bytes = utf8ToBytes(value);
    await addToManifest(name);
    if (bytes.length <= SMALL_LIMIT) {
      await SecureStore.setItemAsync(ssId(name), value, ssOpts);
      await AsyncStorage.removeItem(blobId(name));
      return;
    }
    await withKey(true, async (key) => {
      const nonce = randomBytes(NONCE_LEN);
      const ct = gcm(key, nonce, aad(name)).encrypt(bytes);
      const out = new Uint8Array(NONCE_LEN + ct.length);
      out.set(nonce, 0); out.set(ct, NONCE_LEN);
      await AsyncStorage.setItem(blobId(name), FORMAT + toB64(out));
    });
    await SecureStore.deleteItemAsync(ssId(name), ssOpts);
  }

  async function rawGet(name) {
    let small = null;
    try { small = await SecureStore.getItemAsync(ssId(name), ssOpts); } catch { small = null; }
    if (small != null) return small;
    const blob = await AsyncStorage.getItem(blobId(name));
    if (blob == null) return null;
    return withKey(false, async (key) => {
      if (!key) return null;
      try {
        if (!blob.startsWith(FORMAT)) throw new Error('format');
        const data = fromB64(blob.slice(FORMAT.length));
        if (data.length < NONCE_LEN + 16) throw new Error('short');
        const pt = gcm(key, data.subarray(0, NONCE_LEN), aad(name)).decrypt(data.subarray(NONCE_LEN));
        return bytesToUtf8(pt);
      } catch {
        // Tampered/corrupt ciphertext: discard rather than crash.
        await AsyncStorage.removeItem(blobId(name));
        return null;
      }
    });
  }

  async function rawRemove(name) {
    await SecureStore.deleteItemAsync(ssId(name), ssOpts);
    await AsyncStorage.removeItem(blobId(name));
  }

  let ready = null;
  function init() {
    if (!ready) {
      ready = (async () => {
        for (const [name, legacy] of Object.entries(legacyKeys)) {
          checkName(name);
          const plain = await AsyncStorage.getItem(legacy);
          if (plain == null) continue;
          await rawSet(name, plain);
          const back = await rawGet(name);
          if (back === plain) {
            await AsyncStorage.removeItem(legacy);
          }
          // On mismatch the plaintext is kept so no data is lost; the
          // migration retries on the next launch.
        }
      })().catch(() => { ready = null; });
    }
    return ready;
  }

  return {
    async get(name) { checkName(name); await init(); return rawGet(name); },
    async set(name, value) { checkName(name); await init(); return rawSet(name, value); },
    async remove(name) { checkName(name); await init(); return rawRemove(name); },
    async wipe() {
      const m = await readManifest();
      for (const name of m) await SecureStore.deleteItemAsync(ssId(name), ssOpts);
      await dropAllBlobs();
      for (const legacy of Object.values(legacyKeys)) await AsyncStorage.removeItem(legacy);
      await SecureStore.deleteItemAsync(keyId, ssOpts);
      await SecureStore.deleteItemAsync(manifestId, ssOpts);
    },
  };
}
