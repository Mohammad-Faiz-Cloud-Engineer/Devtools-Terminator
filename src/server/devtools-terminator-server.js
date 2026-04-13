/**
 * DevTools Terminator - Server-Side Validation Module
 * @version 2.1.0
 * @author Mohammad Faiz
 * @license MIT
 * 
 * This is a Node.js/Express middleware that works WITH the client-side library
 * to provide server-side enforcement and validation.
 * 
 * IMPORTANT: This does NOT detect DevTools server-side (impossible).
 * Instead, it validates that the client-side protection is active and responding.
 * 
 * Usage:
 *   const devtoolsTerminator = require('./devtools-terminator-server');
 *   app.use(devtoolsTerminator.middleware(options));
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Calculate SHA-256 hash of file
 */
function calculateFileHash(filePath) {
    try {
        // Validate path to prevent traversal
        const resolvedPath = path.resolve(filePath);
        const content = fs.readFileSync(resolvedPath, 'utf8');
        return crypto.createHash('sha256').update(content).digest('hex');
    } catch (e) {
        console.error('[DevTools Terminator] Failed to calculate hash for:', filePath, e.message);
        return null;
    }
}

/**
 * Store of valid script hashes
 */
const VALID_SCRIPT_HASHES = new Set();

/**
 * Initialize valid script hashes
 */
function initializeScriptHashes(scriptPaths) {
    if (!scriptPaths || scriptPaths.length === 0) {
        // Default paths
        scriptPaths = [
            path.join(__dirname, '..', 'client', 'devtools-terminator-hybrid.js'),
            path.join(__dirname, '..', 'client', 'devtools-terminator.js')
        ];
    }
    
    // Validate paths to prevent directory traversal
    // SECURITY: Resolve base path first, then validate each script path
    const basePath = path.resolve(__dirname, '..');
    
    scriptPaths.forEach(function(scriptPath) {
        const resolvedPath = path.resolve(scriptPath);
        
        // Security: Ensure resolved path is within allowed directory
        // Must check if resolvedPath starts with basePath followed by separator
        const normalizedBase = basePath + path.sep;
        const normalizedResolved = resolvedPath + path.sep;
        
        if (!normalizedResolved.startsWith(normalizedBase) && resolvedPath !== basePath) {
            console.warn('[DevTools Terminator] WARNING: Skipping path outside base directory:', scriptPath);
            return;
        }
        
        const hash = calculateFileHash(resolvedPath);
        if (hash) {
            VALID_SCRIPT_HASHES.add(hash);
            console.log('[DevTools Terminator] Registered script hash:', hash.substring(0, 16) + '...');
        }
    });
    
    if (VALID_SCRIPT_HASHES.size === 0) {
        console.warn('[DevTools Terminator] WARNING: No valid script hashes registered. Integrity checking disabled.');
    }
}

/**
 * Verify script integrity
 */
function verifyScriptIntegrity(integrity, userAgent) {
    // If no hashes registered, skip verification
    if (VALID_SCRIPT_HASHES.size === 0) {
        return { valid: true, reason: 'no-hashes-registered' };
    }
    
    // Special case: client will fetch and verify
    if (integrity === 'verify-via-server') {
        return { valid: true, reason: 'external-script' };
    }
    
    // Check if hash matches any valid script
    if (VALID_SCRIPT_HASHES.has(integrity)) {
        return { valid: true, reason: 'hash-match' };
    }
    
    // Hash mismatch - script has been modified
    return { 
        valid: false, 
        reason: 'hash-mismatch',
        expected: Array.from(VALID_SCRIPT_HASHES),
        received: integrity
    };
}

/**
 * Generate a cryptographic challenge
 */
function generateChallenge() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate expected response for a challenge
 */
function generateResponse(challenge, secret) {
    return crypto
        .createHmac('sha256', secret)
        .update(challenge)
        .digest('hex');
}

/**
 * Session store for tracking protected sessions
 */
class SessionStore {
    constructor() {
        this.sessions = new Map();
        this.challenges = new Map();
        this.cleanupInterval = null;
        
        // Cleanup old sessions every 5 minutes
        this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
    
    /**
     * Destroy the session store and cleanup resources
     */
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.sessions.clear();
        this.challenges.clear();
    }
    
    createSession(sessionId, metadata) {
        const challenge = generateChallenge();
        this.sessions.set(sessionId, {
            challenge: challenge,
            verified: false,
            lastHeartbeat: Date.now(),
            createdAt: Date.now(),
            metadata: metadata || {}
        });
        return challenge;
    }
    
