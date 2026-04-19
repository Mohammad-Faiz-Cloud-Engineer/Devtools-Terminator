/**
 * DevTools Terminator TypeScript Definitions
 */

declare global {
    interface Window {
        DEVTOOLS_TERMINATOR_CONFIG?: Partial<DevToolsTerminatorConfig>;
        DevToolsTerminator: DevToolsTerminatorAPI;
    }
}

export interface DevToolsTerminatorConfig {
    /**
     * URL to redirect the user to upon termination.
     * @default "terminated.html"
     */
    terminationUrl: string;

    /**
     * Polling interval in milliseconds for DevTools checks.
     * @default 100
     */
    checkInterval: number;

    /**
     * Detect docked DevTools by measuring viewport dimensions.
     * @default true
     */
    enableWindowSizeCheck: boolean;

    /**
     * Block common DevTools keyboard shortcuts (e.g., F12, Ctrl+Shift+I).
     * @default true
     */
    enableKeyboardBlock: boolean;

    /**
     * Automatically disable false-positive prone checks (like size detection) on mobile devices.
     * @default true
     */
    disableOnMobile: boolean;

    /**
     * [Hybrid Only] Enable server-side cryptographic validation.
     * @default true
     */
    serverValidation?: boolean;

    /**
     * [Hybrid Only] The endpoint to ping heartbeats and termination payloads.
     * @default "/api/devtools-terminator"
     */
    apiEndpoint?: string;

    /**
     * [Hybrid Only] The secret to use for generating HMAC signatures.
     */
    secret?: string;

    /**
     * Callback fired when DevTools are detected and termination is initiated.
     */
    onTerminate?: (code: string) => void;
}

export interface DevToolsTerminatorAPI {
    /**
     * Library version string.
     */
    version: string;

    /**
     * Check if the session has been terminated.
     */
    isTerminated(): boolean;

    /**
     * Manually trigger a termination event.
     */
    terminate(): void;

    /**
     * Read-only reference to the active configuration.
     */
    readonly config: Readonly<DevToolsTerminatorConfig>;
}

declare const DevToolsTerminator: DevToolsTerminatorAPI;
export default DevToolsTerminator;
