# Examples

This directory contains example implementations and demo pages for DevTools Terminator.

## Available Examples

### Client-Only Version (v2.0.0-2.1.0)

#### demo.html
Interactive demonstration page showing all features of DevTools Terminator in action.

**To run:**
```bash
# Using Python 3 (recommended)
python3 -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using PHP
php -S localhost:8000

# Then open: http://localhost:8000/examples/demo.html
```

#### terminated.html
The default termination page that users see when DevTools are detected. This page:
- Displays a security message
- Clears all remaining session data
- Prevents navigation back to protected pages
- Can be customized for your application

### Hybrid Version (v2.1.0)

#### server-example.js
Complete Express server demonstrating hybrid client-server protection.

**To run:**
```bash
# Install dependencies from the repository root
npm install

# Start server
npm start

# Open browser
# http://localhost:3000
```

**Features:**
- Protected and public pages
- Challenge-response authentication
- Heartbeat monitoring
- Security event logging
- Interactive demo

Security note: the demo injects a browser-visible token so you can exercise the heartbeat flow locally. That token is not suitable as a production authentication secret.

### TypeScript Examples

#### typescript-demo.ts
Comprehensive TypeScript examples (12 patterns) demonstrating type-safe usage.

#### typescript-demo.html
Interactive browser demo showing TypeScript integration.

**To compile:**
```bash
tsc examples/typescript-demo.ts --target ES2020 --lib DOM,ES2020
```

## Customization

### Customize Termination Page

1. Copy `terminated.html` to your project
2. Modify the HTML/CSS to match your brand
3. Configure the `terminationUrl` in your config:

```javascript
window.DEVTOOLS_TERMINATOR_CONFIG = {
    terminationUrl: '/your-custom-page.html'
};
```

### Customize Server Behavior

```javascript
app.use(devtoolsTerminator.middleware({
    secret: process.env.DEVTOOLS_SECRET,
    protectedPaths: ['/admin', '/dashboard'],
    onTerminate: (req, sessionId) => {
        // Your custom logic
        console.log('Security event:', sessionId);
        // Send alert, log to database, etc.
    }
}));
```

## Integration Examples

### Client-Only Integration

```bash
# Copy the library
cp src/client/devtools-terminator.js your-project/

# Copy the termination page
cp public/terminated.html your-project/

# Include in your HTML
<script src="devtools-terminator.js"></script>
```

### Hybrid Integration

```bash
# Copy files
cp src/client/devtools-terminator-hybrid.js your-project/public/
cp src/server/devtools-terminator-server.js your-project/
cp public/terminated.html your-project/public/
cp public/noscript-handler.html your-project/public/

# Install dependencies
npm install express express-session cookie-parser body-parser

# Setup server (see server-example.js)
# Include in your HTML
<script src="devtools-terminator-hybrid.js"></script>
```

## Documentation

For more details, see:
- [Quick Start Guide](../docs/QUICK_START.md)
- [Hybrid Setup Guide](../docs/HYBRID_SETUP.md)
- [Getting Started](../docs/GETTING_STARTED.md)
- [TypeScript Guide](TYPESCRIPT.md)

## Testing

### Test Client-Only Version

1. Open `demo.html` in browser
2. Try opening DevTools (F12)
3. Should be redirected to `terminated.html`

### Test Hybrid Version

1. Run `server-example.js`
2. Open http://localhost:3000
3. Visit protected pages
4. Try opening DevTools
5. Check server logs for security events

### Test TypeScript

1. Compile: `tsc`
2. Check for type errors
3. Open `typescript-demo.html` in browser

## Troubleshooting

### Protection Not Working

1. Check file paths are correct
2. Use a web server (not file://)
3. Check browser compatibility
4. Look for JavaScript errors in console

### Hybrid Version Issues

1. Verify server is running
2. Check API endpoint URL
3. Ensure dependencies installed
4. Check server logs for errors

### False Positives

1. Set `disableOnMobile: true` for mobile
2. Increase `maxHeartbeatAge` for slow connections
3. Check server logs for patterns

## Support

- Main Documentation: [../README.md](../README.md)
- Issues: [GitHub Issues](https://github.com/Mohammad-Faiz-Cloud-Engineer/Devtools-Terminator/issues)
- Security: [../docs/SECURITY.md](../docs/SECURITY.md)
