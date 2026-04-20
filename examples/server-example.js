/**
 * DevTools Terminator - Server Integration Example
 * Run this file with Node.js to test the hybrid architecture.
 * 
 * Command: node examples/server-example.js
 */

const express = require('express');
const path = require('path');
const session = require('express-session');
const devtoolsTerminator = require('../src/server/devtools-terminator-server');

const app = express();
const PORT = Number.parseInt(process.env.PORT, 10) || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET;
const DEVTOOLS_SECRET = process.env.DEVTOOLS_SECRET;

if (!SESSION_SECRET || !DEVTOOLS_SECRET) {
    throw new Error('SESSION_SECRET and DEVTOOLS_SECRET must be set before running examples/server-example.js');
}

// SECURITY WARNING: This is a demo file. In production:
// 1. Use strong random secrets from environment variables
// 2. Enable HTTPS and set secure: true for cookies
// 3. Use a production-grade session store (not MemoryStore)

// 1. Basic Express Middleware setup
app.use(express.json());
app.use(express.text()); // Important for parsing navigator.sendBeacon string payloads
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'dt.sid',
    cookie: { 
        // WARNING: Requires HTTPS in production! Set NODE_ENV=production
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true, // Prevent client-side JavaScript access to cookies
        sameSite: 'strict', // CSRF protection
        maxAge: 60 * 60 * 1000
    }
}));

// 2. Configure and apply DevTools Terminator Server Middleware
const dtConfig = {
    secret: DEVTOOLS_SECRET,
    apiPath: '/api/devtools-terminator',
    onTerminate: (req, sessionId, code) => {
        // This hook runs on the server the moment DevTools is detected or a heartbeat fails.
        // Good place for Webhooks, Slack alerts, or database auditing.
        console.log(`\n[SECURITY ALERT] User session [${sessionId}] triggered DevTools!`);
        console.log(`Reason Code: ${code}`);
        console.log(`IP Address: ${req.ip}\n`);
    }
};

app.use(devtoolsTerminator.middleware(dtConfig));

// 3. Serve Static Files for the Demo
app.use('/src', express.static(path.join(__dirname, '../src')));
app.use('/public', express.static(path.join(__dirname, '../public')));

// 4. Example Hybrid Protected Route
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Hybrid Protection Server Demo</title>
            
            <!-- Configure Hybrid Settings -->
            <script>
                // Demo-only token injection. This value is visible to the browser and must not
                // be treated as an authentication secret in a real deployment.
                window.DEVTOOLS_TERMINATOR_CONFIG = {
                    terminationUrl: '/public/terminated.html',
                    serverValidation: true,
                    apiEndpoint: '/api/devtools-terminator',
                    secret: '${DEVTOOLS_SECRET}'
                };
            </script>
            
            <!-- Load the Hybrid Library -->
            <script src="/src/client/devtools-terminator-hybrid.js"></script>
            
            <style>
                body { font-family: sans-serif; padding: 2rem; background: #0f172a; color: #f8fafc; }
                .card { background: #1e293b; padding: 2rem; border-radius: 8px; max-width: 600px; border: 1px solid #334155; }
                .highlight { color: #38bdf8; font-family: monospace; background: #0f172a; padding: 0.25rem 0.5rem; border-radius: 4px; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>Hybrid Server Protection Active</h1>
                <p>Your current Server Session ID is: <span class="highlight">${req.sessionID}</span></p>
                <p>The client is currently pinging heartbeats via <code>HMAC-SHA256</code> to the backend.</p>
                
                <h3 style="color: #f87171;">Action Required:</h3>
                <p>Press <strong>F12</strong>. Not only will the client redirect to the termination page, but watch your Node.js console!</p>
                <p>The server will instantly log the breach and lock the session from accessing protected routes.</p>
                
                <button onclick="fetchSecretData()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 1rem;">
                    Fetch Protected API Data
                </button>
                <p id="api-result" style="margin-top: 1rem; color: #a7f3d0; font-family: monospace;"></p>
            </div>

            <script>
                async function fetchSecretData() {
                    const el = document.getElementById('api-result');
                    try {
                        const res = await fetch('/api/secure-data');
                        if (res.ok) {
                            const data = await res.json();
                            el.textContent = 'Success: ' + data.message;
                            el.style.color = '#a7f3d0';
                        } else {
                            el.textContent = 'HTTP Error: ' + res.status + ' ' + await res.text();
                            el.style.color = '#f87171';
                        }
                    } catch (e) {
                        el.textContent = 'Network Error';
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// 5. Example API Endpoint (Protected by Middleware)
// If the user's session is marked as terminated by the middleware, this route will return a 403 instantly.
app.get('/api/secure-data', (req, res) => {
    res.json({ message: "This is highly sensitive data that only untampered sessions can view." });
});

app.listen(PORT, () => {
    console.log(`\n===========================================`);
    console.log(`[ DevTools Terminator Server Active ]`);
    console.log(`===========================================`);
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`1. Open the URL in your browser to start the hybrid session.`);
    console.log(`2. Click 'Fetch Protected API Data' (It will succeed).`);
    console.log(`3. Press F12 to open DevTools.`);
    console.log(`4. Watch this console for the security breach alert.`);
    console.log(`===========================================\n`);
});
