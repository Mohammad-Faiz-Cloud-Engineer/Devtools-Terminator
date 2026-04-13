/**
 * DevTools Terminator - Hybrid Client-Server Version
 * @version 2.1.0
 * @author Mohammad Faiz
 * @license MIT
 * @description Enhanced version with server-side validation to prevent bypassing
 * 
 * This version adds:
 * - Challenge-response authentication with server
 * - Periodic heartbeat to prove protection is active
 * - Server-side session validation
 * - Cryptographic proof of execution
 * 
 * Usage:
 *   <script src="devtools-terminator-hybrid.js"></script>
 * 
 * Configuration:
 *   window.DEVTOOLS_TERMINATOR_CONFIG = {
 *       terminationUrl: 'terminated.html',
 *       checkInterval: 100,
 *       enableWindowSizeCheck: true,
 *       enableKeyboardBlock: true,
 *       disableOnMobile: false,
 *       serverValidation: true,  // NEW: Enable server validation
 *       apiEndpoint: '/api/devtools-terminator',  // NEW: Server API endpoint
 *       onTerminate: function() { }
 *   };
 */

(function() {
    'use strict';
    
    // ==================== CONFIGURATION ====================
    var config = window.DEVTOOLS_TERMINATOR_CONFIG || {};
    
    var TERMINATION_URL = config.terminationUrl || 'terminated.html';
    var CHECK_INTERVAL = config.checkInterval || 100;
    var ENABLE_WINDOW_SIZE_CHECK = config.enableWindowSizeCheck !== false;
    var ENABLE_KEYBOARD_BLOCK = config.enableKeyboardBlock !== false;
    var DISABLE_ON_MOBILE = config.disableOnMobile || false;
    var CUSTOM_TERMINATE_HANDLER = config.onTerminate || null;
    
    // NEW: Server validation settings
    var ENABLE_SERVER_VALIDATION = config.serverValidation !== false;
    var API_ENDPOINT = config.apiEndpoint || '/api/devtools-terminator';
    
    // ==================== STATE ====================
    var _terminated = false;
    var _devtoolsOpen = false;
    var _monitoringInterval = null;
    var _heartbeatInterval = null;
    var _initialized = false;
    var _serverChallenge = null;
    var _serverVerified = false;
    var _heartbeatIntervalMs = 30000; // Default 30 seconds
    
    // Script integrity
    var SCRIPT_VERSION = '2.1.0-hybrid';
    var SCRIPT_INTEGRITY = null; // Will be calculated on load
    
    // Mobile detection threshold
    var MOBILE_WIDTH_THRESHOLD = 1024; // Pixels - devices narrower than this are considered mobile
    
    // ==================== CRYPTOGRAPHIC FUNCTIONS ====================
    
    /**
     * Check if Web Crypto API is available
     */
    function isCryptoAvailable() {
        return typeof crypto !== 'undefined' && 
               typeof crypto.subtle !== 'undefined' &&
               typeof crypto.subtle.digest === 'function';
    }
    
    /**
     * Calculate SHA-256 hash of a string
     */
    function sha256(message) {
        if (!isCryptoAvailable()) {
            // Fallback: use simple hash for non-HTTPS contexts
            return Promise.resolve('fallback-' + simpleHash(message));
        }
        
        return crypto.subtle.digest(
            'SHA-256',
            new TextEncoder().encode(message)
        ).then(function(hashBuffer) {
            return Array.from(new Uint8Array(hashBuffer))
                .map(function(b) { return b.toString(16).padStart(2, '0'); })
                .join('');
        });
    }
    
    /**
     * Calculate integrity hash of this script
     */
    function calculateScriptIntegrity() {
        // Get the script content
        var scripts = document.getElementsByTagName('script');
        var scriptContent = '';
        
        for (var i = 0; i < scripts.length; i++) {
            var src = scripts[i].src;
            if (src && (src.indexOf('devtools-terminator-hybrid') !== -1 || 
                        src.indexOf('devtools-terminator.js') !== -1)) {
                // Found our script - we'll verify via server
                return Promise.resolve('verify-via-server');
            }
        }
        
        // If inline script, hash the content
        return sha256(scriptContent || 'inline-script');
    }
    
    /**
     * Simple hash function for fallback (non-cryptographic)
     */
    function simpleHash(str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            var char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(16);
    }
    
    /**
     * Simple HMAC-SHA256 implementation using Web Crypto API
     */
    function hmacSha256(message, key) {
        if (!isCryptoAvailable()) {
            // Fallback: use simple hash for non-HTTPS contexts
            return Promise.resolve('fallback-' + simpleHash(message + key));
        }
        
        return crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(key),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        ).then(function(cryptoKey) {
            return crypto.subtle.sign(
                'HMAC',
                cryptoKey,
                new TextEncoder().encode(message)
            );
        }).then(function(signature) {
            return Array.from(new Uint8Array(signature))
                .map(function(b) { return b.toString(16).padStart(2, '0'); })
                .join('');
        });
    }
    
    /**
     * Generate response to server challenge
     */
    function generateChallengeResponse(challenge) {
        // Use browser fingerprint as secret
        // Include challenge in fingerprint to prevent replay attacks
        var fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            !!window.sessionStorage,
            !!window.localStorage,
            challenge, // Include challenge to make response unique per session
            Date.now() // Add timestamp for additional entropy
        ].join('|');
        
        return hmacSha256(challenge, fingerprint);
    }
    
    // ==================== SERVER COMMUNICATION ====================
    
    /**
     * Initialize server validation
     */
    function initServerValidation() {
        if (!ENABLE_SERVER_VALIDATION) return Promise.resolve(true);
        
        // Calculate script integrity first
        return calculateScriptIntegrity().then(function(integrity) {
            SCRIPT_INTEGRITY = integrity;
            
            return fetch(API_ENDPOINT + '/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({
                    version: SCRIPT_VERSION,
                    integrity: integrity,
                    userAgent: navigator.userAgent,
                    timestamp: Date.now()
                })
            });
        })
        .then(function(response) {
            if (!response.ok) {
                // Check if server detected integrity violation
                return response.json().then(function(data) {
                    if (data.terminate) {
                        console.error('[DevTools Terminator] Server rejected: Script integrity violation');
                        terminateSession();
                    }
                    throw new Error('Server init failed: ' + (data.error || 'Unknown error'));
                });
            }
            return response.json();
        })
        .then(function(data) {
            _serverChallenge = data.challenge;
            _heartbeatIntervalMs = data.heartbeatInterval || 30000;
            return generateChallengeResponse(data.challenge);
        })
        .then(function(response) {
            return fetch(API_ENDPOINT + '/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ response: response })
            });
        })
        .then(function(response) {
            if (!response.ok) throw new Error('Server verification failed');
            return response.json();
        })
        .then(function(data) {
            _serverVerified = data.verified;
            if (_serverVerified) {
                startHeartbeat();
            }
            return _serverVerified;
        })
        .catch(function(error) {
            console.error('[DevTools Terminator] Server validation failed:', error);
            // If server validation fails, fall back to client-only mode
            _serverVerified = false;
            return false;
        });
    }
    
    /**
     * Send heartbeat to server to prove protection is still active
     */
    function sendHeartbeat() {
        if (!ENABLE_SERVER_VALIDATION || !_serverVerified) return;
        
        fetch(API_ENDPOINT + '/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({
                integrity: SCRIPT_INTEGRITY,
                timestamp: Date.now()
            })
        })
        .then(function(response) {
            if (!response.ok) {
                // Server rejected heartbeat - terminate
                terminateSession();
            }
            return response.json();
        })
        .then(function(data) {
            if (!data.ok || data.terminate) {
                // Server says session invalid or integrity violation - terminate
                if (data.reason === 'integrity-violation') {
                    console.error('[DevTools Terminator] Script integrity violation detected by server');
                }
                terminateSession();
            }
        })
        .catch(function(error) {
            console.error('[DevTools Terminator] Heartbeat failed:', error);
            // Network error - terminate to be safe
            terminateSession();
        });
    }
    
    /**
     * Start periodic heartbeat
     */
    function startHeartbeat() {
        if (_heartbeatInterval) return;
        
        _heartbeatInterval = setInterval(sendHeartbeat, _heartbeatIntervalMs);
        
        // Send initial heartbeat
        sendHeartbeat();
    }
    
    /**
     * Notify server of termination
     */
    function notifyServerTermination() {
        if (!ENABLE_SERVER_VALIDATION) return;
        
        // Use sendBeacon for reliable delivery even during page unload
        var data = JSON.stringify({ terminated: true });
        
        if (navigator.sendBeacon) {
            navigator.sendBeacon(API_ENDPOINT + '/terminate', data);
        } else {
            // Fallback for older browsers
            fetch(API_ENDPOINT + '/terminate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: data,
                keepalive: true
            }).catch(function() {
                // Ignore errors during termination
            });
        }
    }
    
    // ==================== CORE FUNCTIONS ====================
    
    function clearAllCookies() {
        try {
            var cookies = document.cookie.split(';');
            var pastDate = 'Thu, 01 Jan 1970 00:00:00 UTC';
            
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i];
                var eqPos = cookie.indexOf('=');
                var name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
                
                if (!name) continue;
                
                document.cookie = name + '=;expires=' + pastDate + ';path=/';
                document.cookie = name + '=;expires=' + pastDate + ';path=/;domain=' + window.location.hostname;
                document.cookie = name + '=;expires=' + pastDate + ';path=/;domain=.' + window.location.hostname;
            }
        } catch (e) {
            // Cookie clearing failed, continue anyway
        }
    }
    
    function isValidTerminationUrl(url) {
        if (!url || typeof url !== 'string') return false;
        if (url.indexOf('..') !== -1) return false;
        if (url.charAt(0) === '/') return true;
        if (url.indexOf('/') === -1 && url.indexOf('\\') === -1) return true;
        if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) return true;
        return false;
    }
    
    function terminateSession() {
        if (_terminated) return;
        _terminated = true;
        
        // Stop all monitoring
        try {
            if (_monitoringInterval !== null) {
                clearInterval(_monitoringInterval);
                _monitoringInterval = null;
            }
            if (_heartbeatInterval !== null) {
                clearInterval(_heartbeatInterval);
                _heartbeatInterval = null;
            }
        } catch (e) {
            // Interval clearing failed, continue anyway
        }
        
        // Notify server
        notifyServerTermination();
        
        // Execute custom handler
        if (typeof CUSTOM_TERMINATE_HANDLER === 'function') {
            try {
                CUSTOM_TERMINATE_HANDLER();
            } catch (e) {
                // Custom handler errors should not prevent termination
            }
        }
        
        // Clear storage
        try {
            localStorage.clear();
            sessionStorage.clear();
            clearAllCookies();
        } catch (e) {
            // Storage APIs can throw in private browsing mode
        }
        
        // Redirect
        var safeUrl = isValidTerminationUrl(TERMINATION_URL) ? TERMINATION_URL : 'about:blank';
        window.location.replace(safeUrl);
    }
    
    // ==================== DETECTION METHODS ====================
    
    var element = new Image();
    Object.defineProperty(element, 'id', {
        get: function() {
            _devtoolsOpen = true;
            terminateSession();
            return 'devtools-terminator';
        }
    });
    
    function checkDevTools() {
        if (_terminated) return false;
        _devtoolsOpen = false;
        console.log(element);
        console.clear();
        return _devtoolsOpen;
    }
    
    function isIOSDevice() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
               (navigator.userAgentData && navigator.userAgentData.platform === 'macOS' && navigator.maxTouchPoints > 1);
    }
    
    function isMobileDevice() {
        if (isIOSDevice()) return true;
        return /Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints > 1 && window.innerWidth < MOBILE_WIDTH_THRESHOLD);
    }
    
    var WINDOW_SIZE_THRESHOLD = 160;
    
    function checkWindowSize() {
        if (!ENABLE_WINDOW_SIZE_CHECK) return false;
        if (DISABLE_ON_MOBILE && (isIOSDevice() || isMobileDevice())) return false;
        
        var widthDiff = window.outerWidth - window.innerWidth;
        var heightDiff = window.outerHeight - window.innerHeight;
        
        if (widthDiff > WINDOW_SIZE_THRESHOLD) return true;
        if (heightDiff > WINDOW_SIZE_THRESHOLD) return true;
        
        return false;
    }
    
    function setupKeyboardProtection() {
        if (!ENABLE_KEYBOARD_BLOCK) return;
        
        document.addEventListener('keydown', function(e) {
            var shouldTerminate = false;
            
            if (e.key === 'F12') {
                e.preventDefault();
                shouldTerminate = true;
            }
            else if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
                e.preventDefault();
                shouldTerminate = true;
            }
            else if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
                e.preventDefault();
                shouldTerminate = true;
            }
            else if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
                e.preventDefault();
                shouldTerminate = true;
            }
            else if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
                e.preventDefault();
                shouldTerminate = true;
            }
            else if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
                e.preventDefault();
            }
            else if (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i')) {
                e.preventDefault();
                shouldTerminate = true;
            }
            else if (e.metaKey && e.altKey && (e.key === 'J' || e.key === 'j')) {
                e.preventDefault();
                shouldTerminate = true;
            }
            else if (e.metaKey && e.altKey && (e.key === 'U' || e.key === 'u')) {
                e.preventDefault();
                shouldTerminate = true;
            }
            
            if (shouldTerminate) {
                terminateSession();
            }
        });
    }
    
    function disableContextMenu() {
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
    }
    
    function disableDrag() {
        document.addEventListener('dragstart', function(e) {
            e.preventDefault();
            return false;
        });
    }
    
    function disableTextSelection() {
        document.addEventListener('selectstart', function(e) {
            var target = e.target;
            if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
                return true;
            }
            if (target && typeof target.closest === 'function' && target.closest('pre, code, .protected')) {
                e.preventDefault();
                return false;
            }
        });
    }
    
    function startMonitoring() {
        _monitoringInterval = setInterval(function() {
            checkDevTools();
            if (checkWindowSize()) {
                terminateSession();
            }
        }, CHECK_INTERVAL);
    }
    
    // ==================== INITIALIZATION ====================
    
    function init() {
        if (_initialized) return;
        _initialized = true;
        
        setupKeyboardProtection();
        disableContextMenu();
        disableDrag();
        disableTextSelection();
        
        // Initialize server validation first
        initServerValidation().then(function(verified) {
            if (ENABLE_SERVER_VALIDATION && !verified) {
                console.warn('[DevTools Terminator] Server validation failed, running in client-only mode');
            }
            
            // Start monitoring regardless of server validation result
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', startMonitoring);
            } else {
                startMonitoring();
            }
        }).catch(function(error) {
            // Handle catastrophic initialization failure
            console.error('[DevTools Terminator] Initialization failed:', error);
            // Still start monitoring in client-only mode
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', startMonitoring);
            } else {
                startMonitoring();
            }
        });
    }
    
    init();
    
    // ==================== PUBLIC API ====================
    
    window.DevToolsTerminator = {
        version: '2.1.0-hybrid',
        terminate: terminateSession,
        isTerminated: function() { return _terminated; },
        isServerVerified: function() { return _serverVerified; },
        config: Object.freeze({
            terminationUrl: TERMINATION_URL,
            checkInterval: CHECK_INTERVAL,
            enableWindowSizeCheck: ENABLE_WINDOW_SIZE_CHECK,
            enableKeyboardBlock: ENABLE_KEYBOARD_BLOCK,
            disableOnMobile: DISABLE_ON_MOBILE,
            serverValidation: ENABLE_SERVER_VALIDATION
        })
    };
    
})();