    verifySession(sessionId, response, secret) {
        const session = this.sessions.get(sessionId);
        if (!session) return false;
        
        const expectedResponse = generateResponse(session.challenge, secret);
        
        // Prevent timing attack: check lengths first
        if (response.length !== expectedResponse.length) {
            return false;
        }
        
        // Use timing-safe comparison
        const isValid = crypto.timingSafeEqual(
            Buffer.from(response),
            Buffer.from(expectedResponse)
        );
        
        if (isValid) {
            session.verified = true;
            session.lastHeartbeat = Date.now();
        }
        
        return isValid;
    }
    
    updateHeartbeat(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session && session.verified) {
            session.lastHeartbeat = Date.now();
            return true;
        }
        return false;
    }
    
    isSessionValid(sessionId, maxAge = 60000) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.verified) return false;
        
        const age = Date.now() - session.lastHeartbeat;
        return age < maxAge;
    }
    
    cleanup() {
        const now = Date.now();
        const maxAge = 10 * 60 * 1000; // 10 minutes
        
        for (const [sessionId, session] of this.sessions.entries()) {
            if (now - session.lastHeartbeat > maxAge) {
                this.sessions.delete(sessionId);
            }
        }
    }
    
    terminateSession(sessionId) {
        this.sessions.delete(sessionId);
    }
}

const store = new SessionStore();

/**
 * Middleware factory
 */
function middleware(options = {}) {
    const config = {
        secret: options.secret || process.env.DEVTOOLS_SECRET || crypto.randomBytes(32).toString('hex'),
        heartbeatInterval: options.heartbeatInterval || 30000, // 30 seconds
        maxHeartbeatAge: options.maxHeartbeatAge || 60000, // 60 seconds
        protectedPaths: options.protectedPaths || ['/'], // Paths to protect
        excludePaths: options.excludePaths || ['/api/devtools-terminator'], // Paths to exclude
        terminationUrl: options.terminationUrl || '/terminated',
        onTerminate: options.onTerminate || null,
        bypassHeader: options.bypassHeader || null, // For testing: 'X-DevTools-Bypass'
        scriptPaths: options.scriptPaths || null, // Paths to valid scripts
        enforceIntegrity: options.enforceIntegrity !== false, // Enable integrity checking
        onIntegrityViolation: options.onIntegrityViolation || null // Callback for integrity violations
    };
    
    // Initialize script hashes
    if (config.enforceIntegrity) {
        initializeScriptHashes(config.scriptPaths);
    }
    
    // Warn if using default secret
    if (!options.secret && !process.env.DEVTOOLS_SECRET) {
        console.warn('[DevTools Terminator] WARNING: Using auto-generated secret. Set DEVTOOLS_SECRET env variable for production.');
    }
    
    return function devtoolsTerminatorMiddleware(req, res, next) {
        // Skip excluded paths
        if (config.excludePaths.some(path => req.path.startsWith(path))) {
            return next();
        }
        
        // Bypass for testing (only if explicitly enabled)
        if (config.bypassHeader && req.headers[config.bypassHeader.toLowerCase()]) {
            return next();
        }
        
        // Check if path should be protected
        const shouldProtect = config.protectedPaths.some(path => 
            req.path === path || req.path.startsWith(path + '/')
        );
        
        if (!shouldProtect) {
            return next();
        }
        
        // Get or create session ID
        // SECURITY: Never use IP as session ID (session fixation vulnerability)
        // CRITICAL: In production, you MUST use express-session or similar
        let sessionId = req.session?.id || req.cookies?.sessionId;
        
        if (!sessionId) {
            // SECURITY RISK: No proper session management detected
            // This is a critical security issue in production
            // Generate temporary ID but log warning
            sessionId = 'temp-' + crypto.randomBytes(32).toString('hex');
            console.error('[DevTools Terminator] CRITICAL: No session management configured!');
            console.error('Install and configure express-session for production use.');
            console.error('Example: app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }))');
        }
        
        // Handle API endpoints
        // NOTE: These endpoints should be rate-limited in production to prevent brute force attacks
        // Recommended: 10 requests per minute per IP for /init and /verify endpoints
        // Example with express-rate-limit:
        //   const rateLimit = require('express-rate-limit');
        //   app.use('/api/devtools-terminator', rateLimit({ windowMs: 60000, max: 10 }));
        
        if (req.path === '/api/devtools-terminator/init') {
            const { version, integrity, userAgent, timestamp } = req.body;
            
            // Verify script integrity
            if (config.enforceIntegrity && integrity) {
                const verification = verifyScriptIntegrity(integrity, userAgent);
                
                if (!verification.valid) {
                    console.error('[DevTools Terminator] SECURITY ALERT: Script integrity violation');
                    console.error('Session ID:', sessionId);
                    console.error('IP:', req.ip);
                    console.error('User Agent:', userAgent);
                    console.error('Reason:', verification.reason);
                    console.error('Expected:', verification.expected);
                    console.error('Received:', verification.received);
                    
                    // Call custom handler
                    if (typeof config.onIntegrityViolation === 'function') {
                        config.onIntegrityViolation(req, sessionId, verification);
                    }
                    
                    // Terminate immediately
                    return res.status(403).json({ 
                        error: 'Script integrity violation',
                        terminate: true
                    });
                }
            }
            
            const challenge = store.createSession(sessionId, {
                version: version,
                integrity: integrity,
                userAgent: userAgent,
                initialTimestamp: timestamp
            });
            
            return res.json({
                challenge: challenge,
                heartbeatInterval: config.heartbeatInterval
            });
        }
        
        if (req.path === '/api/devtools-terminator/verify') {
            const { response } = req.body;
            if (!response) {
                return res.status(400).json({ error: 'Missing response' });
            }
            
            const isValid = store.verifySession(sessionId, response, config.secret);
            return res.json({ verified: isValid });
        }
        
        if (req.path === '/api/devtools-terminator/heartbeat') {
            const { integrity, timestamp } = req.body;
            
            // Verify integrity on every heartbeat
            if (config.enforceIntegrity && integrity) {
                const verification = verifyScriptIntegrity(integrity);
                
                if (!verification.valid) {
                    console.error('[DevTools Terminator] SECURITY ALERT: Script modified during session');
                    console.error('Session ID:', sessionId);
                    console.error('IP:', req.ip);
                    
                    // Terminate session
                    store.terminateSession(sessionId);
                    
                    if (typeof config.onIntegrityViolation === 'function') {
                        config.onIntegrityViolation(req, sessionId, verification);
                    }
                    
                    return res.status(403).json({ 
                        ok: false,
                        terminate: true,
                        reason: 'integrity-violation'
                    });
                }
            }
            
            const updated = store.updateHeartbeat(sessionId);
            return res.json({ ok: updated });
        }
        
        if (req.path === '/api/devtools-terminator/terminate') {
            store.terminateSession(sessionId);
            if (typeof config.onTerminate === 'function') {
                config.onTerminate(req, sessionId);
            }
            return res.json({ terminated: true });
        }
        
        // Validate session for protected pages
        if (!store.isSessionValid(sessionId, config.maxHeartbeatAge)) {
            // Session not verified or heartbeat expired
            return res.redirect(config.terminationUrl);
        }
        
        next();
    };
}

