/**
 * DevTools Terminator - TypeScript Integration Example
 * 
 * This file demonstrates how to use the library in a TypeScript environment
 * taking advantage of the provided .d.ts type definitions.
 */

// If using ES Modules / Webpack / Vite:
// import DevToolsTerminator from '../src/types/devtools-terminator';

// 1. Type-Safe Configuration
// The DEVTOOLS_TERMINATOR_CONFIG global is fully typed.
window.DEVTOOLS_TERMINATOR_CONFIG = {
    terminationUrl: '../public/terminated.html',
    checkInterval: 150, // Custom polling speed
    enableWindowSizeCheck: true,
    enableKeyboardBlock: true,
    disableOnMobile: true,
    
    // Custom callback hook with typed string code
    onTerminate: (code: string) => {
        console.warn(`[TS App] DevTools detected with code: ${code}`);
        // Log to analytics or custom handler before redirect
    }
};

// 2. Interacting with the Public API
document.addEventListener('DOMContentLoaded', () => {
    // Assuming the script is loaded via a <script> tag, DevToolsTerminator is global
    const dt = window.DevToolsTerminator;
    
    if (dt) {
        console.log(`DevTools Terminator v${dt.version} initialized.`);
        
        // Reading from the Readonly config object (IntelliSense will show properties)
        console.log(`Polling interval is set to ${dt.config.checkInterval}ms`);
        
        // Checking current state
        if (dt.isTerminated()) {
            console.error("Session is already burned.");
        }
    } else {
        console.error("DevTools Terminator library not loaded.");
    }
});

// 3. Manual trigger via UI interaction
function triggerManualLockdown(): void {
    if (window.DevToolsTerminator) {
        console.log("Manually executing lockdown...");
        window.DevToolsTerminator.terminate();
    }
}
