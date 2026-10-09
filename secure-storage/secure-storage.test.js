// @creova/secure-storage v1.1.0
// Source of truth: creova-gif/kazi-ai/secure-storage v1.1.0; keep in sync.
// Run: node --test secure-storage/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomBytes as nodeRandom } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSecureStorage, SMALL_LIMIT, VERSION, ERROR_CODES } from './core.js';

const here = dirname(fileURLToPath(import.meta.url));

function mocks() {
  const ss = new Map();
  const as = new Map();
  const ssCalls = [];
  const SecureStore = {
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY',
    async getItemAsync(k, o) { ssCalls.push(o); return ss.has(k) ? ss.get(k) : null; },
    async setItemAsync(k, v, o) { ssCalls.push(o); ss.set(k, String(v)); },
    async deleteItemAsync(k, o) { ssCalls.push(o); ss.delete(k); },
  };
  const AsyncStorage = {
    async getItem(k) { return as.has(k) ? as.get(k) : null; },
    async setItem(k, v) { as.set(k, String(v)); },
    async removeItem(k) { as.delete(k); },
    async getAllKeys() { return [...as.keys()]; },
    async multiRemove(ks) { ks.forEach((k) => as.delete(k)); },
  };
  const randomBytes = (n) => new Uint8Array(nodeRandom(n));
  return { ss, as, ssCalls, deps: { SecureStore, AsyncStorage, randomBytes } };
}

const bigCV = JSON.stringify({ cv: { name: 'Asha Mwangi', phone: '+255700000001', summary: 'x'.repeat(5000) } });
const small = JSON.stringify({ name: 'Juma', phone: '+255711111111', role: 'patient' });

function keyBytes(ss) {
  const b64 = ss.get('t.dek');
  return b64 ? Buffer.from(b64, 'base64') : null;
}

test('round-trip: small value lives in SecureStore, large value is encrypted in AsyncStorage', async () => {
  const m = mocks();
  const s = createSecureStorage(m.deps, { namespace: 't' });
  await s.set('profile', small);
  await s.set('cv', bigCV);
  assert.equal(await s.get('profile'), small);
  assert.equal(await s.get('cv'), bigCV);
  assert.equal(m.ss.get('t.v.profile'), small);
  const blob = m.as.get('@t/blob/cv');
  assert.ok(blob.startsWith('v1:'));
  assert.ok(!blob.includes('Asha') && !blob.includes('255700000001'));
  assert.ok(Buffer.byteLength(bigCV) > SMALL_LIMIT);
  assert.equal(keyBytes(m.ss).length, 32);
});

test('migration: legacy plaintext is moved, verified and deleted; no plaintext left', async () => {
  const m = mocks();
  m.as.set('legacy_cv', bigCV);
  m.as.set('legacy_profile', small);
  const s = createSecureStorage(m.deps, { namespace: 't', legacyKeys: { cv: 'legacy_cv', profile: 'legacy_profile' } });
  assert.equal(await s.get('cv'), bigCV);
  assert.equal(await s.get('profile'), small);
  assert.equal(m.as.has('legacy_cv'), false);
  assert.equal(m.as.has('legacy_profile'), false);
  for (const v of m.as.values()) {
    assert.ok(!v.includes('Asha') && !v.includes('Juma') && !v.includes('+2557'), 'plaintext PII left in AsyncStorage');
  }
});

test('migration keeps the plaintext and throws if verification fails (no data loss)', async () => {
  const m = mocks();
  m.as.set('legacy_profile', small);
  const realSet = m.deps.SecureStore.setItemAsync;
  m.deps.SecureStore.setItemAsync = async (k, v, o) => realSet(k, k.endsWith('.v.profile') ? 'corrupted' : v, o);
  const s = createSecureStorage(m.deps, { namespace: 't', legacyKeys: { profile: 'legacy_profile' } });
  await assert.rejects(s.get('profile'), { name: 'SecureStorageError', code: 'MIGRATION_FAILED' });
  assert.equal(m.as.get('legacy_profile'), small);
});

test('wipe (sign-out/reset) clears values, blobs, legacy keys, manifest and the key', async () => {
  const m = mocks();
  m.as.set('legacy_cv', bigCV);
  m.as.set('unrelated', 'keep');
  const s = createSecureStorage(m.deps, { namespace: 't', legacyKeys: { cv: 'legacy_cv' } });
  await s.get('cv');
  await s.set('profile', small);
  await s.wipe();
  assert.equal(m.ss.size, 0);
  assert.deepEqual([...m.as.keys()], ['unrelated']);
  assert.equal(await s.get('cv'), null);
  assert.equal(await s.get('profile'), null);
});

