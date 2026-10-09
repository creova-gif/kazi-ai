// Decides what the user can do when on-device data can't be loaded.
// Shield re-review on #16: transient errors get retry only; permanent ones
// also get a user-confirmed "reset data on this device", so the app can never
// lock the user out for good.

/** App-level code for stored state that decrypts but is not valid JSON. */
export const STATE_UNREADABLE = 'STATE_UNREADABLE';

/** @param {unknown} e */
export function errorCode(e) {
  const code = e && typeof e === 'object' && 'code' in e ? e.code : undefined;
  return typeof code === 'string' && code ? code : 'UNKNOWN';
}

/**
 * STORE_UNAVAILABLE (keychain locked, backend hiccup) can succeed on retry.
 * Everything else (KEY_MISSING, KEY_CORRUPT, DECRYPT_FAILED, MIGRATION_FAILED,
 * MANIFEST_UNREADABLE, STATE_UNREADABLE, WIPE_INCOMPLETE, UNKNOWN...) will not
 * clear by itself, so reset is offered too.
 * @param {string} code
 */
export function recoveryOptions(code) {
  return { retry: true, reset: code !== 'STORE_UNAVAILABLE' };
}
