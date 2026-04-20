/**
 * DevTools Terminator - Client-Only Edition
 * Version: 2.1.0
 * 
 * A lightweight, zero-dependency browser session protection library.
 * Detects Developer Tools, terminates sessions, and wipes local data.
 * Written in vanilla JS with UMD pattern, strict type checks, and CSP compatibility.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.DevToolsTerminator = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // 1. Atomic state locks to prevent race conditions or infinite termination loops
    let isTerminated = false;
    let hasInitialized = false;
    const intervals = [];

    // 2. Default Configuration
    const defaultConfig = {
        terminationUrl: 'terminated.html',
        checkInterval: 100,
        enableWindowSizeCheck: true,
        enableKeyboardBlock: true,
        disableOnMobile: true,
        onTerminate: null
    };

    function sanitizeConfigValue(rawConfig) {
        const nextConfig = { ...defaultConfig, ...(rawConfig || {}) };
        const parsedInterval = Number.parseInt(nextConfig.checkInterval, 10);
        nextConfig.checkInterval = Number.isFinite(parsedInterval) && parsedInterval >= 50 && parsedInterval <= 5000
            ? parsedInterval
            : defaultConfig.checkInterval;
        nextConfig.terminationUrl = typeof nextConfig.terminationUrl === 'string' && nextConfig.terminationUrl.trim() !== ''
            ? nextConfig.terminationUrl.trim()
            : defaultConfig.terminationUrl;
        nextConfig.enableWindowSizeCheck = Boolean(nextConfig.enableWindowSizeCheck);
        nextConfig.enableKeyboardBlock = Boolean(nextConfig.enableKeyboardBlock);
        nextConfig.disableOnMobile = Boolean(nextConfig.disableOnMobile);
        nextConfig.onTerminate = typeof nextConfig.onTerminate === 'function' ? nextConfig.onTerminate : null;
        return nextConfig;
    }

    let config = sanitizeConfigValue();

    // Extend config from global if exists before freeze
    if (typeof window !== 'undefined' && window.DEVTOOLS_TERMINATOR_CONFIG) {
        config = sanitizeConfigValue(window.DEVTOOLS_TERMINATOR_CONFIG);
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

            // Execute custom callback if provided
            if (typeof config.onTerminate === 'function') {
                try { config.onTerminate(code); } catch(e) {}
            }

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
                const target = e.target && e.target.nodeType === 1 ? e.target : e.target && e.target.parentElement;
                const tagName = target && target.tagName;
                const isInput = tagName === 'INPUT' || 
                                tagName === 'TEXTAREA' || 
                                Boolean(target && target.isContentEditable);
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
        if (typeof window === 'undefined' || hasInitialized) return;
        hasInitialized = true;

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
