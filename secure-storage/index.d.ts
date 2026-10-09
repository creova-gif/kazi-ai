// @creova/secure-storage v1.0.0
// Source of truth: creova-gif/kazi-ai/secure-storage v1.0.0; keep in sync.
export declare const VERSION: string;
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
  /** Deletes every value, blob, legacy key and the data key. Use on sign-out/reset. */
  wipe(): Promise<void>;
}
export declare function createSecureStorage(opts: SecureStorageOptions): SecureStorage;
