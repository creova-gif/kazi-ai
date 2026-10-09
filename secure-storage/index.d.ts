// @creova/secure-storage v1.1.1
// Source of truth: creova-gif/kazi-ai/secure-storage v1.1.1; keep in sync.
export declare const VERSION: string;
export type SecureStorageErrorCode =
  | 'STORE_UNAVAILABLE' | 'KEY_MISSING' | 'KEY_CORRUPT' | 'DECRYPT_FAILED'
  | 'MANIFEST_UNREADABLE' | 'MIGRATION_FAILED' | 'RNG_FAILURE' | 'WIPE_INCOMPLETE' | 'INVALID_ARGUMENT';
export declare const ERROR_CODES: Readonly<Record<SecureStorageErrorCode, SecureStorageErrorCode>>;
export declare class SecureStorageError extends Error {
  readonly name: 'SecureStorageError';
  readonly code: SecureStorageErrorCode;
}
export interface SecureStorageOptions {
  /** [A-Za-z0-9_-]{1,64}; isolates keys/values per app. */
  namespace: string;
  /** Plaintext AsyncStorage keys to migrate on first use: { name: legacyKey }. */
  legacyKeys?: Record<string, string>;
  /** Opt-in biometric/passcode gate on SecureStore reads. Default false. */
  requireAuthentication?: boolean;
}
export interface SecureStorage {
  get(name: string): Promise<string | null>;
  set(name: string, value: string): Promise<void>;
  remove(name: string): Promise<void>;
  /** All methods reject with SecureStorageError; nothing is deleted or re-keyed on error. Operations are serialised. */
  /** Deletes every value, blob, legacy key and the data key. Use on sign-out/reset. */
  wipe(): Promise<void>;
}
export declare function createSecureStorage(opts: SecureStorageOptions): SecureStorage;
