export interface StatePersistence {
  readonly status: 'idle' | 'loading' | 'ready' | 'error';
  load(): Promise<string | null>;
  save(value: string): Promise<void>;
  clear(): Promise<void>;
}
export declare function createStatePersistence(
  storage: { get(n: string): Promise<string | null>; set(n: string, v: string): Promise<void>; wipe(): Promise<void> },
  name: string,
): StatePersistence;
