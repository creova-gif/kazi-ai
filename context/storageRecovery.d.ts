export declare const STATE_UNREADABLE: 'STATE_UNREADABLE';
export declare function errorCode(e: unknown): string;
export declare function recoveryOptions(code: string): { retry: boolean; reset: boolean };
