/**
 * TypeScript Demo for DevTools Terminator
 * 
 * This file demonstrates how to use DevTools Terminator with TypeScript
 * for full type safety and IntelliSense support.
 * 
 * To use this demo:
 * 1. Install TypeScript: npm install -g typescript
 * 2. Compile: tsc typescript-demo.ts
 * 3. Include compiled JS in your HTML
 */

// Reference the type definitions
/// <reference path="../src/types/devtools-terminator.d.ts" />

// ============================================================================
// EXAMPLE 1: Basic Configuration with Type Safety
// ============================================================================

// Configure before loading the library
// TypeScript will provide autocomplete and type checking
window.DEVTOOLS_TERMINATOR_CONFIG = {
    terminationUrl: 'terminated.html',
    checkInterval: 100,
    enableWindowSizeCheck: true,
    enableKeyboardBlock: true,
    disableOnMobile: false
};

// ============================================================================
// EXAMPLE 2: Partial Configuration (All Properties Optional)
// ============================================================================

// You can configure only what you need
const minimalConfig: DevToolsTerminatorConfig = {
    terminationUrl: '/custom-page.html'
};

window.DEVTOOLS_TERMINATOR_CONFIG = minimalConfig;

// ============================================================================
// EXAMPLE 3: Custom Termination Handler
// ============================================================================

// Type-safe custom handler
const customConfig: DevToolsTerminatorConfig = {
    terminationUrl: 'terminated.html',
    onTerminate: (): void => {
        // Log to analytics
        console.log('DevTools detected at:', new Date().toISOString());
        
        // Send to server
        fetch('/api/security-event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                event: 'devtools_detected',
                timestamp: Date.now(),
                userAgent: navigator.userAgent
            })
        }).catch((error: unknown) => {
            console.error('Failed to log security event:', error);
        });
    }
};

window.DEVTOOLS_TERMINATOR_CONFIG = customConfig;

// ============================================================================
// EXAMPLE 4: Using the Public API
// ============================================================================

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Access the API with full type safety
    const api: DevToolsTerminatorAPI = window.DevToolsTerminator;
    
    // API is always available after script loads
    if (!api) {
        console.warn('DevTools Terminator not loaded yet');
        return;
    }
    
    // Get version (readonly property)
    const version: string = api.version;
    console.log('DevTools Terminator version:', version);
    
    // Get configuration (readonly object)
    const config: Readonly<Required<Omit<DevToolsTerminatorConfig, 'onTerminate'>>> = api.config;
    console.log('Current configuration:', {
        terminationUrl: config.terminationUrl,
        checkInterval: config.checkInterval,
        enableWindowSizeCheck: config.enableWindowSizeCheck,
        enableKeyboardBlock: config.enableKeyboardBlock,
        disableOnMobile: config.disableOnMobile
    });
    
    // Check if terminated
    const isTerminated: boolean = api.isTerminated();
    console.log('Session terminated:', isTerminated);
    
    // Manually trigger termination (if needed)
    // api.terminate();
});

// ============================================================================
// EXAMPLE 5: Conditional Configuration Based on Environment
// ============================================================================

function getEnvironmentConfig(): DevToolsTerminatorConfig {
    const hostname: string = window.location.hostname;
    const isProduction: boolean = hostname !== 'localhost' && hostname !== '127.0.0.1';
    
    if (isProduction) {
        // Strict configuration for production
        return {
            terminationUrl: '/security/terminated.html',
            checkInterval: 50, // Faster detection
            enableWindowSizeCheck: true,
            enableKeyboardBlock: true,
            disableOnMobile: false,
            onTerminate: (): void => {
                // Production logging
                fetch('/api/security/devtools-detected', {
                    method: 'POST',
                    body: JSON.stringify({
                        timestamp: Date.now(),
                        page: window.location.pathname
                    })
                });
            }
        };
    } else {
        // Relaxed configuration for development
        return {
            terminationUrl: 'terminated.html',
            checkInterval: 200, // Slower detection
            enableWindowSizeCheck: false, // Disable to avoid false positives
            enableKeyboardBlock: false, // Allow DevTools in development
            disableOnMobile: true
        };
    }
}