test('missing key with existing blob: throws KEY_MISSING and keeps the data', async () => {
  const m = mocks();
  const s = createSecureStorage(m.deps, { namespace: 't' });
  await s.set('cv', bigCV);
  const blob = m.as.get('@t/blob/cv');
  m.ss.delete('t.dek');
  await assert.rejects(s.get('cv'), { code: 'KEY_MISSING' });
  assert.equal(m.as.get('@t/blob/cv'), blob);
});

test('corrupt key (bad length / bad base64): throws KEY_CORRUPT, never replaces the key, keeps data', async () => {
  for (const bad of ['AAAA', '!!!not-base64!!!']) {
    const m = mocks();
    const s = createSecureStorage(m.deps, { namespace: 't' });
    await s.set('cv', bigCV);
    const blob = m.as.get('@t/blob/cv');
    m.ss.set('t.dek', bad);
    await assert.rejects(s.get('cv'), { code: 'KEY_CORRUPT' });
    await assert.rejects(s.set('cv', bigCV + 'z'), { code: 'KEY_CORRUPT' });
    assert.equal(m.ss.get('t.dek'), bad);
    assert.equal(m.as.get('@t/blob/cv'), blob);
  }
});

test('decrypt failure (wrong key / tampered ciphertext) throws DECRYPT_FAILED and keeps the data', async () => {
  const m = mocks();
  const s = createSecureStorage(m.deps, { namespace: 't' });
  await s.set('cv', bigCV);
  const blob = m.as.get('@t/blob/cv');
  m.ss.set('t.dek', Buffer.from(nodeRandom(32)).toString('base64'));
  await assert.rejects(s.get('cv'), { code: 'DECRYPT_FAILED' });
  assert.equal(m.as.get('@t/blob/cv'), blob);
  const m2 = mocks();
  const s2 = createSecureStorage(m2.deps, { namespace: 't' });
  await s2.set('cv', bigCV);
  const b = m2.as.get('@t/blob/cv');
  const tampered = b.slice(0, 20) + (b[20] === 'A' ? 'B' : 'A') + b.slice(21);
  m2.as.set('@t/blob/cv', tampered);
  await assert.rejects(s2.get('cv'), { code: 'DECRYPT_FAILED' });
  assert.equal(m2.as.get('@t/blob/cv'), tampered);
});

test('SecureStore throwing on get: typed error, no key created, nothing deleted', async () => {
  const m = mocks();
  const s = createSecureStorage(m.deps, { namespace: 't' });
  await s.set('cv', bigCV);
  const key = m.ss.get('t.dek'); const blob = m.as.get('@t/blob/cv');
  const realGet = m.deps.SecureStore.getItemAsync;
  m.deps.SecureStore.getItemAsync = async () => { throw new Error('keychain locked'); };
  await assert.rejects(s.get('cv'), { name: 'SecureStorageError', code: 'STORE_UNAVAILABLE' });
  await assert.rejects(s.set('cv', bigCV + '2'), { code: 'STORE_UNAVAILABLE' });
  m.deps.SecureStore.getItemAsync = realGet;
  assert.equal(m.ss.get('t.dek'), key);
  assert.equal(m.as.get('@t/blob/cv'), blob);
  assert.equal(await s.get('cv'), bigCV);
});

test('SecureStore throwing on get of the KEY only: no new key over the real one', async () => {
  const m = mocks();
  const s = createSecureStorage(m.deps, { namespace: 't' });
  await s.set('cv', bigCV);
  const key = m.ss.get('t.dek');
  const realGet = m.deps.SecureStore.getItemAsync;
  m.deps.SecureStore.getItemAsync = async (k, o) => { if (k === 't.dek') throw new Error('x'); return realGet(k, o); };
  await assert.rejects(s.set('cv2', bigCV), { code: 'STORE_UNAVAILABLE' });
  await assert.rejects(s.get('cv'), { code: 'STORE_UNAVAILABLE' });
  assert.equal(m.ss.get('t.dek'), key);
});

