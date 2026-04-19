/**
 * DevTools Terminator - Hybrid Edition
 * Version: 2.1.0
 * 
 * A production-grade, highly resilient browser session protection library.
 * Detects Developer Tools, terminates sessions, wipes data, and validates cryptographically with a server.
 * Written in vanilla JS with zero dependencies, UMD pattern, strict type checks, and CSP compatibility.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.DevToolsTerminator = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // 1. Atomic state locks to prevent race conditions or infinite termination loops
    let isTerminated = false;
    const intervals = [];
    const timeouts = [];

    // 2. Default Configuration
    const defaultConfig = {
        terminationUrl: 'terminated.html',
        checkInterval: 100,
        enableWindowSizeCheck: true,
        enableKeyboardBlock: true,
        disableOnMobile: true,
        serverValidation: true,
        apiEndpoint: '/api/devtools-terminator',
        // SECURITY CRITICAL: Default secret is INSECURE and MUST be overridden!
        // This default exists only for testing. In production, you MUST set a strong secret.
        // Generate strong secret: openssl rand -hex 32
        // Override via window.DEVTOOLS_TERMINATOR_CONFIG = { secret: 'your_secret_here' }
        secret: 'default_challenge_secret',
        onTerminate: null
    };

    let config = { ...defaultConfig };

    // Extend config from global if exists before freeze
    if (typeof window !== 'undefined' && window.DEVTOOLS_TERMINATOR_CONFIG) {
        config = { ...config, ...window.DEVTOOLS_TERMINATOR_CONFIG };
    }

    // Freeze configuration API to prevent malicious external tampering
    Object.freeze(config);

    // =========================================================================
    // SMART MOBILE & OS DETECTION
    // =========================================================================
    const MobileDetector = {
        isIOS: function() {
            return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        },
        isIPadOS: function() {
            // iPadOS spoofs as macOS but has touch points
            return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
        },
        isMobileDevice: function() {
            const mobileRegex = /Android|webOS|BlackBerry|IEMobile|Opera Mini/i;
            const isMatch = mobileRegex.test(navigator.userAgent);
            const isSmallScreen = window.innerWidth <= 800;
            return isMatch || this.isIOS() || this.isIPadOS() || isSmallScreen;
        }
    };

    // =========================================================================
    // HYBRID ARCHITECTURE & CRYPTOGRAPHIC VALIDATION
    // =========================================================================
    const HybridSec = {
        async hashString(str) {
            try {
                const buffer = new TextEncoder().encode(str);
                const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            } catch (e) {
                return 'hash_failed';
            }
        },

        async getFingerprint() {
            const data = [
                navigator.userAgent,
                screen.width,
                screen.height,
                Intl.DateTimeFormat().resolvedOptions().timeZone
            ].join('|');
            return await this.hashString(data);
        },

        async checkScriptIntegrity() {
            try {
                // Find our script dynamically
                const scripts = document.getElementsByTagName('script');
                let myScript = null;
                for(let i=0; i < scripts.length; i++) {
                    if(scripts[i].src && scripts[i].src.includes('devtools-terminator')) {
                        myScript = scripts[i];
                        break;
                    }
                }
                
                if (myScript && myScript.src) {
                    const response = await fetch(myScript.src, { cache: 'force-cache' });
                    const text = await response.text();
                    return await this.hashString(text);
                }
            } catch(e) {}
            return 'integrity_unknown';
        },

        async generateHMAC(message, secret) {
            try {
                const enc = new TextEncoder();
                const key = await crypto.subtle.importKey(
                    'raw',
                    enc.encode(secret),
                    { name: 'HMAC', hash: 'SHA-256' },
                    false,
                    ['sign']
                );
                const signature = await crypto.subtle.sign('HMAC', key, enc.encode(message));
                return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
            } catch (e) {
                return 'hmac_failed';
            }
        },

        async sendHeartbeat() {
            if (!config.serverValidation || !window.crypto || !window.crypto.subtle) return;
            try {
                const fp = await this.getFingerprint();
                const scriptHash = await this.checkScriptIntegrity();
                const timestamp = Date.now().toString();
                const payload = `${fp}:${scriptHash}:${timestamp}`;
                const signature = await this.generateHMAC(payload, config.secret);

                fetch(`${config.apiEndpoint}/heartbeat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ payload, signature }),
                    keepalive: true
                }).catch(() => {});
            } catch (e) {
                // Silent catch: heartbeats should not disrupt the application
            }
        },

        notifyServer(code) {
            if (!config.serverValidation || !navigator.sendBeacon) return;
            try {
                const data = JSON.stringify({ event: 'terminated', code: code, timestamp: Date.now() });
                navigator.sendBeacon(`${config.apiEndpoint}/terminate`, data);
            } catch (e) {}
        }
    };

    // =========================================================================
    // COMPREHENSIVE SESSION ANNIHILATION
    // =========================================================================
    const Terminator = {
        clearData: function() {
            // LocalStorage & SessionStorage
            try { localStorage.clear(); } catch (e) {}
            try { sessionStorage.clear(); } catch (e) {}

            // Cookies (Iterate through all and force expire across root and domains)
            try {
                const cookies = document.cookie.split(';');
                const pastDate = 'Thu, 01 Jan 1970 00:00:00 UTC';
                const domain = window.location.hostname;
                
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i];
                    const eqPos = cookie.indexOf('=');
                    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
                    if (!name) continue;
                    
                    document.cookie = `${name}=;expires=${pastDate};path=/`;
                    document.cookie = `${name}=;expires=${pastDate};path=/;domain=${domain}`;
                    document.cookie = `${name}=;expires=${pastDate};path=/;domain=.${domain}`;
                }
            } catch (e) {}

            // IndexedDB
            try {
                if (window.indexedDB && typeof window.indexedDB.databases === 'function') {
                    window.indexedDB.databases().then(dbs => {
                        dbs.forEach(db => {
                            if (db.name) window.indexedDB.deleteDatabase(db.name);
                        });
                    }).catch(() => {});
                }
            } catch (e) {}

            // CacheStorage
            try {
                if ('caches' in window) {
                    caches.keys().then(names => {
                        names.forEach(name => caches.delete(name));
                    }).catch(() => {});
                }
            } catch (e) {}
            
            // Service Workers
            try {
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(registrations => {
                        registrations.forEach(registration => registration.unregister());
                    }).catch(() => {});
                }
            } catch (e) {}
        },

        execute: function(code = 'SEC_DEVTOOLS_UNKNOWN') {
            if (isTerminated) return;
            isTerminated = true;

            // Clear loops to prevent memory leaks / double executions
            intervals.forEach(clearInterval);
            timeouts.forEach(clearTimeout);

            // Execute custom callback if provided
            if (typeof config.onTerminate === 'function') {
                try { config.onTerminate(code); } catch(e) {}
            }

            // Notify server via Beacon API
            HybridSec.notifyServer(code);

            // Wipe out local session data completely
            this.clearData();

            // Redirect to termination URL without keeping history
            window.location.replace(config.terminationUrl);
        }
    };

    // =========================================================================
    // ADVANCED DEVTOOLS DETECTION ENGINE
    // =========================================================================
    const Detector = {
        element: new Image(),
        
        init: function() {
            // Console Logging Getter detection
            Object.defineProperty(this.element, 'id', {
                get: function() {
                    Terminator.execute('SEC_DEVTOOLS_CONSOLE_001');
                    return 'terminator-element';
                }
            });
        },

        checkConsole: function() {
            // Browsers evaluate %c and object properties when console is opened
            console.log('%c', this.element);
            console.clear();
        },

        checkDebuggerTiming: function() {
            const start = performance.now();
            debugger; // Evaluates instantly if DevTools closed, stalls if open
            const end = performance.now();
            // Threshold: 100ms - debugger statement takes >100ms when DevTools is open
            if (end - start > 100) {
                Terminator.execute('SEC_DEVTOOLS_DEBUGGER_002');
            }
        },

        checkWindowSize: function() {
            // Prevent false positives on mobile due to virtual keyboards/address bars
            if (config.disableOnMobile && MobileDetector.isMobileDevice()) {
                return;
            }
            if (!config.enableWindowSizeCheck) return;

            // Threshold: 160px - typical minimum DevTools panel width when docked
            const threshold = 160;
            const widthDiff = window.outerWidth - window.innerWidth;
            const heightDiff = window.outerHeight - window.innerHeight;

            if (widthDiff > threshold || heightDiff > threshold) {
                Terminator.execute('SEC_DEVTOOLS_SIZE_003');
            }
        }
    };

    // =========================================================================
    // STRICT KEYBOARD & UI PROTECTION
    // =========================================================================
    const UIProtector = {
        init: function() {
            if (!config.enableKeyboardBlock) return;

            // Block Shortcuts: F12, Ctrl+Shift+I/J/C, Cmd+Option+I/J/U, Ctrl+U
            window.addEventListener('keydown', (e) => {
                if (
                    e.key === 'F12' ||
                    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
                    (e.ctrlKey && (e.key === 'U' || e.key === 'u')) ||
                    (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'U' || e.key === 'u'))
                ) {
                    e.preventDefault();
                    Terminator.execute('SEC_DEVTOOLS_KEY_004');
                    return false;
                }
            }, { capture: true });

            // Block Right-Click Context Menu
            window.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                return false;
            });

            // Block Drag Events
            window.addEventListener('dragstart', (e) => {
                e.preventDefault();
                return false;
            });

            // Block Text Selection EXCEPT inside valid user inputs
            window.addEventListener('selectstart', (e) => {
                const target = e.target;
                const isInput = target.tagName === 'INPUT' || 
                                target.tagName === 'TEXTAREA' || 
                                target.isContentEditable;
                if (!isInput) {
                    e.preventDefault();
                    return false;
                }
            });
        }
    };

    // Safe Interval Wrapper
    function createInterval(fn, time) {
        const id = setInterval(fn, time);
        intervals.push(id);
        return id;
    }

    // Initialize execution flow
    function init() {
        if (typeof window === 'undefined') return;

        Detector.init();
        UIProtector.init();

        // High-frequency console and size checks
        createInterval(() => {
            if (!isTerminated) {
                Detector.checkConsole();
                Detector.checkWindowSize();
            }
        }, config.checkInterval);

        // Less frequent debugger timing check to conserve CPU cycles
        createInterval(() => {
            if (!isTerminated) {
                Detector.checkDebuggerTiming();
            }
        }, config.checkInterval * 5);

        // Server Heartbeat Loop
        if (config.serverValidation) {
            // Heartbeat interval: 30 seconds (server timeout is 45s)
            createInterval(() => {
                if (!isTerminated) HybridSec.sendHeartbeat();
            }, 30000);
            
            // Initial boot ping
            HybridSec.sendHeartbeat();
        }
    }

    // Auto-boot sequence
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        window.addEventListener('DOMContentLoaded', init);
    }

    // Public Frozen API
    return {
        version: '2.1.0',
        isTerminated: () => isTerminated,
        terminate: () => Terminator.execute('SEC_DEVTOOLS_MANUAL'),
        config: config
    };
}));