// Apply environment-specific configuration
window.DEVTOOLS_TERMINATOR_CONFIG = getEnvironmentConfig();

// ============================================================================
// EXAMPLE 6: Type-Safe Configuration Builder Pattern
// ============================================================================

class DevToolsConfigBuilder {
    private config: DevToolsTerminatorConfig = {};
    
    setTerminationUrl(url: string): this {
        this.config.terminationUrl = url;
        return this;
    }
    
    setCheckInterval(interval: number): this {
        if (interval < 50) {
            throw new Error('Check interval must be at least 50ms');
        }
        if (interval > 5000) {
            throw new Error('Check interval must be at most 5000ms');
        }
        this.config.checkInterval = interval;
        return this;
    }
    
    enableWindowSizeCheck(enable: boolean = true): this {
        this.config.enableWindowSizeCheck = enable;
        return this;
    }
    
    enableKeyboardBlock(enable: boolean = true): this {
        this.config.enableKeyboardBlock = enable;
        return this;
    }
    
    disableOnMobile(disable: boolean = true): this {
        this.config.disableOnMobile = disable;
        return this;
    }
    
    setTerminateHandler(handler: () => void): this {
        this.config.onTerminate = handler;
        return this;
    }
    
    build(): DevToolsTerminatorConfig {
        return this.config;
    }
}

// Usage
const builtConfig: DevToolsTerminatorConfig = new DevToolsConfigBuilder()
    .setTerminationUrl('/terminated.html')
    .setCheckInterval(100)
    .enableWindowSizeCheck(true)
    .enableKeyboardBlock(true)
    .disableOnMobile(false)
    .setTerminateHandler(() => {
        console.log('Custom termination logic');
    })
    .build();

window.DEVTOOLS_TERMINATOR_CONFIG = builtConfig;

// ============================================================================
// EXAMPLE 7: React Component Integration (TypeScript)
// ============================================================================

// Example React component with DevTools protection
/*
import React, { useEffect, useState } from 'react';

interface DevToolsStatusProps {
    showStatus?: boolean;
}

const DevToolsStatus: React.FC<DevToolsStatusProps> = ({ showStatus = true }) => {
    const [isProtected, setIsProtected] = useState<boolean>(false);
    const [version, setVersion] = useState<string>('');
    
    useEffect(() => {
        // Check if DevTools Terminator is loaded
        if (window.DevToolsTerminator) {
            setIsProtected(true);
            setVersion(window.DevToolsTerminator.version);
        }
    }, []);
    
    if (!showStatus) return null;
    
    return (
        <div className="devtools-status">
            {isProtected ? (
                <div className="protected">
                    <span>[PROTECTED] Protected by DevTools Terminator v{version}</span>
                </div>
            ) : (
                <div className="unprotected">
                    <span>[WARNING] DevTools protection not active</span>
                </div>
            )}
        </div>
    );
};

export default DevToolsStatus;
*/

// ============================================================================
// EXAMPLE 8: Angular Service Integration (TypeScript)
// ============================================================================

// Example Angular service
/*
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DevToolsProtectionService {
    private api: DevToolsTerminatorAPI | null = null;
    
    constructor() {
        this.initialize();
    }
    
    private initialize(): void {
        if (typeof window !== 'undefined' && window.DevToolsTerminator) {
            this.api = window.DevToolsTerminator;
        }
    }
    
    isProtected(): boolean {
        return this.api !== null;
    }
    
    getVersion(): string {
        return this.api?.version || 'Not loaded';
    }
    
    isTerminated(): boolean {
        return this.api?.isTerminated() || false;
    }
    
    getConfig(): Readonly<Required<Omit<DevToolsTerminatorConfig, 'onTerminate'>>> | null {
        return this.api?.config || null;
    }
    
    terminate(): void {
        this.api?.terminate();
    }
}
*/

// ============================================================================
// EXAMPLE 9: Vue Composition API Integration (TypeScript)
// ============================================================================