test('SecureStore throwing on set: typed error, previous value intact', async () => {
  const m = mocks();
  const s = createSecureStorage(m.deps, { namespace: 't' });
  await s.set('profile', small);
  const realSet = m.deps.SecureStore.setItemAsync;
  m.deps.SecureStore.setItemAsync = async () => { throw new Error('full'); };
  await assert.rejects(s.set('profile', small + 'x'), { code: 'STORE_UNAVAILABLE' });
  await assert.rejects(s.set('cv', bigCV), { code: 'STORE_UNAVAILABLE' });
  m.deps.SecureStore.setItemAsync = realSet;
  assert.equal(await s.get('profile'), small);
});

test('concurrent first writes create exactly one key and all values decrypt', async () => {
  const m = mocks();
  let keyWrites = 0;
  const realSet = m.deps.SecureStore.setItemAsync;
  m.deps.SecureStore.setItemAsync = async (k, v, o) => {
    if (k === 't.dek') keyWrites++;
    await new Promise((r) => setTimeout(r, Math.random() * 3));
    return realSet(k, v, o);
  };
  const s = createSecureStorage(m.deps, { namespace: 't' });
  const names = Array.from({ length: 20 }, (_, i) => `cv${i}`);
  await Promise.all(names.map((n) => s.set(n, bigCV + n)));
  assert.equal(keyWrites, 1);
  for (const n of names) assert.equal(await s.get(n), bigCV + n);
  const manifest = JSON.parse(m.ss.get('t.manifest'));
  assert.deepEqual([...manifest].sort(), [...names].sort());
});

test('nonces: exactly 12 bytes requested, unique across 10k encryptions', async () => {
  const m = mocks();
  const sizes = [];
  const realRand = m.deps.randomBytes;
  m.deps.randomBytes = (n) => { sizes.push(n); return realRand(n); };
  const s = createSecureStorage(m.deps, { namespace: 't' });
  const seen = new Set();
  const value = 'z'.repeat(SMALL_LIMIT + 1);
  for (let i = 0; i < 10000; i++) {
    await s.set('cv', value);
    const nonce = Buffer.from(m.as.get('@t/blob/cv').slice(3), 'base64').subarray(0, 12).toString('hex');
    assert.ok(!seen.has(nonce), 'nonce reused');
    seen.add(nonce);
  }
  assert.equal(seen.size, 10000);
  assert.equal(sizes.filter((n) => n === 32).length, 1);
  assert.equal(sizes.filter((n) => n === 12).length, 10000);
  assert.ok(sizes.every((n) => n === 12 || n === 32));
});

test('RNG returning the wrong nonce length is rejected (RNG_FAILURE)', async () => {
  const m = mocks();
  const realRand = m.deps.randomBytes;
  m.deps.randomBytes = (n) => (n === 12 ? realRand(8) : realRand(n));
  const s = createSecureStorage(m.deps, { namespace: 't' });
  await assert.rejects(s.set('cv', bigCV), { code: 'RNG_FAILURE' });
  assert.equal(m.as.has('@t/blob/cv'), false);
});

test('unreadable manifest is an error, not an empty list; wipe still deletes known names', async () => {
  const m = mocks();
  m.as.set('legacy_cv', bigCV);
  const s = createSecureStorage(m.deps, { namespace: 't', legacyKeys: { cv: 'legacy_cv' } });
  await s.get('cv');
  await s.set('profile', small);
  m.ss.set('t.manifest', '{not json');
  await assert.rejects(s.set('other', small), { code: 'MANIFEST_UNREADABLE' });
  assert.equal(m.ss.get('t.manifest'), '{not json');
  await assert.rejects(s.wipe(), { code: 'WIPE_INCOMPLETE' });
  assert.equal(m.ss.has('t.v.profile'), false);
  assert.equal(m.as.has('@t/blob/cv'), false);
  assert.equal(m.ss.has('t.dek'), false);
});

test('wipe reports failures instead of swallowing them, and keeps going', async () => {
  const m = mocks();
  const s = createSecureStorage(m.deps, { namespace: 't' });
  await s.set('cv', bigCV);
  await s.set('profile', small);
  const realDel = m.deps.SecureStore.deleteItemAsync;
  m.deps.SecureStore.deleteItemAsync = async (k, o) => { if (k === 't.v.profile') throw new Error('x'); return realDel(k, o); };
  await assert.rejects(s.wipe(), { code: 'WIPE_INCOMPLETE' });
  assert.equal(m.as.has('@t/blob/cv'), false);
  assert.equal(m.ss.has('t.dek'), false);
});

