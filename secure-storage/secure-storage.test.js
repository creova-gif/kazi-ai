// @creova/secure-storage v1.0.0
// Source of truth: creova-gif/kazi-ai/secure-storage v1.0.0; keep in sync.
// Run: node --test secure-storage/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomBytes as nodeRandom } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSecureStorage, SMALL_LIMIT, VERSION } from './core.js';

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

test('migration keeps the plaintext if verification fails (no data loss)', async () => {
  const m = mocks();
  m.as.set('legacy_profile', small);
  const realSet = m.deps.SecureStore.setItemAsync;
  m.deps.SecureStore.setItemAsync = async (k, v, o) => realSet(k, k.endsWith('.v.profile') ? 'corrupted' : v, o);
  const s = createSecureStorage(m.deps, { namespace: 't', legacyKeys: { profile: 'legacy_profile' } });
  await s.get('profile');
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

test('missing key: existing blobs are discarded safely, get returns null, set recovers', async () => {
  const m = mocks();
  const s = createSecureStorage(m.deps, { namespace: 't' });
  await s.set('cv', bigCV);
  m.ss.delete('t.dek');
  assert.equal(await s.get('cv'), null);
  assert.equal(m.as.has('@t/blob/cv'), false);
  await s.set('cv', bigCV);
  assert.equal(await s.get('cv'), bigCV);
});

test('corrupt key (bad length / bad base64) is handled safely', async () => {
  for (const bad of ['AAAA', '!!!not-base64!!!']) {
    const m = mocks();
    const s = createSecureStorage(m.deps, { namespace: 't' });
    await s.set('cv', bigCV);
    m.ss.set('t.dek', bad);
    assert.equal(await s.get('cv'), null);
    await s.set('cv', bigCV);
    assert.equal(await s.get('cv'), bigCV);
    assert.equal(keyBytes(m.ss).length, 32);
  }
});

test('wrong key / tampered ciphertext returns null and drops the blob', async () => {
  const m = mocks();
  const s = createSecureStorage(m.deps, { namespace: 't' });
  await s.set('cv', bigCV);
  m.ss.set('t.dek', Buffer.from(nodeRandom(32)).toString('base64'));
  assert.equal(await s.get('cv'), null);
  assert.equal(m.as.has('@t/blob/cv'), false);
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
    await s.get('cv'); m.ss.set('t.dek', 'bad'); await s.get('cv'); await s.wipe();
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
