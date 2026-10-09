# @creova/secure-storage v1.0.0

**Source of truth: `creova-gif/kazi-ai/secure-storage` v1.0.0; keep in sync.**
Identical vendored copies live in:
- `kazi-ai/secure-storage/` (source of truth)
- `clinic-ai/mobile/secure-storage/`

To change it: edit in kazi-ai, bump `VERSION` and every header, regenerate
`SHA256SUMS` (`cd secure-storage && sha256sum core.js index.js index.d.ts package.json README.md > SHA256SUMS`),
then copy the whole folder byte-for-byte into clinic-ai. The test suite fails if
a copy is edited without updating SHA256SUMS; `check-sync.sh` diffs a copy
against kazi-ai `main`.

## API
```ts
import { createSecureStorage } from '../secure-storage';
const store = createSecureStorage({ namespace: 'kazi', legacyKeys: { state: 'kazi_ai_state_v2' } });
await store.set('state', json); await store.get('state'); await store.remove('state'); await store.wipe();
```
Only `get / set / remove / wipe`. The data key is never returned.

## Design
- Values <= 1800 UTF-8 bytes: `expo-secure-store`.
- Larger values: AES-256-GCM (`@noble/ciphers`), random 96-bit nonce per write
  (`expo-crypto`), AAD bound to namespace + name; ciphertext in AsyncStorage.
- Data key: 256-bit, generated on device, stored **only** in SecureStore with
  `keychainAccessible: AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY` (not in iCloud/
  device backups); `requireAuthentication: false` by default, opt-in via option.
  Loaded per operation and zeroed afterwards; never logged, exported, written to
  AsyncStorage/files, or sent over the network.
- Migration: legacy AsyncStorage plaintext is copied in, read back and compared,
  and deleted only when it matches. On mismatch the plaintext is kept and retried.
- Missing/corrupt key or tampered ciphertext: blob is discarded, `get` returns
  `null`, a new key is created on the next large write. No crash, no partial data.
- `wipe()`: deletes all values, blobs, migrated legacy keys, manifest and key.
- No logging anywhere in the module (tested).
