import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { recoveryOptions, errorCode, STATE_UNREADABLE } from './storageRecovery.js';
import { createStatePersistence } from './statePersistence.js';
import { createSecureStorage } from '../secure-storage/core.js';

function mocks() {
  const ss = new Map(); const as = new Map();
  return {
    ss, as,
    deps: {
      SecureStore: {
        AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'A',
        async getItemAsync(k) { return ss.has(k) ? ss.get(k) : null; },
        async setItemAsync(k, v) { ss.set(k, String(v)); },
        async deleteItemAsync(k) { ss.delete(k); },
      },
      AsyncStorage: {
        async getItem(k) { return as.has(k) ? as.get(k) : null; },
        async setItem(k, v) { as.set(k, String(v)); },
        async removeItem(k) { as.delete(k); },
        async getAllKeys() { return [...as.keys()]; },
        async multiRemove(ks) { ks.forEach((k) => as.delete(k)); },
      },
      randomBytes: (n) => new Uint8Array(randomBytes(n)),
    },
  };
}
const big = JSON.stringify({ cv: { firstName: 'Asha', summary: 'x'.repeat(4000) } });

test('permanent errors offer reset; STORE_UNAVAILABLE offers retry only', () => {
  for (const code of ['KEY_MISSING', 'KEY_CORRUPT', 'DECRYPT_FAILED', 'MIGRATION_FAILED', 'MANIFEST_UNREADABLE', STATE_UNREADABLE, 'WIPE_INCOMPLETE', 'UNKNOWN']) {
    assert.deepEqual(recoveryOptions(code), { retry: true, reset: true }, code);
  }
  assert.deepEqual(recoveryOptions('STORE_UNAVAILABLE'), { retry: true, reset: false });
  assert.equal(errorCode({ code: 'KEY_CORRUPT' }), 'KEY_CORRUPT');
  assert.equal(errorCode(new Error('x')), 'UNKNOWN');
  assert.equal(errorCode(null), 'UNKNOWN');
});

for (const [label, breakIt, code] of [
  ['KEY_CORRUPT', (m) => m.ss.set('kazi.dek', 'AAAA'), 'KEY_CORRUPT'],
  ['KEY_MISSING', (m) => m.ss.delete('kazi.dek'), 'KEY_MISSING'],
  ['DECRYPT_FAILED', (m) => m.ss.set('kazi.dek', Buffer.from(randomBytes(32)).toString('base64')), 'DECRYPT_FAILED'],
]) {
  test(`${label}: load fails with reset offered; after reset, saving and loading work again`, async () => {
    const m = mocks();
    const storage = createSecureStorage(m.deps, { namespace: 'kazi' });
    await storage.set('state', big);
    breakIt(m);
    const p = createStatePersistence(storage, 'state');
    let err; try { await p.load(); } catch (e) { err = e; }
    assert.equal(errorCode(err), code);
    assert.equal(recoveryOptions(errorCode(err)).reset, true);
    await assert.rejects(p.save('{}')); // still blocked before reset
    await p.clear();                     // "Reset data on this device"
    await p.save(big);
    assert.equal(await createStatePersistence(storage, 'state').load(), big);
  });
}

test('STORE_UNAVAILABLE: no reset offered; retry succeeds once the store recovers', async () => {
  const m = mocks();
  const storage = createSecureStorage(m.deps, { namespace: 'kazi' });
  await storage.set('state', big);
  const real = m.deps.SecureStore.getItemAsync; let down = true;
  m.deps.SecureStore.getItemAsync = async (k) => { if (down) throw new Error('locked'); return real(k); };
  const p = createStatePersistence(storage, 'state');
  let err; try { await p.load(); } catch (e) { err = e; }
  assert.equal(errorCode(err), 'STORE_UNAVAILABLE');
  assert.equal(recoveryOptions(errorCode(err)).reset, false);
  down = false;
  assert.equal(await p.load(), big);
  await p.save('{"ok":1}');
});
