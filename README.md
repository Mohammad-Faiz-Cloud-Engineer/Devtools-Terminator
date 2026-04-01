# DevTools Terminator

A lightweight JavaScript library that detects when browser Developer Tools are opened and terminates the user session. Zero dependencies, under 5KB, production-ready.

**Version:** 1.0.0  
**Author:** Mohammad Faiz  
**License:** MIT  
**Repository:** https://github.com/Mohammad-Faiz-Cloud-Engineer/Devtools-Terminator

---

## Table of Contents

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

This isn't security theater. The code is battle-tested in production on the Rox AI platform.

---

## Features

- **Triple detection system**: Console logging, window size comparison, and keyboard shortcut interception
- **Fast detection**: 100ms polling interval for near-instant response
- **Mobile-aware**: Smart detection that avoids false positives on phones and tablets
- **Complete cleanup**: Clears localStorage, sessionStorage, cookies, service workers, and caches
- **Zero dependencies**: Pure vanilla JavaScript, under 5KB when minified
- **Configurable**: Customize behavior without editing source code
- **Cross-browser**: Firefox, Safari, Edge, Opera, and Chromium-based browsers fully supported
- **TypeScript support**: Full type definitions with IntelliSense support (.d.ts included)

---

## Quick Start

Get up and running in 3 simple steps:

### Step 1: Download the Library

```bash
git clone https://github.com/Mohammad-Faiz-Cloud-Engineer/Devtools-Terminator.git
cd Devtools-Terminator/devtools-terminator
```

### Step 2: Copy Files to Your Project

Copy these two required files:

```bash
# Copy the main library
cp devtools-terminator.js /path/to/your/project/

# Copy the termination page
cp examples/terminated.html /path/to/your/project/

# Optional: Copy TypeScript definitions if using TypeScript
cp devtools-terminator.d.ts /path/to/your/project/
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

**That's it!** The protection is now active. No configuration needed for basic usage.

### Step 4: Test the Protection

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

## Complete Usage Guide

### Basic Usage (No Configuration)

The simplest way to use the library - just include the script:

```html
<!DOCTYPE html>
<html>
<head>
    <script src="devtools-terminator.js"></script>
</head>
<body>
    <!-- Your content -->
</body>
</html>
```

**Default behavior:**
- Redirects to `terminated.html` when DevTools detected
- Checks every 100ms
- All detection methods enabled
- Works on desktop and mobile

### Advanced Usage (With Configuration)

Customize the behavior by setting configuration **before** including the script:

```html
<!DOCTYPE html>
<html>
<head>
    <!-- Configure BEFORE including the script -->
    <script>
    window.DEVTOOLS_TERMINATOR_CONFIG = {
        terminationUrl: 'custom-page.html',  // Your custom termination page
        checkInterval: 100,                   // Check every 100ms
        enableWindowSizeCheck: true,          // Enable window size detection
        enableKeyboardBlock: true,            // Block keyboard shortcuts
        disableOnMobile: false,               // Enable on mobile devices
        onTerminate: function() {             // Custom handler (optional)
            console.log('DevTools detected!');
            // Your custom logic here
        }
    };
    </script>
    
    <!-- Include the library AFTER configuration -->
    <script src="devtools-terminator.js"></script>
</head>
<body>
    <!-- Your content -->
</body>
</html>
```

### Usage with TypeScript

For TypeScript projects, reference the type definitions:

```typescript
/// <reference path="./devtools-terminator.d.ts" />

// Configure with full type safety and IntelliSense
window.DEVTOOLS_TERMINATOR_CONFIG = {
    terminationUrl: 'terminated.html',
    checkInterval: 100,
    enableWindowSizeCheck: true,
    enableKeyboardBlock: true
};

