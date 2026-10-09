// @creova/secure-storage v1.0.0
// Source of truth: creova-gif/kazi-ai/secure-storage v1.0.0; keep in sync.
// Binds the core to the real Expo modules. No app imports.
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRandomBytes } from 'expo-crypto';
import { createSecureStorage as createCore, VERSION } from './core.js';

export { VERSION };

/**
 * @param {{ namespace: string, legacyKeys?: Record<string,string>, requireAuthentication?: boolean }} opts
 */
export function createSecureStorage(opts) {
  return createCore({ SecureStore, AsyncStorage, randomBytes: (n) => getRandomBytes(n) }, opts);
}
