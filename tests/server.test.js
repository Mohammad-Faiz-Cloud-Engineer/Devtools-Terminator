const assert = require('assert');
const crypto = require('crypto');

const { DevToolsTerminatorServer } = require('../src/server/devtools-terminator-server');

function createReq(overrides = {}) {
    return {
        body: {},
        cookies: {},
        headers: {},
        ip: '127.0.0.1',
        method: 'POST',
        path: '/api/devtools-terminator/heartbeat',
        ...overrides
    };
}

function createRes() {
    return {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        }
    };
}

function sign(secret, payload) {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function run() {
    const secret = '0123456789abcdef0123456789abcdef';
    const server = new DevToolsTerminatorServer({ secret });

    try {
        const timestamp = Date.now().toString();
        const fingerprint = 'a'.repeat(64);
        const scriptHash = 'b'.repeat(64);
        const payload = `${fingerprint}:${scriptHash}:${timestamp}`;
        const signature = sign(secret, payload);

        const okReq = createReq({ body: { payload, signature } });
        const okRes = createRes();
        server.handleHeartbeat(okReq, okRes, 'session-1');
        assert.strictEqual(okRes.statusCode, 200);
        assert.deepStrictEqual(okRes.body, { status: 'ok', secure: true });

        const replayReq = createReq({
            body: {
                payload: `${fingerprint}:${scriptHash}:${timestamp}`,
                signature
            }
        });
        const replayRes = createRes();
        server.handleHeartbeat(replayReq, replayRes, 'session-1');
        assert.strictEqual(replayRes.statusCode, 429);

        const malformedReq = createReq({ body: { payload: 'oops', signature: 'abc' } });
        const malformedRes = createRes();
        server.handleHeartbeat(malformedReq, malformedRes, 'session-2');
        assert.strictEqual(malformedRes.statusCode, 400);

        const terminateReq = createReq({ body: JSON.stringify({ code: 'sec_devtools_manual' }) });
        const terminateRes = createRes();
        server.handleTerminate(terminateReq, terminateRes, 'session-3');
        assert.strictEqual(terminateRes.statusCode, 200);
        assert.deepStrictEqual(terminateRes.body, { status: 'terminated' });

        const terminatedSession = server.sessions.get('session-3');
        assert.strictEqual(terminatedSession.isTerminated, true);
    } finally {
        server.destroy();
    }

    console.log('server.test.js passed');
}

run();