test('wipe is serialised with writes: a write queued before wipe cannot survive it', async () => {
  const m = mocks();
  const realSet = m.deps.AsyncStorage.setItem;
  m.deps.AsyncStorage.setItem = async (k, v) => { await new Promise((r) => setTimeout(r, 10)); return realSet(k, v); };
  const s = createSecureStorage(m.deps, { namespace: 't' });
  const w = s.set('cv', bigCV);
  const wp = s.wipe();
  await Promise.all([w, wp]);
  assert.equal(m.as.has('@t/blob/cv'), false);
  assert.equal(m.ss.size, 0);
});

test('the data key never appears in AsyncStorage (base64 or hex)', async () => {
  const m = mocks();
  m.as.set('legacy_cv', bigCV);
  const s = createSecureStorage(m.deps, { namespace: 't', legacyKeys: { cv: 'legacy_cv' } });
  await s.get('cv');
  await s.set('cv2', bigCV + 'y');
  const key = keyBytes(m.ss);
  const needles = [
    key.toString('base64'),
    key.toString('base64').replace(/=+$/, ''),
    key.toString('base64url'),
    key.toString('hex'),
    key.toString('hex').toUpperCase(),
  ];
  for (const [k, v] of m.as.entries()) {
    for (const n of needles) {
      assert.ok(!k.includes(n) && !v.includes(n), 'data key found in AsyncStorage');
    }
    // also scan the decoded payload bytes
    if (v.startsWith('v1:')) assert.equal(Buffer.from(v.slice(3), 'base64').indexOf(key), -1);
  }
});

test('API surface is get/set/remove/wipe only; key is never returned', async () => {
  const m = mocks();
  const s = createSecureStorage(m.deps, { namespace: 't' });
  assert.deepEqual(Object.keys(s).sort(), ['get', 'remove', 'set', 'wipe']);
  const r = await s.set('cv', bigCV);
  assert.ok(Object.isFrozen(ERROR_CODES));
  assert.equal(r, undefined);
  await s.remove('cv');
  assert.equal(await s.get('cv'), null);
});

test('SecureStore options: AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY, requireAuthentication false by default, opt-in true', async () => {
  const m = mocks();
  await createSecureStorage(m.deps, { namespace: 't' }).set('cv', bigCV);
  assert.ok(m.ssCalls.length > 0);
  for (const o of m.ssCalls) {
    assert.equal(o.keychainAccessible, 'AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY');
    assert.equal(o.requireAuthentication, false);
  }
  const m2 = mocks();
  await createSecureStorage(m2.deps, { namespace: 't', requireAuthentication: true }).set('p', small);
  for (const o of m2.ssCalls) assert.equal(o.requireAuthentication, true);
});

test('module never logs', async () => {
  const orig = { ...console };
  const calls = [];
  for (const f of ['log', 'info', 'warn', 'error', 'debug']) console[f] = (...a) => calls.push(a);
  try {
    const m = mocks();
    m.as.set('legacy_cv', bigCV);
    const s = createSecureStorage(m.deps, { namespace: 't', legacyKeys: { cv: 'legacy_cv' } });
    await s.get('cv'); m.ss.set('t.dek', 'bad'); await s.get('cv').catch(() => {}); await s.wipe();
  } finally { Object.assign(console, orig); }
  assert.equal(calls.length, 0);
  const src = readFileSync(join(here, 'core.js'), 'utf8') + readFileSync(join(here, 'index.js'), 'utf8');
  assert.ok(!/console\./.test(src));
});

test('vendored copy is unmodified (matches SHA256SUMS) and version headers agree', () => {
  const sums = readFileSync(join(here, 'SHA256SUMS'), 'utf8').trim().split('\n');
  assert.ok(sums.length >= 5);
  for (const line of sums) {
    const [hash, file] = line.split(/\s+/);
    const actual = createHash('sha256').update(readFileSync(join(here, file))).digest('hex');
    assert.equal(actual, hash, `${file} differs from source of truth; re-vendor from kazi-ai/secure-storage`);
  }
  for (const f of ['core.js', 'index.js', 'index.d.ts', 'secure-storage.test.js', 'README.md', 'check-sync.sh']) {
    assert.ok(readFileSync(join(here, f), 'utf8').includes(`v${VERSION}`), `${f} version header`);
  }
});