// Example Vue composable
/*
import { ref, onMounted, Ref } from 'vue';

export function useDevToolsProtection() {
    const isProtected: Ref<boolean> = ref(false);
    const version: Ref<string> = ref('');
    const isTerminated: Ref<boolean> = ref(false);
    
    onMounted(() => {
        if (window.DevToolsTerminator) {
            isProtected.value = true;
            version.value = window.DevToolsTerminator.version;
            isTerminated.value = window.DevToolsTerminator.isTerminated();
        }
    });
    
    const terminate = (): void => {
        window.DevToolsTerminator?.terminate();
    };
    
    return {
        isProtected,
        version,
        isTerminated,
        terminate
    };
}
*/

// ============================================================================
// EXAMPLE 10: Advanced Type Guards and Validation
// ============================================================================

// Type guard to check if DevTools Terminator is loaded
function isDevToolsTerminatorLoaded(): boolean {
    return typeof window !== 'undefined' && 
           typeof window.DevToolsTerminator !== 'undefined';
}

// Safe API access with type guard
function safelyAccessAPI(): DevToolsTerminatorAPI | null {
    if (isDevToolsTerminatorLoaded()) {
        return window.DevToolsTerminator!; // Non-null assertion safe here due to type guard
    }
    console.warn('DevTools Terminator is not loaded');
    return null;
}

// Configuration validator
function validateConfig(config: DevToolsTerminatorConfig): boolean {
    if (config.checkInterval !== undefined && config.checkInterval < 50) {
        console.error('Check interval must be at least 50ms');
        return false;
    }
    
    if (config.terminationUrl !== undefined && !config.terminationUrl.trim()) {
        console.error('Termination URL cannot be empty');
        return false;
    }
    
    return true;
}

// Usage
const myConfig: DevToolsTerminatorConfig = {
    terminationUrl: 'terminated.html',
    checkInterval: 100
};

if (validateConfig(myConfig)) {
    window.DEVTOOLS_TERMINATOR_CONFIG = myConfig;
}

// ============================================================================
// EXAMPLE 11: Testing Helper Functions
// ============================================================================

// Helper to check protection status
function getProtectionStatus(): {
    isLoaded: boolean;
    version: string | null;
    isTerminated: boolean;
    config: Readonly<Required<Omit<DevToolsTerminatorConfig, 'onTerminate'>>> | null;
} {
    const api = safelyAccessAPI();
    
    return {
        isLoaded: api !== null,
        version: api?.version || null,
        isTerminated: api?.isTerminated() || false,
        config: api?.config || null
    };
}

// Usage in tests or debugging
console.log('Protection Status:', getProtectionStatus());

// ============================================================================
// EXAMPLE 12: Error Handling and Fallbacks
// ============================================================================

function setupDevToolsProtectionWithFallback(): void {
    try {
        // Attempt to configure
        const config: DevToolsTerminatorConfig = {
            terminationUrl: 'terminated.html',
            checkInterval: 100,
            onTerminate: (): void => {
                try {
                    // Attempt to log
                    fetch('/api/log', {
                        method: 'POST',
                        body: JSON.stringify({ event: 'devtools_detected' })
                    }).catch((error: Error) => {
                        console.error('Logging failed:', error);
                    });
                } catch (error) {
                    console.error('Termination handler error:', error);
                }
            }
        };
        
        if (validateConfig(config)) {
            window.DEVTOOLS_TERMINATOR_CONFIG = config;
        }
    } catch (error) {
        console.error('Failed to setup DevTools protection:', error);
        // Fallback: basic configuration
        window.DEVTOOLS_TERMINATOR_CONFIG = {
            terminationUrl: 'terminated.html'
        };
    }
}

setupDevToolsProtectionWithFallback();

// ============================================================================
// EXPORT FOR MODULE USAGE
// ============================================================================

export {
    DevToolsConfigBuilder,
    isDevToolsTerminatorLoaded,
    safelyAccessAPI,
    validateConfig,
    getProtectionStatus,
    setupDevToolsProtectionWithFallback
};
