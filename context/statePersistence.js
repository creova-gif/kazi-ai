// Guards app-state persistence so a failed load can never be followed by a
// save that overwrites the user's real (but unreadable) data with defaults.
// Shield review on #16, must-fix 4.

/**
 * @param {{ get(n: string): Promise<string|null>, set(n: string, v: string): Promise<void>, wipe(): Promise<void> }} storage
 * @param {string} name
 */
export function createStatePersistence(storage, name) {
  let status = 'idle'; // idle | loading | ready | error
  return {
    get status() { return status; },
    /** Resolves to the stored string (or null if none). Rejects on any storage error and blocks saves. */
    async load() {
      status = 'loading';
      try {
        const raw = await storage.get(name);
        status = 'ready';
        return raw;
      } catch (e) {
        status = 'error';
        throw e;
      }
    },
    /** Refuses to write unless a load has succeeded. Errors propagate to the caller. */
    async save(value) {
      if (status !== 'ready') throw new Error('persistence: refusing to save before a successful load');
      await storage.set(name, value);
    },
    /** Wipes everything; errors propagate. After a wipe, saves are allowed (state is the default). */
    async clear() {
      await storage.wipe();
      status = 'ready';
    },
  };
}
