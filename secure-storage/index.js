// @creova/secure-storage v1.1.1
// Source of truth: creova-gif/kazi-ai/secure-storage v1.1.1; keep in sync.
// Binds the core to the real Expo modules. No app imports.
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRandomBytes } from 'expo-crypto';
import { createSecureStorage as createCore, VERSION, SecureStorageError, ERROR_CODES } from './core.js';

export { VERSION, SecureStorageError, ERROR_CODES };

/**
 * @param {{ namespace: string, legacyKeys?: Record<string,string>, requireAuthentication?: boolean }} opts
 */
export function createSecureStorage(opts) {
  return createCore({ SecureStore, AsyncStorage, randomBytes: (n) => getRandomBytes(n) }, opts);
}
