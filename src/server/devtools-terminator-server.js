/**
 * DevTools Terminator - Server Component
 * Version: 2.1.0
 * 
 * Node.js server-side validation module for DevTools Terminator Hybrid.
 * Provides Express middleware to enforce session security, handle heartbeats, 
 * verify cryptographic signatures, and maintain audit logs.
 */

const crypto = require('crypto');

class DevToolsTerminatorServer {
    constructor(config = {}) {
        this.config = {
            secret: process.env.DEVTOOLS_SECRET || 'default_challenge_secret',
            heartbeatTimeout: 45000, // 45 seconds (client sends every 30s)
            apiPath: '/api/devtools-terminator',
            onTerminate: null,
            ...config
        };

        // In-memory session tracking map
        // Format: { sessionId: { lastHeartbeat: timestamp, isTerminated: boolean, fingerprint: string } }
        this.sessions = new Map();
        
        // Start cleanup interval for stale sessions (prevent memory leaks)
        this.cleanupInterval = setInterval(() => this.cleanupStaleSessions(), 60000);
    }

    /**
     * Stop background cleanup tasks (useful for graceful shutdown/testing)
     */
    destroy() {
        clearInterval(this.cleanupInterval);
    }

    /**
     * Verify HMAC-SHA256 signature using timing-safe comparison
     */
    verifySignature(payload, signature) {
        try {
            const expectedSignature = crypto
                .createHmac('sha256', this.config.secret)
                .update(payload)
                .digest('hex');
            
            // Use timingSafeEqual to prevent timing attacks
            const sigBuf = Buffer.from(signature, 'hex');
            const expBuf = Buffer.from(expectedSignature, 'hex');
            
            if (sigBuf.length !== expBuf.length) return false;
            
            return crypto.timingSafeEqual(sigBuf, expBuf);
        } catch (e) {
            return false;
        }
    }

    /**
     * Clean up stale sessions to prevent memory leaks
     */
    cleanupStaleSessions() {
        const now = Date.now();
        for (const [sessionId, data] of this.sessions.entries()) {
            if (now - data.lastHeartbeat > this.config.heartbeatTimeout * 2) {
                this.sessions.delete(sessionId);
            }
        }
    }

    /**
     * Terminate a session on the server side
     */
    terminateSession(sessionId, req, code = 'SEC_DEVTOOLS_UNKNOWN') {
        let sessionData = this.sessions.get(sessionId) || {};
        sessionData.isTerminated = true;
        this.sessions.set(sessionId, sessionData);

        // Audit Logging
        console.warn(`[DevTools Terminator] [ALERT] Session Terminated: ${sessionId} | Code: ${code} | IP: ${req.ip}`);

        if (typeof this.config.onTerminate === 'function') {
            try {
                this.config.onTerminate(req, sessionId, code);
            } catch (e) {
                console.error('[DevTools Terminator] Error in onTerminate hook:', e);
            }
        }
    }

    /**
     * Express Middleware Factory
     */
    middleware() {
        return (req, res, next) => {
            // Support Express sessions, cookies, or fallback to IP for identification
            const sessionId = req.sessionID || req.cookies?.['connect.sid'] || req.ip;

            // Enforce protection on standard routes (Not the API itself)
            if (!req.path.startsWith(this.config.apiPath)) {
                const sessionData = this.sessions.get(sessionId);
                
                // If marked as terminated, explicitly reject access
                if (sessionData && sessionData.isTerminated) {
                    console.warn(`[DevTools Terminator] [BLOCKED] Blocked access attempt from terminated session: ${sessionId}`);
                    return res.status(403).send('Session terminated due to security violation.');
                }
                return next();
            }

            // Route: Heartbeat or Terminate
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed' });
            }

            if (req.path === `${this.config.apiPath}/heartbeat`) {
                return this.handleHeartbeat(req, res, sessionId);
            }

            if (req.path === `${this.config.apiPath}/terminate`) {
                return this.handleTerminate(req, res, sessionId);
            }

            return res.status(404).json({ error: 'API route not found' });
        };
    }

    /**
     * Handle incoming heartbeat ping from client
     */
    handleHeartbeat(req, res, sessionId) {
        const { payload, signature } = req.body || {};

        if (!payload || !signature) {
            return res.status(400).json({ error: 'Invalid payload or signature format' });
        }

        // Verify cryptographic signature
        if (!this.verifySignature(payload, signature)) {
            console.error(`[DevTools Terminator] [WARNING] Invalid heartbeat signature from ${sessionId}`);
            this.terminateSession(sessionId, req, 'SEC_DEVTOOLS_INVALID_SIG');
            return res.status(403).json({ error: 'Invalid cryptographic signature' });
        }

        // Parse payload (Format: fingerprint:scriptHash:timestamp)
        const parts = payload.split(':');
        if (parts.length < 3) {
            return res.status(400).json({ error: 'Malformed cryptographic payload' });
        }

        const [fingerprint, scriptHash, timestamp] = parts;
        const timeDiff = Math.abs(Date.now() - parseInt(timestamp, 10));

        // Replay attack protection (timestamp must be within 10 seconds)
        if (timeDiff > 10000) {
            console.error(`[DevTools Terminator] [WARNING] Replay attack detected from ${sessionId} (Time diff: ${timeDiff}ms)`);
            return res.status(403).json({ error: 'Timestamp expired (Replay Attack Prevention)' });
        }

        // Verify session hasn't been terminated previously
        let sessionData = this.sessions.get(sessionId);
        if (sessionData && sessionData.isTerminated) {
            return res.status(403).json({ error: 'Session already marked as terminated' });
        }

        // Update active session state
        this.sessions.set(sessionId, {
            lastHeartbeat: Date.now(),
            isTerminated: false,
            fingerprint,
            scriptHash
        });

        return res.status(200).json({ status: 'ok', secure: true });
    }

    /**
     * Handle termination beacon from client
     */
    handleTerminate(req, res, sessionId) {
        let code = 'SEC_DEVTOOLS_UNKNOWN';
        
        try {
            // Handle JSON body if parsed, or fallback to raw string if express.text() is used
            if (req.body && req.body.code) {
                code = req.body.code;
            } else if (typeof req.body === 'string') {
                const parsed = JSON.parse(req.body);
                if (parsed.code) code = parsed.code;
            }
        } catch (e) {
            // Parsing error is acceptable for beacons; fallback code used
        }

        this.terminateSession(sessionId, req, code);
        return res.status(200).json({ status: 'terminated' });
    }
}

/**
 * Factory export for easy Express integration
 */
module.exports = {
    middleware: (config) => {
        const server = new DevToolsTerminatorServer(config);
        return server.middleware();
    },
    DevToolsTerminatorServer // Exported for testing and advanced injection
};
