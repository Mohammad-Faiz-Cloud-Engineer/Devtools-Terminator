# DevTools Terminator

[![Tests](https://github.com/Mohammad-Faiz-Cloud-Engineer/Devtools-Terminator/actions/workflows/test.yml/badge.svg)](https://github.com/Mohammad-Faiz-Cloud-Engineer/Devtools-Terminator/actions/workflows/test.yml)

A lightweight JavaScript library that detects when browser Developer Tools are opened and terminates the user session. Now available in two versions: client-only and hybrid client-server for enhanced security.

**Version:** 2.1.0  
**Author:** Mohammad Faiz  
**License:** MIT  
**Repository:** https://github.com/Mohammad-Faiz-Cloud-Engineer/Devtools-Terminator

## New in v2.1.0: Hybrid Client-Server Mode

The new hybrid version adds server-side validation to make bypassing significantly harder:
- Challenge-response authentication
- Periodic heartbeat monitoring
- Server-side session validation
- Cryptographic proof of execution
- Audit trail of security events
- Script integrity collection (client sends hash to server)

Important security note: the current hybrid flow still ships a browser-visible HMAC input to the client. That means it can provide tamper evidence and server correlation, but it must not be treated as a standalone authentication or authorization control.

**[See Hybrid Setup Guide](docs/HYBRID_SETUP.md)**

---

## New User? Start Here!

**Confused about which files to use?** 

Read these guides:
- **[WHICH_FILES.md](docs/WHICH_FILES.md)** - Visual guide showing exactly which files to copy  
- **[GETTING_STARTED.md](docs/GETTING_STARTED.md)** - Step-by-step setup instructions

These guides answer:
- Which files do I need? (Simple: 2 files, Advanced: 4 files)
- Which version should I use? (Simple vs Advanced)
- Where do I put the files?
- How do I set it up? (Step-by-step)

**Quick links:**
- [Which Files?](docs/WHICH_FILES.md) - Visual guide showing what to copy
- [Getting Started](docs/GETTING_STARTED.md) - Step-by-step setup
- [Quick Start](docs/QUICK_START.md) - 2-minute simple setup
- [Advanced Setup](docs/HYBRID_SETUP.md) - Server-side protection
- [Security Policy](docs/SECURITY.md) - Limitations and reporting

---

## File Structure - What's What?

### New Organized Structure

```
Devtools-Terminator-main/
├── src/                          # Source code
│   ├── client/                   # Client-side libraries
│   │   ├── devtools-terminator.js          # Main library (12KB)
│   │   └── devtools-terminator-hybrid.js   # Enhanced client (16KB)
│   ├── server/                   # Server-side modules
│   │   └── devtools-terminator-server.js   # Server module (12KB)
│   └── types/                    # TypeScript definitions
│       └── devtools-terminator.d.ts        # Type definitions
├── public/                       # Public assets
│   ├── terminated.html           # Termination page
│   └── noscript-handler.html     # NoScript detection handler
├── examples/                     # Demo files
│   ├── demo.html                 # Interactive demo
│   ├── server-example.js         # Server demo
│   ├── typescript-demo.html      # TypeScript demo
│   ├── typescript-demo.ts        # TypeScript examples
│   ├── README.md                 # Examples documentation
│   └── TYPESCRIPT.md             # TypeScript guide
├── docs/                         # Documentation
│   ├── GETTING_STARTED.md        # Setup guide
│   ├── WHICH_FILES.md            # File selection guide
│   ├── HYBRID_SETUP.md           # Advanced setup
│   ├── SECURITY.md               # Security policy
│   ├── QUICK_START.md            # Quick start
│   ├── CHANGELOG.md              # Version history
│   ├── CONTRIBUTING.md           # Contribution guide
│   └── README.md                 # Documentation index
├── assets/                       # Static assets
│   ├── icons/                    # Favicon files
│   │   ├── favicon.svg
│   │   └── favicon-terminated.svg
│   └── README.md                 # Assets documentation
├── .gitignore                    # Git ignore rules
├── .env.example                  # Environment variables template
├── README.md                     # This file
├── LICENSE                       # MIT License
└── package.json                  # Package metadata
```

### Files You Actually Need

**Simple Setup (No Server):**
```
src/client/devtools-terminator.js    <- Main library (12KB)
public/terminated.html               <- Termination page
```

**Advanced Setup (With Server):**
```
src/client/devtools-terminator-hybrid.js   <- Enhanced client (16KB)
src/server/devtools-terminator-server.js   <- Server module (12KB)
public/terminated.html                     <- Termination page
```

### Optional Files

```
src/types/devtools-terminator.d.ts   <- TypeScript definitions
examples/                            <- Demo files (for learning)
docs/                               <- Documentation
assets/                             <- Icons (optional)
```

**Still confused?** Read [GETTING_STARTED.md](docs/GETTING_STARTED.md) for a clear explanation.

---

## Table of Contents

- [New User? Start Here!](#new-user-start-here)
- [File Structure - What's What?](#file-structure---whats-what)
- [Why This Exists](#why-this-exists)
- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [How It Works](#how-it-works)
- [Browser Compatibility](#browser-compatibility)
- [Public API](#public-api)
- [Examples](#examples)
- [Testing](#testing)
- [Building & Distribution](#building--distribution)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [License](#license)

---

## Why This Exists

Sometimes you need to protect client-side code from inspection. Whether it's proprietary algorithms, sensitive business logic, or API keys in a demo environment, this library provides a robust solution. It uses three independent detection methods to catch DevTools access and immediately terminates the session.

This library is a deterrent and monitoring control. It should complement, not replace, standard server-side authorization and transport security.

---

## Features

### Client-Only Version (Original)
- **Triple detection system**: Console logging, window size comparison, and keyboard shortcut interception
- **Fast detection**: 100ms polling interval for near-instant response
- **Mobile-aware**: Smart detection that avoids false positives on phones and tablets
- **Complete cleanup**: Clears localStorage, sessionStorage, cookies, service workers, and caches
- **Zero dependencies**: Pure vanilla JavaScript, small footprint (12KB unminified, ~5KB minified)
- **Configurable**: Customize behavior without editing source code
- **Cross-browser**: Firefox, Safari, Edge, Opera, and Chromium-based browsers fully supported
- **TypeScript support**: Full type definitions with IntelliSense support (.d.ts included)

### Hybrid Version (New in v2.1.0)
- **All client-only features** plus:
- **Server-side validation**: Validates that protection is active and responding
- **Challenge-response**: Cryptographic proof prevents forgery
- **Heartbeat monitoring**: Periodic checks prove protection is still running
- **Session tracking**: Server tracks and enforces valid sessions
- **Audit trail**: Log all security events server-side
- **Bypass resistant**: Much harder to circumvent than client-only
- **Script integrity collection**: Client sends script hash to server for audit trail

**Which version should you use?**
- **Client-only:** Simple setup, no server required, good for demos and static sites
- **Hybrid:** Stronger protection, requires Node.js server, best for sensitive applications

---

## Quick Start

### Client-Only Version (Simple Setup)

Get up and running in 3 simple steps:

### Step 1: Download the Library

```bash
git clone https://github.com/Mohammad-Faiz-Cloud-Engineer/Devtools-Terminator.git
cd Devtools-Terminator
```

### Step 2: Copy Files to Your Project

Copy these two required files:

```bash
# Copy the main library
cp Devtools-Terminator-main/src/client/devtools-terminator.js /path/to/your/project/

# Copy the termination page
cp Devtools-Terminator-main/public/terminated.html /path/to/your/project/

# Optional: Copy TypeScript definitions if using TypeScript
cp Devtools-Terminator-main/src/types/devtools-terminator.d.ts /path/to/your/project/
```

Your project structure should look like:
```
your-project/
├── index.html
├── devtools-terminator.js       ← Main library
├── terminated.html               ← Termination page
└── devtools-terminator.d.ts     ← TypeScript definitions (optional)
```

### Step 3: Add to Your HTML

Add the script tag in your HTML `<head>` section **before** any other scripts:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Protected Application</title>
    
    <!-- Include DevTools Terminator FIRST -->
    <script src="devtools-terminator.js"></script>
    
    <!-- Your other scripts -->
    <script src="app.js"></script>
</head>
<body>
    <h1>Protected Content</h1>
    <p>Try opening DevTools (F12) - you'll be redirected immediately!</p>
</body>
</html>
```

The protection is now active. No configuration needed for basic usage.

### Hybrid Version (Enhanced Security)

For server-side validation and stronger protection:

**Step 1: Install Dependencies**
```bash
npm install express express-session cookie-parser body-parser
```

**Step 2: Setup Server**
```javascript
const devtoolsTerminator = require('./src/server/devtools-terminator-server');

app.use(devtoolsTerminator.middleware({
    secret: process.env.DEVTOOLS_SECRET,
    apiPath: '/api/devtools-terminator',
    onTerminate: (req, sessionId, code) => {
        console.log('DevTools detected:', sessionId, 'Code:', code);
    }
}));
```

**Step 3: Use Hybrid Client**
```html
<script>
window.DEVTOOLS_TERMINATOR_CONFIG = {
    serverValidation: true,
    apiEndpoint: '/api/devtools-terminator'
};
</script>
<script src="src/client/devtools-terminator-hybrid.js"></script>
```

**[→ Full Hybrid Setup Guide](docs/HYBRID_SETUP.md)**

---

Start a local web server (required for proper testing):

```bash
# Using Python 3 (recommended)
python3 -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using PHP
php -S localhost:8000

# Using Node.js (if you have http-server installed)
npx http-server -p 8000
```

Open your browser and navigate to:
```
http://localhost:8000
```

**Try these actions:**
- Press `F12` → Should redirect to terminated.html
- Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac) → Should redirect
- Right-click and select "Inspect" → Context menu blocked
- Press `Ctrl+U` to view source → Blocked

If you see the termination page, it's working correctly!

---

## Installation

### Direct Download

Clone and copy the files you need:

```bash
git clone https://github.com/Mohammad-Faiz-Cloud-Engineer/Devtools-Terminator.git
cd Devtools-Terminator

# Copy main library
cp Devtools-Terminator-main/src/client/devtools-terminator.js your-project/

# Copy termination page
cp Devtools-Terminator-main/public/terminated.html your-project/

# Optional: TypeScript definitions
cp Devtools-Terminator-main/src/types/devtools-terminator.d.ts your-project/
```

### File Structure

```
your-project/
├── devtools-terminator.js       # Main library (required)
├── terminated.html               # Termination page (required)
└── devtools-terminator.d.ts     # TypeScript definitions (optional)
```

---

## Configuration

### Basic Configuration

Set configuration before including the script:

```html
<script>
window.DEVTOOLS_TERMINATOR_CONFIG = {
    terminationUrl: 'terminated.html',
    checkInterval: 100,
    enableWindowSizeCheck: true,
    enableKeyboardBlock: true,
    disableOnMobile: false
};
</script>
<script src="devtools-terminator.js"></script>
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `terminationUrl` | string | `'terminated.html'` | Where to redirect after detection |
| `checkInterval` | number | `100` | Milliseconds between detection checks |
| `enableWindowSizeCheck` | boolean | `true` | Enable window size detection method |
| `enableKeyboardBlock` | boolean | `true` | Block DevTools keyboard shortcuts |
| `disableOnMobile` | boolean | `false` | Force disable on mobile devices |
| `onTerminate` | function | `null` | Custom handler called on detection |

---

## How It Works

The library uses three independent detection methods:

### 1. Console Logging Detection (Primary)

When DevTools console is open, the browser tries to display logged objects in a readable format. We exploit this by defining a property getter that triggers when the console reads it.

### 2. Window Size Detection (Desktop Only)

When DevTools docks to the side or bottom, it creates a difference between outer and inner window dimensions. This method is disabled on mobile devices to prevent false positives.

### 3. Keyboard Shortcut Blocking

All common DevTools shortcuts are intercepted: F12, Ctrl+Shift+I/J/C, Ctrl+U, and Mac equivalents.

### What Happens on Detection

When DevTools are detected:
1. Clears all localStorage data
2. Clears all sessionStorage data
3. Deletes all cookies
4. Unregisters service workers
5. Clears browser caches
6. Redirects to termination page (prevents back button)

---

## Browser Compatibility

### Fully Supported Browsers

| Browser | Minimum Version | Platforms | Status |
|---------|----------------|-----------|--------|
| **Firefox** | 88+ | Windows, macOS, Linux | Recommended |
| **Safari** | 14+ | macOS, iOS | Recommended |
| **Microsoft Edge** | 90+ | Windows, macOS, Linux | Recommended |
| **Opera** | 76+ | Windows, macOS, Linux | Supported |
| **Brave** | All | Windows, macOS, Linux | Supported |
| **Vivaldi** | All | Windows, macOS, Linux | Supported |
| **Arc** | All | macOS | Supported |
| **Chrome Mobile** | All | Android | Supported |
| **Safari Mobile** | All | iOS | Supported |

---

## Public API

The library exposes a global object for programmatic control:

```javascript
// Check version
console.log(window.DevToolsTerminator.version); // "2.1.0"

// Check if session has been terminated
console.log(window.DevToolsTerminator.isTerminated()); // false

// Manually trigger termination
window.DevToolsTerminator.terminate();

// View current configuration
console.log(window.DevToolsTerminator.config);
```

---

## Examples

See the `examples/` directory:
- `demo.html` - Interactive JavaScript demonstration
- `server-example.js` - Server-side integration example
- `typescript-demo.html` - Interactive TypeScript demonstration
- `typescript-demo.ts` - Comprehensive TypeScript examples (12 patterns)
- `TYPESCRIPT.md` - Complete TypeScript integration guide

---

## Testing

### Manual Testing Checklist

Start a local server and open `examples/demo.html`:

```bash
python3 -m http.server 8000
# Open http://localhost:8000/Devtools-Terminator-main/examples/demo.html
```

**Test Cases:**
1. Press F12 → Should redirect immediately
2. Right-click → Context menu should be blocked
3. Ctrl+Shift+I → Should redirect immediately
4. Ctrl+Shift+J → Should redirect immediately
5. Ctrl+U → Should be blocked
6. Open DevTools via browser menu → Should detect within 100-200ms

---

## Security Considerations

### What This Library Does

DevTools Terminator is a **client-side deterrent** that:
- Detects when browser Developer Tools are opened
- Terminates the user session
- Clears local storage, session storage, and cookies
- Redirects to a termination page

### What This Library Does NOT Do

This is **not** a security solution. It is a deterrent only.

**Important Limitations:**
1. **Bypassable**: Determined users can bypass this
2. **Client-Side Only**: All code runs in the browser
3. **Not a Replacement**: Never replace server-side security

### Proper Use Cases

**Good Uses:**
- Protecting proprietary algorithms in demos
- Deterring casual code inspection
- Educational environments
- Adding an extra layer to already-secured applications

**Bad Uses:**
- Hiding malicious code
- As the only security measure
- Protecting sensitive data (use server-side security)

---

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

---

## Changelog

### [2.1.0] - 2026-04-13

**Added:**
- Hybrid client-server mode with server-side validation
- Challenge-response authentication
- Heartbeat monitoring
- Script integrity collection (client sends hash to server)
- Security event logging
- New documentation: HYBRID_SETUP.md, GETTING_STARTED.md, WHICH_FILES.md

**Changed:**
- Enhanced security architecture
- Improved documentation structure
- Professional tone throughout
- Reorganized file structure for better clarity

**Fixed:**
- Timing attack vulnerability
- Session fixation vulnerability
- Memory leak in SessionStore
- Path traversal protection
- Crypto API availability check

See [CHANGELOG.md](docs/CHANGELOG.md) for complete details.

### [2.0.0] - 2026-04-13

**Changed:**
- Upgraded to version 2.0.0 with comprehensive security and code quality improvements
- Enhanced URL validation with path traversal protection
- Improved error handling with descriptive comments
- Refactored code for better maintainability
- Frozen public API config object to prevent external modifications

---

## License

MIT License - Copyright (c) 2026 Mohammad Faiz

See [LICENSE](LICENSE) for full text.

---

## Support

- **Issues**: [GitHub Issues](https://github.com/Mohammad-Faiz-Cloud-Engineer/Devtools-Terminator/issues)
- **Repository**: https://github.com/Mohammad-Faiz-Cloud-Engineer/Devtools-Terminator
- **Author**: Mohammad Faiz ([@Mohammad-Faiz-Cloud-Engineer](https://github.com/Mohammad-Faiz-Cloud-Engineer))

---

**Created by Mohammad Faiz** | Open-sourced for the developer community.
