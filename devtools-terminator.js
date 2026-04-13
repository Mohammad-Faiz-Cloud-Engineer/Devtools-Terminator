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
    
    // ==================== ENVIRONMENT CHECK ====================
    if (typeof window === 'undefined') {
        return; // Exit safely in SSR environments (Node.js, Next.js, etc.)
    }

    // ==================== CONSTANTS ====================
    var DEFAULT_TERMINATION_URL = 'terminated.html';
    var DEFAULT_CHECK_INTERVAL = 100;
    var WINDOW_SIZE_THRESHOLD = 160;
    var MOBILE_WIDTH_THRESHOLD = 1024;
    var PAST_DATE_STRING = 'Thu, 01 Jan 1970 00:00:00 UTC';
    
    // ==================== CONFIGURATION ====================
    var config = window.DEVTOOLS_TERMINATOR_CONFIG || {};
    
    // Default to terminated.html in same directory, not examples/
    var TERMINATION_URL = config.terminationUrl || DEFAULT_TERMINATION_URL;
    var CHECK_INTERVAL = typeof config.checkInterval === 'number' ? config.checkInterval : DEFAULT_CHECK_INTERVAL;
    var ENABLE_WINDOW_SIZE_CHECK = config.enableWindowSizeCheck !== false;
    var ENABLE_KEYBOARD_BLOCK = config.enableKeyboardBlock !== false;
    var DISABLE_ON_MOBILE = Boolean(config.disableOnMobile);
    var CUSTOM_TERMINATE_HANDLER = typeof config.onTerminate === 'function' ? config.onTerminate : null;
    
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
            
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i];
                var eqPos = cookie.indexOf('=');
                var name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
                
                // Skip empty cookie names
                if (!name) continue;
                
                // Try multiple combinations to ensure deletion
                document.cookie = name + '=;expires=' + PAST_DATE_STRING + ';path=/';
                document.cookie = name + '=;expires=' + PAST_DATE_STRING + ';path=/;domain=' + window.location.hostname;
                document.cookie = name + '=;expires=' + PAST_DATE_STRING + ';path=/;domain=.' + window.location.hostname;
            }
        } catch (error) {
            console.error('DevTools Terminator: Cookie clearing failed', error);
        }
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
        } catch (error) {
            console.error('DevTools Terminator: Interval clearing failed', error);
        }
        
        // Execute custom handler if provided (but don't let it block default behavior)
        if (CUSTOM_TERMINATE_HANDLER) {
            try {
                CUSTOM_TERMINATE_HANDLER();
            } catch (error) {
                console.error('DevTools Terminator: Custom termination handler failed', error);
            }
        }
        
        // Default termination behavior - always runs
        try {
            // Clear all storage
            localStorage.clear();
            sessionStorage.clear();
            
            // Clear all cookies properly
            clearAllCookies();
        } catch (error) {
            console.error('DevTools Terminator: Storage clearing failed', error);
        }
        
        // Redirect to termination page
        window.location.replace(TERMINATION_URL);
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
        var userAgent = navigator.userAgent;
        return /iPad|iPhone|iPod/.test(userAgent) || 
               (navigator.userAgentData && navigator.userAgentData.platform === 'macOS' && navigator.maxTouchPoints > 1);
    }
    
    /**
     * Detect if running on mobile device
     */
    function isMobileDevice() {
        var userAgent = navigator.userAgent;
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
               (navigator.maxTouchPoints > 1 && window.innerWidth < MOBILE_WIDTH_THRESHOLD);
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
        var widthThreshold = window.outerWidth - window.innerWidth > WINDOW_SIZE_THRESHOLD;
        var heightThreshold = window.outerHeight - window.innerHeight > WINDOW_SIZE_THRESHOLD;
        return widthThreshold || heightThreshold;
    }
    
    // ==================== DETECTION METHOD 3: KEYBOARD SHORTCUTS ====================
    
    /**
     * Disable keyboard shortcuts for dev tools - terminate on attempt
     */
    function setupKeyboardProtection() {
        if (!ENABLE_KEYBOARD_BLOCK) return;
        
        document.addEventListener('keydown', function(event) {
            var shouldTerminate = false;
            
            // F12
            if (event.key === 'F12') {
                event.preventDefault();
                shouldTerminate = true;
            }
            // Ctrl+Shift+I (Dev Tools)
            if (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'i')) {
                event.preventDefault();
                shouldTerminate = true;
            }
            // Ctrl+Shift+J (Console)
            if (event.ctrlKey && event.shiftKey && (event.key === 'J' || event.key === 'j')) {
                event.preventDefault();
                shouldTerminate = true;
            }
            // Ctrl+Shift+C (Inspect Element)
            if (event.ctrlKey && event.shiftKey && (event.key === 'C' || event.key === 'c')) {
                event.preventDefault();
                shouldTerminate = true;
            }
            // Ctrl+U (View Source)
            if (event.ctrlKey && (event.key === 'U' || event.key === 'u')) {
                event.preventDefault();
                shouldTerminate = true;
            }
            // Ctrl+S (Save Page)
            if (event.ctrlKey && (event.key === 'S' || event.key === 's')) {
                event.preventDefault();
                return false;
            }
            // Cmd+Option+I (Mac Dev Tools)
            if (event.metaKey && event.altKey && (event.key === 'I' || event.key === 'i')) {
                event.preventDefault();
                shouldTerminate = true;
            }
            // Cmd+Option+J (Mac Console)
            if (event.metaKey && event.altKey && (event.key === 'J' || event.key === 'j')) {
                event.preventDefault();
                shouldTerminate = true;
            }
            // Cmd+Option+U (Mac View Source)
            if (event.metaKey && event.altKey && (event.key === 'U' || event.key === 'u')) {
                event.preventDefault();
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
        document.addEventListener('contextmenu', function(event) {
            event.preventDefault();
            return false;
        });
    }
    
    /**
     * Disable drag
     */
    function disableDrag() {
        document.addEventListener('dragstart', function(event) {
            event.preventDefault();
            return false;
        });
    }
    
    /**
     * Disable text selection on sensitive elements
     */
    function disableTextSelection() {
        document.addEventListener('selectstart', function(event) {
            var target = event.target;
            if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
                return true;
            }
            if (target && typeof target.closest === 'function' && target.closest('pre, code, .protected')) {
                event.preventDefault();
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
        // Prevent multiple initialization - set flag immediately
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
