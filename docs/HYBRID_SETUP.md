# Hybrid Client-Server Setup Guide

This guide explains how to set up the enhanced hybrid version that makes bypassing significantly harder through server-side validation.

## Understanding the Architecture

### The Problem
The original client-side only version can be bypassed by:
- Disabling JavaScript
- Modifying the code in browser
- Using browser extensions
- Intercepting and modifying network requests

### The Solution
The hybrid version adds server-side enforcement:

```
┌─────────────┐         Challenge          ┌─────────────┐
│   Client    │ ────────────────────────> │   Server    │
│  (Browser)  │                            │  (Node.js)  │
│             │ <──────────────────────── │             │
│             │         Response           │             │
│             │                            │             │
│             │      Heartbeat (30s)       │             │
│             │ ────────────────────────> │             │
│             │                            │             │
│             │    Validation Result       │             │
│             │ <──────────────────────── │             │
└─────────────┘                            └─────────────┘
```

**How it works:**
1. Client loads and requests a cryptographic challenge from server
2. Client solves challenge using browser fingerprint
3. Server validates the response
4. Client sends periodic heartbeats (every 30s) to prove it's still running
5. Server blocks access if heartbeat stops or is invalid
6. If DevTools detected, client notifies server and terminates

**Why this is harder to bypass:**
- Can't just disable JavaScript - server won't get heartbeats
- Can't modify code easily - cryptographic challenge changes each session
- Can't fake heartbeats - requires solving challenge with correct fingerprint
- Server tracks all sessions and enforces validation

## Installation

### Step 1: Install Server Module

```bash
cd your-project
npm install express express-session cookie-parser body-parser
```

### Step 2: Copy Files

```bash
# Copy hybrid client library
cp devtools-terminator-hybrid.js your-project/public/

# Copy server module
cp devtools-terminator-server.js your-project/

# Copy termination page
cp examples/terminated.html your-project/public/
```

### Step 3: Server Setup (Node.js/Express)

Create `server.js`:

```javascript
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const devtoolsTerminator = require('./devtools-terminator-server');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: 'your-session-secret-change-this',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true in production with HTTPS
}));

// Serve static files
app.use(express.static('public'));

// DevTools Terminator middleware
app.use(devtoolsTerminator.middleware({
    secret: process.env.DEVTOOLS_SECRET || 'your-secret-key-change-this',
    heartbeatInterval: 30000, // 30 seconds
    maxHeartbeatAge: 60000, // 60 seconds
    protectedPaths: ['/admin', '/dashboard'], // Paths to protect
    excludePaths: ['/api/devtools-terminator', '/login'], // Paths to exclude
    terminationUrl: '/terminated.html',
    onTerminate: (req, sessionId) => {
        console.log(`[Security] DevTools detected - Session ${sessionId} terminated`);
        // Log to your security system
    }
}));

// Your routes
app.get('/', (req, res) => {
    res.send('<h1>Public Page</h1><p>Not protected</p>');
});

app.get('/admin', (req, res) => {
    res.send('<h1>Admin Page</h1><p>Protected by DevTools Terminator</p>');
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
```

### Step 4: Client Setup (HTML)

In your protected pages:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Protected Admin Page</title>
    
    <!-- Configure BEFORE loading script -->
    <script>
    window.DEVTOOLS_TERMINATOR_CONFIG = {
        terminationUrl: '/terminated.html',
        checkInterval: 100,
        enableWindowSizeCheck: true,
        enableKeyboardBlock: true,
        serverValidation: true, // Enable server validation
        apiEndpoint: '/api/devtools-terminator'
    };
    </script>
    
    <!-- Load hybrid version -->
    <script src="/devtools-terminator-hybrid.js"></script>
</head>
<body>
    <h1>Protected Content</h1>
    <p>This page is protected by hybrid client-server validation.</p>
    <p>Try opening DevTools - you'll be terminated and blocked by the server.</p>
</body>
</html>
```

### Step 5: Environment Variables

Create `.env` file:

```bash
# Cryptographic secret for challenge-response (REQUIRED in production)
DEVTOOLS_SECRET=your-very-long-random-secret-key-here

# Session secret
SESSION_SECRET=your-session-secret-here
```

**Generate secure secrets:**

```bash
# Linux/Mac
openssl rand -hex 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Configuration Options

### Server Options

```javascript
devtoolsTerminator.middleware({
    // Cryptographic secret for challenge-response (REQUIRED)
    secret: process.env.DEVTOOLS_SECRET,
    
    // How often client should send heartbeat (milliseconds)
    heartbeatInterval: 30000, // 30 seconds
    
    // Maximum age of last heartbeat before considering session dead
    maxHeartbeatAge: 60000, // 60 seconds
    
    // Paths that require protection
    protectedPaths: ['/admin', '/dashboard', '/api/sensitive'],
    
    // Paths to exclude from protection
    excludePaths: ['/api/devtools-terminator', '/login', '/public'],
    
    // Where to redirect terminated sessions
    terminationUrl: '/terminated.html',
    
    // Callback when session is terminated
    onTerminate: (req, sessionId) => {
        console.log(`Session ${sessionId} terminated`);
        // Log to your security monitoring system
        // Send alert email
        // Ban IP address
        // etc.
    },
    
    // Optional: Bypass header for testing (DO NOT USE IN PRODUCTION)
    bypassHeader: process.env.NODE_ENV === 'development' ? 'X-DevTools-Bypass' : null
})
```

### Client Options

