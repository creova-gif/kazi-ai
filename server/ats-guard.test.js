// CRE-255 guard: fails if cleartext HTTP is re-enabled for shipped builds.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const FORBIDDEN = ['NSAllowsArbitraryLoads', 'usesCleartextTraffic', 'NSAllowsArbitraryLoadsInWebContent', 'NSAllowsArbitraryLoadsForMedia'];

test('app.json does not allow cleartext HTTP (iOS ATS / Android)', () => {
  const app = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8')).expo;
  assert.equal(app.android?.usesCleartextTraffic, undefined);
  assert.equal(app.ios?.infoPlist?.NSAppTransportSecurity, undefined);
});

test('no Expo config file re-introduces the forbidden flags', () => {
  const files = readdirSync(root).filter((f) => /^app\.(json|config\.(ts|js|cjs|mjs))$/.test(f));
  assert.ok(files.includes('app.json'));
  for (const f of files) {
    const src = readFileSync(join(root, f), 'utf8')
      .split('\n').filter((l) => !/^\s*(\/\/|\*)/.test(l)).join('\n'); // ignore comments
    for (const flag of FORBIDDEN) assert.ok(!src.includes(flag), `${f} contains ${flag}`);
  }
});

test('dev-only ATS relaxation is gated on the development variant and is local-only', () => {
  const p = join(root, 'app.config.ts');
  if (!existsSync(p)) return;
  const src = readFileSync(p, 'utf8');
  assert.match(src, /APP_VARIANT === 'development'/);
  assert.match(src, /if \(!isDev\) return base;/);
  assert.match(src, /NSAllowsLocalNetworking: true/);
});
