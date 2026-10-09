import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStatePersistence } from './statePersistence.js';

function fakeStorage(getImpl) {
  const writes = [];
  return { writes, get: getImpl, set: async (n, v) => { writes.push([n, v]); }, wipe: async () => { writes.push(['wipe']); } };
}

test('a load error blocks every save (real CV is never overwritten by defaults)', async () => {
  const st = fakeStorage(async () => { const e = new Error('x'); e.code = 'STORE_UNAVAILABLE'; throw e; });
  const p = createStatePersistence(st, 'state');
  await assert.rejects(p.load(), { code: 'STORE_UNAVAILABLE' });
  assert.equal(p.status, 'error');
  await assert.rejects(p.save('{"cv":{}}'));
  assert.deepEqual(st.writes, []);
});

test('no save is possible before load completes', async () => {
  const st = fakeStorage(async () => null);
  const p = createStatePersistence(st, 'state');
  await assert.rejects(p.save('{}'));
  assert.deepEqual(st.writes, []);
});

test('after a successful load, saves go through', async () => {
  const st = fakeStorage(async () => '{"a":1}');
  const p = createStatePersistence(st, 'state');
  assert.equal(await p.load(), '{"a":1}');
  await p.save('{"a":2}');
  assert.deepEqual(st.writes, [['state', '{"a":2}']]);
});

test('clear propagates wipe errors', async () => {
  const st = fakeStorage(async () => null);
  st.wipe = async () => { throw Object.assign(new Error('w'), { code: 'WIPE_INCOMPLETE' }); };
  const p = createStatePersistence(st, 'state');
  await p.load();
  await assert.rejects(p.clear(), { code: 'WIPE_INCOMPLETE' });
});
