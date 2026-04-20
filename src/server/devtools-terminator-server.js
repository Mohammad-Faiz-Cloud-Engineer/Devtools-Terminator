/**
 * DevTools Terminator - Server Component
 * Version: 2.1.0
 * 
 * Node.js server-side validation module for DevTools Terminator Hybrid.
 * Provides Express middleware to enforce session security, handle heartbeats, 
 * verify cryptographic signatures, and maintain audit logs.
 */

const crypto = require('crypto');

const DEFAULT_SECRET = 'default_challenge_secret';
const DEFAULT_HEARTBEAT_TIMEOUT_MS = 45000;
const DEFAULT_CLEANUP_INTERVAL_MS = 60000;
const DEFAULT_REPLAY_ATTACK_WINDOW_MS = 10000;
const DEFAULT_MIN_HEARTBEAT_INTERVAL_MS = 500;
const MAX_PAYLOAD_LENGTH = 1024;
const HEX_64_PATTERN = /^[a-f0-9]{64}$/i;
const CODE_PATTERN = /^[A-Z0-9_]{3,64}$/;

class DevToolsTerminatorServer {
    constructor(config = {}) {
        this.config = {
            secret: process.env.DEVTOOLS_SECRET || DEFAULT_SECRET,
            heartbeatTimeout: DEFAULT_HEARTBEAT_TIMEOUT_MS,
            apiPath: '/api/devtools-terminator',
            onTerminate: null,
            replayAttackWindow: DEFAULT_REPLAY_ATTACK_WINDOW_MS,
            minHeartbeatInterval: DEFAULT_MIN_HEARTBEAT_INTERVAL_MS,
            ...config
        };

        this.config.apiPath = this.normalizeApiPath(this.config.apiPath);
        this.config.heartbeatTimeout = this.normalizePositiveInteger(
            this.config.heartbeatTimeout,
            DEFAULT_HEARTBEAT_TIMEOUT_MS
        );
        this.config.replayAttackWindow = this.normalizePositiveInteger(
            this.config.replayAttackWindow,
            DEFAULT_REPLAY_ATTACK_WINDOW_MS
        );
        this.config.minHeartbeatInterval = this.normalizePositiveInteger(
            this.config.minHeartbeatInterval,
            DEFAULT_MIN_HEARTBEAT_INTERVAL_MS
        );
        
        // SECURITY WARNING: Fail fast if using default secret in production
        if (this.config.secret === DEFAULT_SECRET && process.env.NODE_ENV === 'production') {
            throw new Error('[DevTools Terminator] CRITICAL: Default secret detected in production! Set DEVTOOLS_SECRET environment variable.');
        }

        // In-memory session tracking map
        // Format: { sessionId: { lastHeartbeat: timestamp, isTerminated: boolean, fingerprint: string } }
        this.sessions = new Map();
        
        // Start cleanup interval for stale sessions (prevent memory leaks)
        // Call destroy() method on server shutdown to clear this interval
        this.cleanupInterval = setInterval(() => this.cleanupStaleSessions(), DEFAULT_CLEANUP_INTERVAL_MS);
        if (typeof this.cleanupInterval.unref === 'function') {
            this.cleanupInterval.unref();
        }
    }

    /**
     * Stop background cleanup tasks (useful for graceful shutdown/testing)
     */
    destroy() {
        clearInterval(this.cleanupInterval);
    }

    normalizeApiPath(apiPath) {
        if (typeof apiPath !== 'string' || apiPath.trim() === '') {
            return '/api/devtools-terminator';
        }

        const normalized = apiPath.trim().replace(/\/+$/, '');
        return normalized.startsWith('/') ? normalized : `/${normalized}`;
    }

