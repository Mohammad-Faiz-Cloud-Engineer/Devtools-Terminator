/**
 * DevTools Terminator - Session Protection Library
 * @version 1.0.0
 * @author Mohammad Faiz
 * @license MIT
 * @description Detects and terminates sessions when browser Developer Tools are opened
 * 
 * Features:
 * - Triple detection system (console logging, window size, keyboard shortcuts)
 * - Instant detection (100ms polling)
 * - Mobile-friendly (smart detection, no false positives)
 * - Complete session cleanup (localStorage, sessionStorage, cookies)
 * - Zero dependencies
 * - Cross-browser compatible
 * 
 * Usage:
 *   <script src="devtools-terminator.js"></script>
 * 
 * Configuration (optional):
 *   window.DEVTOOLS_TERMINATOR_CONFIG = {
 *       terminationUrl: 'terminated.html',
 *       checkInterval: 100,
 *       enableWindowSizeCheck: true,
 *       enableKeyboardBlock: true,
 *       disableOnMobile: false,
 *       onTerminate: function() { }
 *   };
 */

(function() {
    'use strict';
    
    // ==================== CONFIGURATION ====================
    var config = window.DEVTOOLS_TERMINATOR_CONFIG || {};
    
    // Default to terminated.html in same directory, not examples/
    var TERMINATION_URL = config.terminationUrl || 'terminated.html';
    var CHECK_INTERVAL = config.checkInterval || 100;
    var ENABLE_WINDOW_SIZE_CHECK = config.enableWindowSizeCheck !== false;
    var ENABLE_KEYBOARD_BLOCK = config.enableKeyboardBlock !== false;
    var DISABLE_ON_MOBILE = config.disableOnMobile || false;
    var CUSTOM_TERMINATE_HANDLER = config.onTerminate || null;
    
    // ==================== STATE ====================
    var _terminated = false;
    var _devtoolsOpen = false;
    var _monitoringInterval = null;
    var _initialized = false;
    
    // ==================== CORE FUNCTIONS ====================
    
    /**
     * Clear all cookies properly
     */
    function clearAllCookies() {
        try {
            var cookies = document.cookie.split(';');
            var pastDate = 'Thu, 01 Jan 1970 00:00:00 UTC';
            
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i];
                var eqPos = cookie.indexOf('=');
                var name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
                
                // Skip empty cookie names
                if (!name) continue;
                
                // Try multiple combinations to ensure deletion
                document.cookie = name + '=;expires=' + pastDate + ';path=/';
                document.cookie = name + '=;expires=' + pastDate + ';path=/;domain=' + window.location.hostname;
                document.cookie = name + '=;expires=' + pastDate + ';path=/;domain=.' + window.location.hostname;
            }
        } catch (e) {
            // Cookie clearing failed, continue anyway
        }
    }
    
    /**
     * Validate termination URL to prevent XSS
     */
    function isValidTerminationUrl(url) {
        if (!url || typeof url !== 'string') return false;
        
        // Allow relative URLs
        if (url.charAt(0) === '/' || url.charAt(0) === '.') return true;
        
        // Allow http and https only
        if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) return true;
        
        // Block javascript:, data:, vbscript:, file:, etc.
        return false;
    }
    
    /**
     * Terminate session and redirect to termination page
     */
    function terminateSession() {
        if (_terminated) return;
        _terminated = true;
        
        // Stop monitoring immediately - do this first to prevent memory leaks
        try {
            if (_monitoringInterval !== null) {
                clearInterval(_monitoringInterval);
                _monitoringInterval = null;
            }
        } catch (e) {
            // Interval clearing failed, continue anyway
        }
        
        // Execute custom handler if provided (but don't let it block default behavior)
        if (typeof CUSTOM_TERMINATE_HANDLER === 'function') {
            try {
                CUSTOM_TERMINATE_HANDLER();
            } catch (e) {
                // Custom handler failed, continue with default behavior
            }
        }
        
        // Default termination behavior - always runs
        try {
            // Clear all storage
            localStorage.clear();
            sessionStorage.clear();
            
            // Clear all cookies properly
            clearAllCookies();
        } catch (e) {
            // Storage clearing failed, continue anyway
        }
        
        // Validate and redirect to termination page
        var safeUrl = isValidTerminationUrl(TERMINATION_URL) ? TERMINATION_URL : 'about:blank';
        window.location.replace(safeUrl);
    }
    
    // ==================== DETECTION METHOD 1: CONSOLE LOGGING ====================
    
    /**
     * Detection using devtools-detector pattern
     * When DevTools console is open, logging an object triggers property getters
     */
    var element = new Image();
    Object.defineProperty(element, 'id', {
        get: function() {
            _devtoolsOpen = true;
            // Terminate immediately when getter is triggered
            terminateSession();
            return 'devtools-terminator';
        }
    });
    
    function checkDevTools() {
        // Don't reset flag if already terminated (prevents race conditions)
        if (_terminated) return false;
        _devtoolsOpen = false;
        console.log(element);
        console.clear();
        return _devtoolsOpen;
    }
    
    // ==================== DETECTION METHOD 2: WINDOW SIZE ====================
    
    /**
     * Detect if running on iOS device
     * iOS has different viewport behavior that causes false positives
     */
    function isIOSDevice() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
               (navigator.userAgentData && navigator.userAgentData.platform === 'macOS' && navigator.maxTouchPoints > 1);
    }
    
    /**
     * Detect if running on mobile device
     */
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints > 1 && window.innerWidth < 1024);
    }
    
    /**
     * Detection using window size
     * Disabled on iOS/mobile devices due to false positives from:
     * - Dynamic toolbars (Safari address bar hide/show)
     * - Notches and safe areas
     * - Keyboard appearance
     * - Orientation changes
     */
    function checkWindowSize() {
        if (!ENABLE_WINDOW_SIZE_CHECK) return false;
        
        // Skip window size check on iOS and mobile devices - too many false positives
        if (DISABLE_ON_MOBILE && (isIOSDevice() || isMobileDevice())) {
            return false;
        }
        
        // Only check on desktop where this method is reliable
        var widthDiff = window.outerWidth - window.innerWidth;
        var heightDiff = window.outerHeight - window.innerHeight;
        
        if (widthDiff > 160) return true;
        if (heightDiff > 160) return true;
        
        return false;
    }
    
    // ==================== DETECTION METHOD 3: KEYBOARD SHORTCUTS ====================
    
    /**
     * Disable keyboard shortcuts for dev tools - terminate on attempt
     */
    function setupKeyboardProtection() {
        if (!ENABLE_KEYBOARD_BLOCK) return;
        
        document.addEventListener('keydown', function(e) {
            var shouldTerminate = false;
            
            // F12
            if (e.key === 'F12') {
                e.preventDefault();
                shouldTerminate = true;
            }
            // Ctrl+Shift+I (Dev Tools)
            if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
                e.preventDefault();
                shouldTerminate = true;
            }
            // Ctrl+Shift+J (Console)
            if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
                e.preventDefault();
                shouldTerminate = true;
            }
            // Ctrl+Shift+C (Inspect Element)
            if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
                e.preventDefault();
                shouldTerminate = true;
            }
            // Ctrl+U (View Source)
            if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
                e.preventDefault();
                shouldTerminate = true;
            }
            // Ctrl+S (Save Page)
            if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
                e.preventDefault();
                return false;
            }
            // Cmd+Option+I (Mac Dev Tools)
            if (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i')) {
                e.preventDefault();
                shouldTerminate = true;
            }
            // Cmd+Option+J (Mac Console)
            if (e.metaKey && e.altKey && (e.key === 'J' || e.key === 'j')) {
                e.preventDefault();
                shouldTerminate = true;
            }
            // Cmd+Option+U (Mac View Source)
            if (e.metaKey && e.altKey && (e.key === 'U' || e.key === 'u')) {
                e.preventDefault();
                shouldTerminate = true;
            }
            
            if (shouldTerminate) {
                terminateSession();
                return false;
            }
        });
    }
    
    // ==================== ADDITIONAL PROTECTIONS ====================
    
    /**
     * Disable right-click context menu
     */
    function disableContextMenu() {
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
    }
    
    /**
     * Disable drag
     */
    function disableDrag() {
        document.addEventListener('dragstart', function(e) {
            e.preventDefault();
            return false;
        });
    }
    
    /**
     * Disable text selection on sensitive elements
     */
    function disableTextSelection() {
        document.addEventListener('selectstart', function(e) {
            var target = e.target;
            if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
                return true;
            }
            if (target && target.closest && target.closest('pre, code, .protected')) {
                e.preventDefault();
                return false;
            }
        });
    }
    
    // ==================== MONITORING ====================
    
    /**
     * Start monitoring - check frequently for instant detection
     */
    function startMonitoring() {
        // Check every CHECK_INTERVAL ms for near-instant detection
        _monitoringInterval = setInterval(function() {
            if (_terminated) {
                clearInterval(_monitoringInterval);
                _monitoringInterval = null;
                return;
            }
            checkDevTools();
            if (checkWindowSize()) {
                terminateSession();
            }
        }, CHECK_INTERVAL);
    }
    
    // ==================== INITIALIZATION ====================
    
    /**
     * Initialize DevTools Terminator
     */
    function init() {
        // Prevent multiple initialization - set flag immediately to avoid race conditions
        if (_initialized) return;
        _initialized = true;
        
        // Setup protections
        setupKeyboardProtection();
        disableContextMenu();
        disableDrag();
        disableTextSelection();
        
        // Start monitoring
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startMonitoring);
        } else {
            startMonitoring();
        }
    }
    
    // Start immediately
    init();
    
    // ==================== PUBLIC API ====================
    
    /**
     * Expose public API
     */
    window.DevToolsTerminator = {
        version: '1.0.0',
        terminate: terminateSession,
        isTerminated: function() { return _terminated; },
        config: {
            terminationUrl: TERMINATION_URL,
            checkInterval: CHECK_INTERVAL,
            enableWindowSizeCheck: ENABLE_WINDOW_SIZE_CHECK,
            enableKeyboardBlock: ENABLE_KEYBOARD_BLOCK,
            disableOnMobile: DISABLE_ON_MOBILE
        }
    };
    
})();