/**
 * Express route handlers (alternative to middleware)
 */
function createRoutes(app, options = {}) {
    const config = {
        secret: options.secret || process.env.DEVTOOLS_SECRET || crypto.randomBytes(32).toString('hex'),
        heartbeatInterval: options.heartbeatInterval || 30000,
        onTerminate: options.onTerminate || null
    };
    
    app.post('/api/devtools-terminator/init', (req, res) => {
        const sessionId = req.session?.id || req.cookies?.sessionId || req.ip;
        const challenge = store.createSession(sessionId);
        res.json({
            challenge: challenge,
            heartbeatInterval: config.heartbeatInterval
        });
    });
    
    app.post('/api/devtools-terminator/verify', (req, res) => {
        const sessionId = req.session?.id || req.cookies?.sessionId || req.ip;
        const { response } = req.body;
        
        if (!response) {
            return res.status(400).json({ error: 'Missing response' });
        }
        
        const isValid = store.verifySession(sessionId, response, config.secret);
        res.json({ verified: isValid });
    });
    
    app.post('/api/devtools-terminator/heartbeat', (req, res) => {
        const sessionId = req.session?.id || req.cookies?.sessionId || req.ip;
        const updated = store.updateHeartbeat(sessionId);
        res.json({ ok: updated });
    });
    
    app.post('/api/devtools-terminator/terminate', (req, res) => {
        const sessionId = req.session?.id || req.cookies?.sessionId || req.ip;
        store.terminateSession(sessionId);
        
        if (typeof config.onTerminate === 'function') {
            config.onTerminate(req, sessionId);
        }
        
        res.json({ terminated: true });
    });
}

/**
 * Standalone validation function
 */
function isSessionValid(sessionId, maxAge = 60000) {
    return store.isSessionValid(sessionId, maxAge);
}

/**
 * Manual session termination
 */
function terminateSession(sessionId) {
    store.terminateSession(sessionId);
}

module.exports = {
    middleware,
    createRoutes,
    isSessionValid,
    terminateSession,
    SessionStore
};