    normalizePositiveInteger(value, fallback) {
        const parsed = Number.parseInt(value, 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    }

    getSessionId(req) {
        const directSessionId = typeof req.sessionID === 'string' && req.sessionID.trim() !== ''
            ? req.sessionID.trim()
            : null;
        if (directSessionId) {
            return directSessionId;
        }

        const cookieSessionId = typeof req.cookies?.['connect.sid'] === 'string' && req.cookies['connect.sid'].trim() !== ''
            ? req.cookies['connect.sid'].trim()
            : null;
        if (cookieSessionId) {
            return cookieSessionId;
        }

        // Prefer a stable, request-scoped fingerprint over raw IP so users behind NAT do not share state.
        const fallbackSource = [
            req.headers['user-agent'] || '',
            req.headers.cookie || '',
            req.ip || ''
        ].join('|');

        return `anon:${crypto.createHash('sha256').update(fallbackSource).digest('hex')}`;
    }

    parsePayload(payload) {
        if (typeof payload !== 'string' || payload.length === 0 || payload.length > MAX_PAYLOAD_LENGTH) {
            return null;
        }

        const parts = payload.split(':');
        if (parts.length !== 3) {
            return null;
        }

        const [fingerprint, scriptHash, timestampText] = parts;
        if (!HEX_64_PATTERN.test(fingerprint) || !HEX_64_PATTERN.test(scriptHash)) {
            return null;
        }

        if (!/^\d{10,16}$/.test(timestampText)) {
            return null;
        }

        const timestamp = Number.parseInt(timestampText, 10);
        if (!Number.isFinite(timestamp)) {
            return null;
        }

        return { fingerprint, scriptHash, timestamp };
    }

    parseTerminationCode(body) {
        let code = 'SEC_DEVTOOLS_UNKNOWN';

        if (body && typeof body === 'object' && typeof body.code === 'string') {
            code = body.code;
        } else if (typeof body === 'string' && body.length <= MAX_PAYLOAD_LENGTH) {
            try {
                const parsed = JSON.parse(body);
                if (parsed && typeof parsed.code === 'string') {
                    code = parsed.code;
                }
            } catch (e) {
                return 'SEC_DEVTOOLS_UNKNOWN';
            }
        }

        const normalizedCode = String(code).trim().toUpperCase();
        return CODE_PATTERN.test(normalizedCode) ? normalizedCode : 'SEC_DEVTOOLS_UNKNOWN';
    }

    /**
     * Verify HMAC-SHA256 signature using timing-safe comparison
     */
    verifySignature(payload, signature) {
        if (typeof signature !== 'string' || !HEX_64_PATTERN.test(signature)) {
            return false;
        }

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
            // Log crypto errors for debugging (signature verification failures are security-relevant)
            console.error('[DevTools Terminator] Signature verification error:', e.message);
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
        const sessionData = this.sessions.get(sessionId) || {};
        sessionData.isTerminated = true;
        sessionData.lastTerminatedAt = Date.now();
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
            const sessionId = this.getSessionId(req);

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

        if (typeof payload !== 'string' || typeof signature !== 'string') {
            return res.status(400).json({ error: 'Invalid payload or signature format' });
        }

        const parsedPayload = this.parsePayload(payload);
        if (!parsedPayload) {
            return res.status(400).json({ error: 'Malformed cryptographic payload' });
        }

        // Verify cryptographic signature
        if (!this.verifySignature(payload, signature)) {
            console.error(`[DevTools Terminator] [WARNING] Invalid heartbeat signature from ${sessionId}`);
            this.terminateSession(sessionId, req, 'SEC_DEVTOOLS_INVALID_SIG');
            return res.status(403).json({ error: 'Invalid cryptographic signature' });
        }

        // Replay attack protection (timestamp must be within configured window)
        const timeDiff = Math.abs(Date.now() - parsedPayload.timestamp);
        if (timeDiff > this.config.replayAttackWindow) {
            console.error(`[DevTools Terminator] [WARNING] Replay attack detected from ${sessionId} (Time diff: ${timeDiff}ms)`);
            return res.status(403).json({ error: 'Timestamp expired (Replay Attack Prevention)' });
        }

        // Verify session hasn't been terminated previously
        const sessionData = this.sessions.get(sessionId);
        if (sessionData && sessionData.isTerminated) {
            return res.status(403).json({ error: 'Session already marked as terminated' });
        }

        if (sessionData && sessionData.lastHeartbeat && Date.now() - sessionData.lastHeartbeat < this.config.minHeartbeatInterval) {
            return res.status(429).json({ error: 'Heartbeat rate limit exceeded' });
        }

        // Update active session state
        this.sessions.set(sessionId, {
            lastHeartbeat: Date.now(),
            isTerminated: false,
            fingerprint: parsedPayload.fingerprint,
            scriptHash: parsedPayload.scriptHash
        });

        return res.status(200).json({ status: 'ok', secure: true });
    }

    /**
     * Handle termination beacon from client
     */
    handleTerminate(req, res, sessionId) {
        const code = this.parseTerminationCode(req.body);
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
