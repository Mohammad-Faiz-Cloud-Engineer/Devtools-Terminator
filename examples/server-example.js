/**
 * Complete Express Server Example
 * Demonstrates hybrid client-server DevTools protection
 * 
 * To run:
 *   npm install express express-session cookie-parser body-parser
 *   node examples/server-example.js
 *   Open http://localhost:3000
 */

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const devtoolsTerminator = require('../src/server/devtools-terminator-server');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'demo-session-secret-change-in-production',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '..')));
app.use('/examples', express.static(__dirname));

// ==================== DEVTOOLS TERMINATOR ====================

app.use(devtoolsTerminator.middleware({
    secret: process.env.DEVTOOLS_SECRET || 'demo-secret-change-in-production',
    heartbeatInterval: 30000, // 30 seconds
    maxHeartbeatAge: 60000, // 60 seconds
    protectedPaths: ['/admin', '/dashboard', '/protected'],
    excludePaths: ['/api/devtools-terminator', '/login', '/public', '/'],
    terminationUrl: '/examples/terminated.html',
    enforceIntegrity: true, // Enable script integrity checking
    scriptPaths: [
        path.join(__dirname, '..', 'src', 'client', 'devtools-terminator-hybrid.js'),
        path.join(__dirname, '..', 'src', 'client', 'devtools-terminator.js')
    ],
    onTerminate: (req, sessionId) => {
        console.log('\n🚨 SECURITY ALERT 🚨');
        console.log('DevTools detected and session terminated');
        console.log('Session ID:', sessionId);
        console.log('IP Address:', req.ip);
        console.log('User Agent:', req.headers['user-agent']);
        console.log('Path:', req.path);
        console.log('Timestamp:', new Date().toISOString());
        console.log('─'.repeat(60) + '\n');
    },
    onIntegrityViolation: (req, sessionId, verification) => {
        console.log('\n' + '='.repeat(60));
        console.log('CRITICAL SECURITY ALERT');
        console.log('='.repeat(60));
        console.log('Script integrity violation detected!');
        console.log('Session ID:', sessionId);
        console.log('IP Address:', req.ip);
        console.log('User Agent:', req.headers['user-agent']);
        console.log('Reason:', verification.reason);
        console.log('Expected Hash:', verification.expected);
        console.log('Received Hash:', verification.received);
        console.log('Timestamp:', new Date().toISOString());
        console.log('WARNING: User may have modified the protection script!');
        console.log('─'.repeat(60) + '\n');
    }
}));

// ==================== ROUTES ====================