```javascript
window.DEVTOOLS_TERMINATOR_CONFIG = {
    // Standard options (same as original)
    terminationUrl: '/terminated.html',
    checkInterval: 100,
    enableWindowSizeCheck: true,
    enableKeyboardBlock: true,
    disableOnMobile: false,
    
    // NEW: Server validation options
    serverValidation: true, // Enable server-side validation
    apiEndpoint: '/api/devtools-terminator', // Server API endpoint
    
    // Custom termination handler
    onTerminate: function() {
        // Your custom logic
        console.log('DevTools detected!');
    }
};
```

## Testing

### Test 1: Basic Protection

```bash
# Start server
node server.js

# Open browser
# Navigate to http://localhost:3000/admin
# Try opening DevTools (F12)
# Should be terminated and redirected
```

### Test 2: Heartbeat Validation

```bash
# Open browser DevTools BEFORE loading page
# Navigate to http://localhost:3000/admin
# Page should load but server will detect missing heartbeats
# After 60 seconds, refresh - should be redirected to termination page
```

### Test 3: Bypass Attempt

```bash
# Try disabling JavaScript
# Navigate to http://localhost:3000/admin
# Server won't receive heartbeats
# Should be redirected to termination page
```

## Security Considerations

### What This Improves

**Prevents JavaScript disable** - Server enforces validation
**Detects code modification** - Challenge-response changes each session
**Tracks active sessions** - Server knows which sessions are valid
**Enforces heartbeat** - Client must prove it's still running
**Logs security events** - Server can track and alert on violations

### What This Doesn't Prevent

**Determined attackers** - Can still be bypassed with effort
**Modified browsers** - Custom browsers can fake everything
**Proxy tools** - Can intercept and replay requests
**Server-side vulnerabilities** - Doesn't protect your API endpoints

### Best Practices

1. **Always use HTTPS in production**
   ```javascript
   cookie: { secure: true, httpOnly: true, sameSite: 'strict' }
   ```

2. **Use strong secrets**
   ```bash
   # Generate 32-byte random secret
   openssl rand -hex 32
   ```

3. **Monitor termination events**
   ```javascript
   onTerminate: (req, sessionId) => {
       // Log to security monitoring
       securityLogger.alert({
           event: 'devtools_detected',
           sessionId: sessionId,
           ip: req.ip,
           userAgent: req.headers['user-agent'],
           timestamp: new Date()
       });
   }
   ```

4. **Rate limit the API endpoints**
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   app.use('/api/devtools-terminator', rateLimit({
       windowMs: 15 * 60 * 1000, // 15 minutes
       max: 100 // limit each IP to 100 requests per windowMs
   }));
   ```

5. **Combine with other security measures**
   - Server-side authentication
   - API rate limiting
   - Input validation
   - CSRF protection
   - Content Security Policy

## Deployment

### Production Checklist

- [ ] Set `DEVTOOLS_SECRET` environment variable
- [ ] Enable HTTPS
- [ ] Set `cookie.secure = true`
- [ ] Remove `bypassHeader` option
- [ ] Configure `onTerminate` logging
- [ ] Set up security monitoring
- [ ] Test on all target browsers
- [ ] Load test heartbeat endpoints
- [ ] Configure rate limiting
- [ ] Set up alerts for termination events

### Environment Variables

```bash
# Production
export NODE_ENV=production
export DEVTOOLS_SECRET=$(openssl rand -hex 32)
export SESSION_SECRET=$(openssl rand -hex 32)

# Start server
node server.js
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]
```

```bash
# Build
docker build -t devtools-terminator-app .

# Run with secrets
docker run -d \
  -p 3000:3000 \
  -e DEVTOOLS_SECRET=$(openssl rand -hex 32) \
  -e SESSION_SECRET=$(openssl rand -hex 32) \
  devtools-terminator-app
```

## Troubleshooting

### Heartbeat Failing

**Symptom:** Users getting terminated even without opening DevTools

**Solutions:**
1. Increase `maxHeartbeatAge` to 120000 (2 minutes)
2. Check network connectivity
3. Verify API endpoint is accessible
4. Check CORS settings if API is on different domain

### Server Validation Failing

**Symptom:** Console shows "Server validation failed"

**Solutions:**
1. Verify server is running
2. Check API endpoint URL is correct
3. Ensure CORS is configured if needed
4. Check server logs for errors

### False Positives

**Symptom:** Protection triggering on legitimate users

**Solutions:**
1. Set `disableOnMobile: true` for mobile devices
2. Increase `maxHeartbeatAge` for slow connections
3. Add bypass for specific user agents if needed
4. Check server logs to identify patterns

## Migration from Original Version

### Step 1: Keep Original Running

```html
<!-- Keep this working -->
<script src="/devtools-terminator.js"></script>
```

### Step 2: Add Server Module

```javascript
// Add to your server
const devtoolsTerminator = require('./devtools-terminator-server');
app.use(devtoolsTerminator.middleware(options));
```

### Step 3: Test Hybrid Version

```html
<!-- Test on staging -->
<script src="/devtools-terminator-hybrid.js"></script>
```

### Step 4: Switch Production

```html
<!-- Deploy to production -->
<script src="/devtools-terminator-hybrid.js"></script>
```

## Support

- Issues: [GitHub Issues](https://github.com/Mohammad-Faiz-Cloud-Engineer/Devtools-Terminator/issues)
- Documentation: [README.md](README.md)
- Security: [SECURITY.md](SECURITY.md)

---

**Remember:** This is still a deterrent, not an impenetrable security solution. Always implement proper server-side security as your primary defense.
