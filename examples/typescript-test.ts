/**
 * Simple TypeScript Test
 * This file tests that all types are properly defined
 */

/// <reference path="../devtools-terminator.d.ts" />

// Test 1: Configuration types
const config1: DevToolsTerminatorConfig = {
    terminationUrl: 'terminated.html',
    checkInterval: 100,
    enableWindowSizeCheck: true,
    enableKeyboardBlock: true,
    disableOnMobile: false,
    onTerminate: (): void => {
        console.log('Terminated');
    }
};

// Test 2: Partial configuration
const config2: DevToolsTerminatorConfig = {
    terminationUrl: 'custom.html'
};

// Test 3: Window configuration
window.DEVTOOLS_TERMINATOR_CONFIG = config1;

// Test 4: API types
const api: DevToolsTerminatorAPI = window.DevToolsTerminator;

// Test 5: API methods
const version: string = api.version;
const isTerminated: boolean = api.isTerminated();
const currentConfig = api.config;

// Test 6: Manual termination
api.terminate();

console.log('All TypeScript types are working correctly!');
