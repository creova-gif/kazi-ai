# @creova/secure-storage v1.1.0

**Source of truth: `creova-gif/kazi-ai/secure-storage` v1.1.0; keep in sync.**
Identical vendored copies live in:
- `kazi-ai/secure-storage/` (source of truth)
- `clinic-ai/mobile/secure-storage/`

To change it: edit in kazi-ai, bump `VERSION` and every header, regenerate
`SHA256SUMS` (`cd secure-storage && sha256sum core.js index.js index.d.ts package.json README.md > SHA256SUMS`),
then copy the whole folder byte-for-byte into clinic-ai. The test suite fails if
a copy is edited without updating SHA256SUMS; `check-sync.sh` diffs a copy
against kazi-ai `main`.
`check-sync.sh` gets HTTP 404 (and exits non-zero) until the module is on
kazi-ai `main`; pass a branch name as the ref before that.

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
- **Fail closed, never lose data (v1.1.0).** Every method rejects with a typed
  `SecureStorageError` (`code`: STORE_UNAVAILABLE, KEY_MISSING, KEY_CORRUPT,
  DECRYPT_FAILED, MANIFEST_UNREADABLE, MIGRATION_FAILED, RNG_FAILURE,
  WIPE_INCOMPLETE, INVALID_ARGUMENT). A SecureStore read error is never treated
  as "no key"; only a genuinely absent key (null) is created. Undecryptable data
  and orphaned blobs are kept, never deleted. An unreadable manifest is an
  error, never an empty list.
- All operations (including key creation, manifest updates and `wipe`) run on
  one serial queue: concurrent first writes produce exactly one key, and `wipe`
  never interleaves with a write.
- Nonces: exactly 12 bytes from the CSPRNG per encryption (asserted).
- `wipe()`: deletes all values, blobs, migrated legacy keys, manifest and key.
  It deletes known names directly even if the manifest is unreadable, keeps
  going on individual failures, and rejects with WIPE_INCOMPLETE if any step
  failed. Callers must surface that to the user.
- No logging anywhere in the module (tested).