// Access the API with type checking
const api: DevToolsTerminatorAPI = window.DevToolsTerminator;
console.log('Version:', api.version);
console.log('Is terminated:', api.isTerminated());
```

See `examples/TYPESCRIPT.md` for complete TypeScript integration guide.

### Usage in Different Environments

#### Static HTML Sites

```html
<script src="devtools-terminator.js"></script>
```

#### PHP Applications

```php
<!DOCTYPE html>
<html>
<head>
    <?php if ($requireProtection): ?>
        <script src="devtools-terminator.js"></script>
    <?php endif; ?>
</head>
<body>
    <!-- Your content -->
</body>
</html>
```

#### React Applications

```jsx
// In your public/index.html
<!DOCTYPE html>
<html>
<head>
    <script src="%PUBLIC_URL%/devtools-terminator.js"></script>
</head>
<body>
    <div id="root"></div>
</body>
</html>
```

Or dynamically load it:

```jsx
import { useEffect } from 'react';

function App() {
    useEffect(() => {
        // Configure before loading
        window.DEVTOOLS_TERMINATOR_CONFIG = {
            terminationUrl: '/terminated.html'
        };
        
        // Load the script
        const script = document.createElement('script');
        script.src = '/devtools-terminator.js';
        script.async = true;
        document.head.appendChild(script);
        
        return () => {
            document.head.removeChild(script);
        };
    }, []);
    
    return <div>Your App</div>;
}
```

#### Vue Applications

```html
<!-- In your public/index.html -->
<!DOCTYPE html>
<html>
<head>
    <script src="<%= BASE_URL %>devtools-terminator.js"></script>
</head>
<body>
    <div id="app"></div>
</body>
</html>
```

#### Angular Applications

```html
<!-- In your src/index.html -->
<!DOCTYPE html>
<html>
<head>
    <script src="devtools-terminator.js"></script>
</head>
<body>
    <app-root></app-root>
</body>
</html>
```

#### Next.js Applications

```jsx
// In pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html>
            <Head>
                <script src="/devtools-terminator.js"></script>
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
```

### Common Use Cases

#### 1. Protect Only Production

```html
<script>
// Only load in production
if (window.location.hostname !== 'localhost' && 
    window.location.hostname !== '127.0.0.1') {
    var script = document.createElement('script');
    script.src = 'devtools-terminator.js';
    document.head.appendChild(script);
}
</script>
```

#### 2. Protect Specific Pages

```html
<!-- Only on admin pages -->
<?php if ($isAdminPage): ?>
    <script src="devtools-terminator.js"></script>
<?php endif; ?>
```

#### 3. Custom Termination Logic

```html
<script>
window.DEVTOOLS_TERMINATOR_CONFIG = {
    onTerminate: function() {
        // Log to your analytics
        fetch('/api/security-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event: 'devtools_detected',
                timestamp: new Date().toISOString(),
                page: window.location.pathname,
                userAgent: navigator.userAgent
            })
        });
        
        // Show custom message before redirect
        alert('Developer tools detected. Session will be terminated.');
        
        // Default termination will still occur
    }
};
</script>
<script src="devtools-terminator.js"></script>
```

#### 4. Disable on Mobile Devices

```html
<script>
window.DEVTOOLS_TERMINATOR_CONFIG = {
    disableOnMobile: true  // Won't activate on phones/tablets
};
</script>
<script src="devtools-terminator.js"></script>
```

#### 5. Custom Termination Page

```html
<script>
window.DEVTOOLS_TERMINATOR_CONFIG = {
    terminationUrl: '/security/access-denied.html'
};
</script>
<script src="devtools-terminator.js"></script>
```

### Using the Public API

After the library loads, you can interact with it programmatically:

```javascript
// Wait for library to load
document.addEventListener('DOMContentLoaded', function() {
    // Check if library is loaded
    if (window.DevToolsTerminator) {
        // Get version
        var version = window.DevToolsTerminator.version;
        console.log('Protected by DevTools Terminator v' + version);
        
        // Check if session is terminated
        var isTerminated = window.DevToolsTerminator.isTerminated();
        console.log('Session terminated:', isTerminated);
        
        // Get current configuration
        var config = window.DevToolsTerminator.config;
        console.log('Check interval:', config.checkInterval + 'ms');
        
        // Manually trigger termination (if needed)
        // window.DevToolsTerminator.terminate();
    }
});
```

### Customizing the Termination Page

The `terminated.html` page can be customized to match your brand:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Access Denied</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            text-align: center;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #e74c3c; }
    </style>
</head>
<body>
    <div class="container">
        <h1>⛔ Access Denied</h1>
        <p>Developer tools access has been detected.</p>
        <p>Your session has been terminated for security reasons.</p>
        <p>Error Code: SEC_DEVTOOLS_001</p>
    </div>
    
    <!-- Keep the cleanup script from the original terminated.html -->
    <script>
        // Cleanup script here (copy from original terminated.html)
    </script>
</body>
</html>
```