// Home page (not protected)
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>DevTools Terminator - Hybrid Demo</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            line-height: 1.6;
        }
        h1 { color: #667eea; }
        .card {
            background: #f7fafc;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .protected { border-color: #f56565; background: #fff5f5; }
        .public { border-color: #48bb78; background: #f0fff4; }
        a {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 10px 10px 10px 0;
        }
        a:hover { background: #5568d3; }
        code {
            background: #2d3748;
            color: #e2e8f0;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <h1>DevTools Terminator - Hybrid Demo</h1>
    
    <div class="card public">
        <h2>[OK] Public Page (Not Protected)</h2>
        <p>This page is not protected. You can open DevTools freely.</p>
        <p>Try it: Press <code>F12</code> or <code>Ctrl+Shift+I</code></p>
    </div>
    
    <div class="card protected">
        <h2>[PROTECTED] Protected Pages</h2>
        <p>These pages use hybrid client-server protection:</p>
        <ul>
            <li><strong>Client-side:</strong> Detects DevTools using console logging, window size, and keyboard shortcuts</li>
            <li><strong>Server-side:</strong> Validates session with challenge-response and periodic heartbeats</li>
        </ul>
        <p><strong>Try opening DevTools on these pages - you'll be terminated!</strong></p>
        <a href="/admin">Admin Page</a>
        <a href="/dashboard">Dashboard</a>
        <a href="/protected">Protected Page</a>
    </div>
    
    <div class="card">
        <h2>📊 How It Works</h2>
        <ol>
            <li>Client loads and requests cryptographic challenge from server</li>
            <li>Client solves challenge using browser fingerprint</li>
            <li>Server validates response and creates session</li>
            <li>Client sends heartbeat every 30 seconds to prove it's running</li>
            <li>Server blocks access if heartbeat stops or DevTools detected</li>
        </ol>
    </div>
    
    <div class="card">
        <h2>🧪 Test Scenarios</h2>
        <p><strong>Scenario 1:</strong> Normal usage</p>
        <ul>
            <li>Visit protected page without opening DevTools</li>
            <li>Page loads normally and heartbeats continue</li>
        </ul>
        
        <p><strong>Scenario 2:</strong> DevTools detection</p>
        <ul>
            <li>Visit protected page</li>
            <li>Press F12 to open DevTools</li>
            <li>Immediately terminated and redirected</li>
            <li>Server logs security event</li>
        </ul>
        
        <p><strong>Scenario 3:</strong> Bypass attempt</p>
        <ul>
            <li>Disable JavaScript in browser</li>
            <li>Visit protected page</li>
            <li>Server doesn't receive heartbeats</li>
            <li>Next request redirects to termination page</li>
        </ul>
    </div>
    
    <div class="card">
        <h2>📝 Server Logs</h2>
        <p>Check your terminal to see security events logged when DevTools are detected.</p>
    </div>
</body>
</html>
    `);
});

// Protected pages
app.get('/admin', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Admin - Protected</title>
    
    <!-- NoScript Handler: Redirect if JavaScript is disabled -->
    <noscript>
        <meta http-equiv="refresh" content="0; url=/examples/terminated.html">
        <style>
            body { display: none !important; }
            .noscript-warning {
                display: block !important;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #0a0a0a;
                color: #ffffff;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                z-index: 999999;
            }
            .noscript-warning h1 {
                font-size: 28px;
                color: #ef4444;
                margin-bottom: 16px;
            }
            .noscript-warning p {
                font-size: 16px;
                color: #9ca3af;
            }
        </style>
        <div class="noscript-warning">
            <div>
                <h1>⛔ JavaScript Required</h1>
                <p>This page requires JavaScript for security verification.</p>
                <p>Your session has been terminated.</p>
            </div>
        </div>
    </noscript>
    
    <script>
    window.DEVTOOLS_TERMINATOR_CONFIG = {
        terminationUrl: '/examples/terminated.html',
        checkInterval: 100,
        enableWindowSizeCheck: true,
        enableKeyboardBlock: true,
        serverValidation: true,
        apiEndpoint: '/api/devtools-terminator',
        onTerminate: function() {
            console.log('Custom handler: DevTools detected!');
        }
    };
    </script>
    <script src="/devtools-terminator-hybrid.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
        }
        .alert {
            background: #fff5f5;
            border: 2px solid #f56565;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .status {
            background: #f0fff4;
            border: 2px solid #48bb78;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            margin: 5px;
        }
        button:hover { background: #5568d3; }
    </style>
</head>
<body>
    <h1>[PROTECTED] Admin Page</h1>
    
    <div class="alert">
        <h2>WARNING</h2>
        <p>This page is protected by DevTools Terminator (Hybrid Mode).</p>
        <p><strong>Do not open Developer Tools or your session will be terminated!</strong></p>
    </div>
    
    <div class="status">
        <h2>[OK] Protection Status</h2>
        <p>Version: <span id="version">Loading...</span></p>
        <p>Server Verified: <span id="verified">Loading...</span></p>
        <p>Session Status: <span id="status">Active</span></p>
    </div>
    
    <button onclick="checkStatus()">Check Status</button>
    <button onclick="window.location.href='/'">Back to Home</button>
    
    <script>
    function checkStatus() {
        if (window.DevToolsTerminator) {
            document.getElementById('version').textContent = window.DevToolsTerminator.version;
            document.getElementById('verified').textContent = window.DevToolsTerminator.isServerVerified() ? 'Yes ✓' : 'No ✗';
            document.getElementById('status').textContent = window.DevToolsTerminator.isTerminated() ? 'Terminated ✗' : 'Active ✓';
        }
    }
    
    // Check status on load
    setTimeout(checkStatus, 1000);
    </script>
</body>
</html>
    `);
});

app.get('/dashboard', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Dashboard - Protected</title>
    <script>
    window.DEVTOOLS_TERMINATOR_CONFIG = {
        serverValidation: true,
        apiEndpoint: '/api/devtools-terminator'
    };
    </script>
    <script src="/devtools-terminator-hybrid.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
        }
    </style>
</head>
<body>
    <h1>📊 Dashboard (Protected)</h1>
    <p>This is a protected dashboard page.</p>
    <p>Try opening DevTools - you'll be terminated!</p>
    <button onclick="window.location.href='/'">Back to Home</button>
</body>
</html>
    `);
});

app.get('/protected', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Protected Page</title>
    <script>
    window.DEVTOOLS_TERMINATOR_CONFIG = {
        serverValidation: true,
        apiEndpoint: '/api/devtools-terminator'
    };
    </script>
    <script src="/devtools-terminator-hybrid.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
        }
    </style>
</head>
<body>
    <h1>🔐 Protected Content</h1>
    <p>This page contains sensitive information.</p>
    <p>DevTools protection is active.</p>
    <button onclick="window.location.href='/'">Back to Home</button>
</body>
</html>
    `);
});

// Public page (not protected)
app.get('/public', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Public Page</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
        }
    </style>
</head>
<body>
    <h1>Public Page</h1>
    <p>This page is not protected. You can open DevTools freely.</p>
    <p>Try it: Press F12</p>
    <button onclick="window.location.href='/'">Back to Home</button>
</body>
</html>
    `);
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('DevTools Terminator - Hybrid Demo Server');
    console.log('='.repeat(60));
    console.log('\nServer running on http://localhost:' + PORT);
    console.log('\nAvailable routes:');
    console.log('   • http://localhost:' + PORT + '/ (home - not protected)');
    console.log('   • http://localhost:' + PORT + '/admin (protected)');
    console.log('   • http://localhost:' + PORT + '/dashboard (protected)');
    console.log('   • http://localhost:' + PORT + '/protected (protected)');
    console.log('   • http://localhost:' + PORT + '/public (not protected)');
    console.log('\nTry opening DevTools on protected pages!');
    console.log('\nSecurity events will be logged here when DevTools are detected.\n');
    console.log('='.repeat(60) + '\n');
});
