# Hybrid Server Validation Setup

The Hybrid model uses the Web Crypto API to sign heartbeat payloads and an Express backend to validate those signatures. Because the browser receives the signing input, this mode should be treated as tamper evidence and session correlation, not as a substitute for server-side authentication.

## Step 1: Backend Integration
Import the middleware into your Express app. Ensure your Express app already uses a session tracking mechanism (like `express-session` or standard cookies).

```javascript
const devtoolsTerminator = require('./src/server/devtools-terminator-server');

app.use(devtoolsTerminator.middleware({
    secret: process.env.DEVTOOLS_SECRET, // Secret key for HMAC-SHA256
    apiPath: '/api/devtools-terminator',
    onTerminate: (req, sessionId, code) => {
        console.warn(`User ${sessionId} breached security with code: ${code}`);
    }
}));
```

## Step 2: Frontend Configuration
Use the hybrid library and configure it to match the server:

```html
<script>
    window.DEVTOOLS_TERMINATOR_CONFIG = {
        serverValidation: true,
        apiEndpoint: '/api/devtools-terminator',
    secret: 'MATCHING_BROWSER_VISIBLE_TOKEN' // Demo token only; visible to the browser
    };
</script>
<script src="src/client/devtools-terminator-hybrid.js"></script>
```

## How It Works
1. The client dynamically hashes its own source code and generates an environment fingerprint (Screen size, UA, timezone).
2. It sends this payload, signed via HMAC-SHA256, to `/api/devtools-terminator/heartbeat` every 30 seconds.
3. The server verifies the signature, fingerprint, and timestamp (blocking replay attacks).
4. If a heartbeat is missed (staleness > 45s) or a `sendBeacon` termination is received, the server locks the `sessionID` out of all standard routes.