### Troubleshooting

**Protection not working?**

1. **Check file paths** - Ensure `devtools-terminator.js` and `terminated.html` are in the correct locations
2. **Use a web server** - Don't open HTML files directly (file://), use http://localhost
3. **Check browser** - Chrome desktop has limited support, use Firefox, Safari, or Edge
4. **Check console** - Look for JavaScript errors before DevTools closes
5. **Verify script order** - Configuration must be set BEFORE including the script

**False positives on mobile?**

```javascript
window.DEVTOOLS_TERMINATOR_CONFIG = {
    disableOnMobile: true
};
```

**Want to test without termination?**

Comment out the script temporarily:

```html
<!-- <script src="devtools-terminator.js"></script> -->
```

---

## Installation

### Direct Download

Clone and copy the files you need:

```bash
git clone https://github.com/Mohammad-Faiz-Cloud-Engineer/Devtools-Terminator.git
cd Devtools-Terminator/devtools-terminator

# Copy main library
cp devtools-terminator.js your-project/

# Copy termination page
cp examples/terminated.html your-project/

# Optional: TypeScript definitions
cp devtools-terminator.d.ts your-project/
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

### Configuration Examples

**Custom termination page:**

```javascript
window.DEVTOOLS_TERMINATOR_CONFIG = {
    terminationUrl: '/custom-page.html'
};
```

**Custom termination handler:**

```javascript
window.DEVTOOLS_TERMINATOR_CONFIG = {
    onTerminate: function() {
        // Log to analytics
        fetch('/api/security-event', {
            method: 'POST',
            body: JSON.stringify({ event: 'devtools_detected' })
        });
    }
};
```

**Disable on mobile:**

```javascript
window.DEVTOOLS_TERMINATOR_CONFIG = {
    disableOnMobile: true
};
```

---

## How It Works

The library uses three independent detection methods:

### 1. Console Logging Detection (Primary)

When DevTools console is open, the browser tries to display logged objects in a readable format. We exploit this by defining a property getter that triggers when the console reads it:

```javascript
var element = new Image();
Object.defineProperty(element, 'id', {
    get: function() {
        // DevTools is open
        terminateSession();
    }
});

console.log(element); // Triggers getter if console is open
```

### 2. Window Size Detection (Desktop Only)

When DevTools docks to the side or bottom, it creates a difference between outer and inner window dimensions:

```javascript
var widthDiff = window.outerWidth - window.innerWidth;
var heightDiff = window.outerHeight - window.innerHeight;

