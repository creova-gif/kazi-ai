// CRE-255 guard: fails if cleartext HTTP is re-enabled for shipped builds.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const FORBIDDEN = ['NSAllowsArbitraryLoads', 'usesCleartextTraffic', 'NSAllowsArbitraryLoadsInWebContent', 'NSAllowsArbitraryLoadsForMedia'];

// Resolve the real Expo config (app.json + app.config.ts) the way EAS does.
function resolvedConfig(extraEnv) {
  const env = { ...process.env, ...extraEnv };
  for (const k of ['APP_VARIANT', 'EAS_BUILD_PROFILE']) if (extraEnv[k] === undefined) delete env[k];
  const out = execFileSync('npx', ['expo', 'config', '--json', '--type', 'public'], { cwd: root, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  return JSON.parse(out);
}

// Runs `expo config` (no --json, which suppresses the message) and returns status + combined output.
function expoConfigOutput(extraEnv) {
  const env = { ...process.env, ...extraEnv };
  for (const k of ['APP_VARIANT', 'EAS_BUILD_PROFILE']) if (extraEnv[k] === undefined) delete env[k];
  const r = spawnSync('npx', ['expo', 'config', '--type', 'public'], { cwd: root, env, encoding: 'utf8' });
  return { status: r.status, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

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

test('app.config.ts exists (guard must not silently skip)', () => {
  assert.ok(existsSync(join(root, 'app.config.ts')), 'app.config.ts is missing');
});

for (const [label, env] of [['env unset', {}], ["APP_VARIANT='preview'", { APP_VARIANT: 'preview' }], ["EAS_BUILD_PROFILE='production'", { EAS_BUILD_PROFILE: 'production' }]]) {
  test(`resolved config (${label}) has no ATS exception and no cleartext`, () => {
    const cfg = resolvedConfig(env);
    assert.equal(cfg.ios?.infoPlist?.NSAppTransportSecurity, undefined);
    assert.equal(cfg.android?.usesCleartextTraffic, undefined);
    const text = JSON.stringify(cfg);
    for (const flag of FORBIDDEN) assert.ok(!text.includes(flag), `${label}: ${flag}`);
  });
}

test("resolved config (APP_VARIANT='development') relaxes local networking only", () => {
  const ats = resolvedConfig({ APP_VARIANT: 'development' }).ios?.infoPlist?.NSAppTransportSecurity;
  assert.deepEqual(ats, { NSAllowsLocalNetworking: true });
});

test('no preview/production eas.json profile sets APP_VARIANT=development (no-op until eas.json exists)', () => {
  const p = join(root, 'eas.json');
  if (!existsSync(p)) return;
  const build = JSON.parse(readFileSync(p, 'utf8')).build ?? {};
  for (const [name, prof] of Object.entries(build)) {
    if (name === 'development') continue;
    // follow "extends" chains
    let env = {}; let cur = prof; const seen = new Set();
    while (cur) { env = { ...(cur.env ?? {}), ...env }; if (!cur.extends || seen.has(cur.extends)) break; seen.add(cur.extends); cur = build[cur.extends]; }
    assert.notEqual(env.APP_VARIANT, 'development', `eas.json profile "${name}" sets APP_VARIANT=development`);
    if (env.EXPO_PUBLIC_API_BASE_URL) assert.match(env.EXPO_PUBLIC_API_BASE_URL, /^https:\/\//, `profile "${name}" API base URL must be https`);
  }
});

test('non-dev config refuses a non-https EXPO_PUBLIC_API_BASE_URL', () => {
  // Must fail for the CRE-255 reason, not because `npx expo` itself failed.
  const r = expoConfigOutput({ APP_VARIANT: 'preview', EXPO_PUBLIC_API_BASE_URL: 'http://api.example.com' });
  assert.notEqual(r.status, 0);
  assert.match(r.out, /EXPO_PUBLIC_API_BASE_URL must be https:\/\/ for non-development builds \(CRE-255\)/);
  assert.doesNotThrow(() => resolvedConfig({ APP_VARIANT: 'preview', EXPO_PUBLIC_API_BASE_URL: 'https://api.example.com' }));
});
