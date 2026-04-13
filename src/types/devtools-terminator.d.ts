/**
 * DevTools Terminator - TypeScript Definitions
 * @version 2.1.0
 * @author Mohammad Faiz
 * @license MIT
 */

/**
 * Configuration options for DevTools Terminator
 */
declare interface DevToolsTerminatorConfig {
    /**
     * URL to redirect to when DevTools are detected
     * @default 'terminated.html'
     */
    terminationUrl?: string;

    /**
     * Interval in milliseconds between detection checks
     * @default 100
     */
    checkInterval?: number;

    /**
     * Enable window size detection method
     * @default true
     */
    enableWindowSizeCheck?: boolean;

    /**
     * Enable keyboard shortcut blocking
     * @default true
     */
    enableKeyboardBlock?: boolean;

    /**
     * Force disable on mobile devices
     * @default false
     */
    disableOnMobile?: boolean;

    /**
     * Custom handler called when DevTools are detected
     * Note: Default termination behavior still runs after this
     */
    onTerminate?: () => void;
}

/**
 * DevTools Terminator Public API
 */
declare interface DevToolsTerminatorAPI {
    /**
     * Library version
     */
    readonly version: string;

    /**
     * Current configuration
     */
    readonly config: Readonly<Required<Omit<DevToolsTerminatorConfig, 'onTerminate'>>>;

    /**
     * Manually trigger session termination
     * @returns void
     */
    terminate(): void;

    /**
     * Check if session has been terminated
     * @returns true if session has been terminated, false otherwise
     */
    isTerminated(): boolean;
}

/**
 * Global Window augmentation
 */
declare interface Window {
    /**
     * Configuration for DevTools Terminator
     * Must be set before the script loads
     */
    DEVTOOLS_TERMINATOR_CONFIG?: DevToolsTerminatorConfig;

    /**
     * DevTools Terminator Public API
     * Available after the script loads
     */
    DevToolsTerminator: DevToolsTerminatorAPI;
}