if (widthDiff > 160 || heightDiff > 160) {
    // DevTools is likely open
}
```

This method is disabled on mobile devices to prevent false positives from dynamic toolbars, notches, and keyboards.

### 3. Keyboard Shortcut Blocking

All common DevTools shortcuts are intercepted:

- F12
- Ctrl+Shift+I (Windows/Linux)
- Ctrl+Shift+J (Console)
- Ctrl+Shift+C (Inspect Element)
- Ctrl+U (View Source)
- Cmd+Option+I (Mac)
- Cmd+Option+J (Mac Console)
- Cmd+Option+U (Mac View Source)

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
| **Firefox** | 88+ | Windows, macOS, Linux | ✅ Recommended |
| **Safari** | 14+ | macOS, iOS | ✅ Recommended |
| **Microsoft Edge** | 90+ | Windows, macOS, Linux | ✅ Recommended |
| **Opera** | 76+ | Windows, macOS, Linux | ✅ Supported |
| **Brave** | All | Windows, macOS, Linux | ✅ Supported |
| **Vivaldi** | All | Windows, macOS, Linux | ✅ Supported |
| **Arc** | All | macOS | ✅ Supported |
| **Chrome Mobile** | All | Android | ✅ Supported |
| **Safari Mobile** | All | iOS | ✅ Supported |

### Chrome Desktop - Limited Support

| Platform | Support | Details |
|----------|---------|---------|
| Windows | Conditional | Blocked on large monitors (>1920px width) |
| Linux | Not Supported | Use Firefox or Brave instead |
| macOS | Conditional | Blocked on large monitors (>1920px width) |
| Android | Full Support | Chrome Mobile works perfectly |

**Why Chrome Desktop is Limited:**

Chrome's DevTools are highly optimized for viewing client-side code, making inspection extremely easy. This library aims to deter casual inspection, which Chrome makes too simple.

**Important:** Chromium-based browsers (Brave, Vivaldi, Arc, Edge) ARE fully supported. Only the official Google Chrome browser has these limitations.

---

## Public API

The library exposes a global object for programmatic control:

```javascript
// Check version
console.log(window.DevToolsTerminator.version); // "1.0.0"

// Check if session has been terminated
console.log(window.DevToolsTerminator.isTerminated()); // false

// Manually trigger termination
window.DevToolsTerminator.terminate();

// View current configuration
console.log(window.DevToolsTerminator.config);
// {
//   terminationUrl: 'terminated.html',
//   checkInterval: 100,
//   enableWindowSizeCheck: true,
//   enableKeyboardBlock: true,
//   disableOnMobile: false
// }
```

---

## Examples

### Protect Only Specific Pages

```html
<?php if ($page === 'admin' || $page === 'dashboard'): ?>
    <script src="devtools-terminator.js"></script>
<?php endif; ?>
```

### Disable in Development

```html
<script>
if (window.location.hostname !== 'localhost' && 
    window.location.hostname !== '127.0.0.1') {
    var script = document.createElement('script');
    script.src = 'devtools-terminator.js';
    document.head.appendChild(script);
}
</script>
```

### Log Detection Events

```javascript
window.DEVTOOLS_TERMINATOR_CONFIG = {
    onTerminate: function() {
        fetch('/api/log', {
            method: 'POST',
            body: JSON.stringify({
                event: 'devtools_detected',
                timestamp: Date.now()
            })
        });
    }
};
```

### Demo Files

See the `examples/` directory:
- `demo.html` - Interactive JavaScript demonstration
- `terminated.html` - Default termination page (customizable)
- `typescript-demo.html` - Interactive TypeScript demonstration
- `typescript-demo.ts` - Comprehensive TypeScript examples (12 patterns)
- `TYPESCRIPT.md` - Complete TypeScript integration guide

---

## Testing

### Manual Testing Checklist

Start a local server and open `examples/demo.html`:

```bash
python3 -m http.server 8000
# Open http://localhost:8000/examples/demo.html
```

**Test Cases:**

1. ✓ Press F12 → Should redirect immediately
2. ✓ Right-click → Context menu should be blocked
3. ✓ Ctrl+Shift+I → Should redirect immediately
4. ✓ Ctrl+Shift+J → Should redirect immediately
5. ✓ Ctrl+U → Should be blocked
6. ✓ Open DevTools via browser menu → Should detect within 100-200ms
7. ✓ Test on mobile → No false positives from keyboard/toolbar
8. ✓ Test on iOS → No false positives from Safari address bar

### Browser Testing

Test on each supported browser:
- Firefox 88+ ✓
- Safari 14+ ✓
- Edge 90+ ✓
- Opera 76+ ✓
- Brave ✓
- Chrome Mobile (Android) ✓

### Performance Metrics

Expected performance:
- Memory usage: < 1MB
- CPU impact: Negligible
- Load time: < 10ms
- File size: ~12KB (unminified), ~4-5KB (minified)

---

## Building & Distribution

### Creating Minified Version

**Option 1: Online Tools (No Installation)**

1. Go to https://javascript-minifier.com/
2. Copy contents of `devtools-terminator.js`
3. Paste and click "Minify"
4. Save as `devtools-terminator.min.js`

**Option 2: Command Line (If Node.js Installed)**

```bash
# Using Terser
terser devtools-terminator.js \
    --compress \
    --mangle \
    --comments "/^!/" \
    --output devtools-terminator.min.js

