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
 *       terminationUrl: '/terminated.html',
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
    const config = window.DEVTOOLS_TERMINATOR_CONFIG || {};
    
    const TERMINATION_URL = config.terminationUrl || '/terminated.html';
    const CHECK_INTERVAL = config.checkInterval || 100;
    const ENABLE_WINDOW_SIZE_CHECK = config.enableWindowSizeCheck !== false;
    const ENABLE_KEYBOARD_BLOCK = config.enableKeyboardBlock !== false;
    const DISABLE_ON_MOBILE = config.disableOnMobile || false;
    const CUSTOM_TERMINATE_HANDLER = config.onTerminate || null;
    
    // ==================== STATE ====================
    let _terminated = false;
    let _devtoolsOpen = false;
    
    // ==================== CORE FUNCTIONS ====================
    
    /**
     * Terminate session and redirect to termination page
     */
    function terminateSession() {
        if (_terminated) return;
        _terminated = true;
        
        // Execute custom handler if provided
        if (typeof CUSTOM_TERMINATE_HANDLER === 'function') {
            try {
                CUSTOM_TERMINATE_HANDLER();
                return; // Let custom handler control the flow
            } catch (e) {
                console.error('Custom terminate handler failed:', e);
            }
        }
        
        // Default termination behavior
        try {
            // Clear all storage
            localStorage.clear();
            sessionStorage.clear();
            
            // Clear all cookies
            document.cookie.split(';').forEach(function(c) {
                document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
            });
        } catch (e) {
            // Storage clearing failed, continue anyway
        }
        
        // Redirect to termination page
        window.location.replace(TERMINATION_URL);
    }
    
    // ==================== DETECTION METHOD 1: CONSOLE LOGGING ====================
    
    /**
     * Detection using devtools-detector pattern
     * When DevTools console is open, logging an object triggers property getters
     */
    const element = new Image();
    Object.defineProperty(element, 'id', {
        get: function() {
            _devtoolsOpen = true;
            // Terminate immediately when getter is triggered
            terminateSession();
        }
    });
    
    function checkDevTools() {
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
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
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
        const widthThreshold = window.outerWidth - window.innerWidth > 160;
        const heightThreshold = window.outerHeight - window.innerHeight > 160;
        return widthThreshold || heightThreshold;
    }
    
    // ==================== DETECTION METHOD 3: KEYBOARD SHORTCUTS ====================
    
    /**
     * Disable keyboard shortcuts for dev tools - terminate on attempt
     */
    function setupKeyboardProtection() {
        if (!ENABLE_KEYBOARD_BLOCK) return;
        
        document.addEventListener('keydown', function(e) {
            let shouldTerminate = false;
            
            // F12
            if (e.key === 'F12' || e.keyCode === 123) {
                e.preventDefault();
                shouldTerminate = true;
            }
            // Ctrl+Shift+I (Dev Tools)
            if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
                e.preventDefault();
                shouldTerminate = true;
            }
            // Ctrl+Shift+J (Console)
            if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
                e.preventDefault();
                shouldTerminate = true;
            }
            // Ctrl+Shift+C (Inspect Element)
            if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
                e.preventDefault();
                shouldTerminate = true;
            }
            // Ctrl+U (View Source)
            if (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
                e.preventDefault();
                shouldTerminate = true;
            }
            // Ctrl+S (Save Page)
            if (e.ctrlKey && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
                e.preventDefault();
                return false;
            }
            // Cmd+Option+I (Mac Dev Tools)
            if (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
                e.preventDefault();
                shouldTerminate = true;
            }
            // Cmd+Option+J (Mac Console)
            if (e.metaKey && e.altKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
                e.preventDefault();
                shouldTerminate = true;
            }
            // Cmd+Option+U (Mac View Source)
            if (e.metaKey && e.altKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
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
            const target = e.target;
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
        setInterval(function() {
            if (_terminated) return;
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
        
        // Log initialization (only in dev mode)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('DevTools Terminator initialized');
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