# Using UglifyJS
uglifyjs devtools-terminator.js \
    --compress \
    --mangle \
    --output devtools-terminator.min.js
```

### Distribution Files

Include these files when distributing:
- `devtools-terminator.js` (main library)
- `devtools-terminator.min.js` (minified, optional)
- `devtools-terminator.d.ts` (TypeScript definitions)
- `examples/terminated.html` (termination page)
- `README.md`
- `LICENSE`

### Pre-Release Checklist

- [ ] All tests pass
- [ ] Version number updated in:
  - [ ] devtools-terminator.js (header comment)
  - [ ] devtools-terminator.d.ts (header comment)
  - [ ] README.md
- [ ] No console.log debug statements
- [ ] No TODO/FIXME comments
- [ ] Documentation reviewed
- [ ] Examples tested

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

1. **Bypassable**: Determined users can bypass this using:
   - Modified browsers
   - Browser extensions that disable JavaScript
   - Virtual machines with debugging tools
   - Remote debugging protocols
   - Proxy tools

2. **Client-Side Only**: All code runs in the browser and can be:
   - Disabled by turning off JavaScript
   - Modified by the user
   - Bypassed by intercepting network requests

3. **Not a Replacement**: This should never replace:
   - Server-side authentication
   - Server-side authorization
   - API security
   - Proper encryption
   - Rate limiting
   - Input validation

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
- Preventing legitimate security audits
- Violating user privacy

### Security Best Practices

When using this library:

1. **Always implement server-side security first**
2. **Never store sensitive data client-side**
3. **Use HTTPS for all communications**
4. **Implement proper authentication and authorization**
5. **Validate all inputs on the server**
6. **Use this as one layer in defense-in-depth strategy**

### Reporting Security Vulnerabilities

If you discover a security vulnerability:

1. **Do NOT** open a public GitHub issue
2. Create a private security advisory on GitHub
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

**Response Timeline:**
- 24 hours: Initial response
- 7 days: Assessment
- 30 days: Fix released (if applicable)

---

## Contributing

Contributions are welcome! Here's how to help:

### Getting Started

```bash
# Fork and clone
git clone https://github.com/your-username/Devtools-Terminator.git
cd Devtools-Terminator/devtools-terminator

# Create a branch
git checkout -b feature/my-feature

# Start local server for testing
python3 -m http.server 8000

# Make changes and test
# Open http://localhost:8000/examples/demo.html

# Commit and push
git add .
git commit -m "Description of changes"
git push origin feature/my-feature
```

### Coding Standards

- Use ES5 syntax for maximum browser compatibility
- Follow existing code style
- Add comments for complex logic
- Keep functions small and focused
- Avoid external dependencies
- Test on multiple browsers

### Code Style Example

```javascript
// Good
function checkDevTools() {
    devtoolsOpen = false;
    console.log(element);
    console.clear();
    return devtoolsOpen;
}

// Bad
function checkDevTools(){
  devtoolsOpen=false;
  console.log(element);console.clear();
  return devtoolsOpen;
}
```

### Testing Requirements

Before submitting a pull request:

1. Test on Firefox, Safari, Edge, and Chromium-based browsers
2. Test on desktop and mobile
3. Verify DevTools detection works
4. Check termination page displays correctly
5. Ensure no console errors
6. Test with different configuration options

### What We're Looking For

- Bug fixes
- Browser compatibility improvements
- Performance optimizations
- Better mobile detection
- Documentation improvements
- Additional detection methods

### What We're Not Looking For

- External dependencies
- Breaking changes without discussion
- Features that significantly increase file size
- Code that only works in specific browsers

---

## Changelog

### [1.0.0] - 2026-04-01

**Added:**
- Initial public release
- Triple detection system (console logging, window size, keyboard shortcuts)
- Configurable behavior via `window.DEVTOOLS_TERMINATOR_CONFIG`
- Public API for programmatic control
- Mobile device detection with smart false positive prevention
- Complete session cleanup (localStorage, sessionStorage, cookies, service workers, caches)
- Custom termination handler support
- Zero external dependencies
- Cross-browser compatibility
- TypeScript definitions
- Comprehensive documentation
- Demo and example pages

**Detection Methods:**
- Console logging detection using property getters
- Window size comparison (160px threshold)
- Keyboard shortcut interception (F12, Ctrl+Shift+I/J/C, Ctrl+U, Mac shortcuts)
- iOS and Android device detection
- Automatic mobile optimization

**Security Features:**
- Immediate session termination on detection
- Complete data wipe
- Redirect with no back button
- Right-click context menu disabled
- Text selection protection
- Drag and drop disabled

---

## Performance

- **File size**: ~12KB (unminified), ~4-5KB (minified), ~2KB (gzipped)
- **Memory usage**: Less than 1MB
- **CPU impact**: Negligible (100ms polling)
- **Load time**: Under 10ms
- **Dependencies**: Zero

---

## Project Structure

```
devtools-terminator/
├── devtools-terminator.js       # Main library
├── devtools-terminator.d.ts     # TypeScript definitions
├── devtools-terminator.min.js   # Minified version (create via build)
├── examples/
│   ├── demo.html                # Interactive demo
│   └── terminated.html          # Termination page
├── assets/
│   └── icons/
│       ├── favicon.svg          # Main favicon
│       └── favicon-terminated.svg # Termination favicon
├── .editorconfig                # Editor configuration
├── .gitignore                   # Git ignore rules
├── .npmignore                   # NPM ignore rules
├── package.json                 # Package metadata
├── README.md                    # This file
└── LICENSE                      # MIT License
```

---

## Limitations

This is not foolproof. Determined users can bypass it with:

- Modified browsers
- Browser extensions that disable JavaScript
- Virtual machines with debugging tools
- Remote debugging protocols

This library is a deterrent, not an impenetrable wall. Always implement proper server-side security as your primary defense.

---

## Disclaimer

This tool is provided as-is for legitimate security purposes. The author is not responsible for misuse or any damages caused by this software. Always comply with applicable laws and respect user privacy.

**This is a deterrent, not a security solution.** Always implement proper server-side security.

---

## License

MIT License

Copyright (c) 2026 Mohammad Faiz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## Support

- **Issues**: [GitHub Issues](https://github.com/Mohammad-Faiz-Cloud-Engineer/Devtools-Terminator/issues)
- **Repository**: https://github.com/Mohammad-Faiz-Cloud-Engineer/Devtools-Terminator
- **Author**: Mohammad Faiz ([@Mohammad-Faiz-Cloud-Engineer](https://github.com/Mohammad-Faiz-Cloud-Engineer))

---

**Created by Mohammad Faiz** | Extracted from the Rox AI platform and open-sourced for the developer community.
