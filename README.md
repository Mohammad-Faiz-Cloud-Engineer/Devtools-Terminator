# DevTools Terminator

A lightweight JavaScript library that detects when browser Developer Tools are opened and terminates the user session. Built for production use and extracted from the Rox AI platform.

**Author:** Mohammad Faiz  
**Repository:** https://github.com/Mohammad-Faiz-Cloud-Engineer/Devtools-Terminator

---

## Why This Exists

Sometimes you need to protect client-side code from inspection. Whether it's proprietary algorithms, sensitive business logic, or API keys in a demo environment, this library provides a robust solution. It uses three independent detection methods to catch DevTools access and immediately terminates the session.

This isn't security theater. The code is battle-tested in production on the Rox AI platform.

## Features

- **Triple detection system**: Console logging, window size comparison, and keyboard shortcut interception
- **Fast detection**: Checks every 100ms for near-instant response
- **Mobile-aware**: Smart detection that avoids false positives on phones and tablets
- **Complete cleanup**: Clears localStorage, sessionStorage, cookies, service workers, and caches
- **Zero dependencies**: Pure vanilla JavaScript, under 5KB
- **Configurable**: Customize behavior without editing the source code
- **Cross-browser**: Works on Chrome, Firefox, Safari, Edge, and Opera

## Installation

### Direct Download

Clone the repository and copy the files you need:

```bash
# Clone the repository
git clone https://github.com/Mohammad-Faiz-Cloud-Engineer/Devtools-Terminator.git

# Copy the main library file
cp Devtools-Terminator/devtools-terminator/devtools-terminator.js your-project/

# Copy the termination page
cp Devtools-Terminator/devtools-terminator/examples/terminated.html your-project/

# Optional: Copy TypeScript definitions if using TypeScript
cp Devtools-Terminator/devtools-terminator/devtools-terminator.d.ts your-project/
```

### Direct Download

## Quick Start

Include the script in your HTML. That's it.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Protected Application</title>
    <script src="devtools-terminator.js"></script>
</head>
<body>
    <h1>Your content here</h1>
</body>
</html>
```

When someone tries to open DevTools (F12, right-click inspect, etc.), they'll be redirected to a termination page and all their session data will be cleared.

## Configuration

If you need to customize the behavior, set the configuration before including the script:

```html
<script>
window.DEVTOOLS_TERMINATOR_CONFIG = {
    terminationUrl: 'terminated.html',  // Relative to current page
    checkInterval: 100,
    enableWindowSizeCheck: true,
    enableKeyboardBlock: true,
    disableOnMobile: false,
    onTerminate: function() {
        // Custom termination logic
    }
};
</script>
<script src="devtools-terminator.js"></script>
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `terminationUrl` | string | `terminated.html` | Where to redirect after detection |
| `checkInterval` | number | `100` | Milliseconds between detection checks |
| `enableWindowSizeCheck` | boolean | `true` | Enable window size detection method |
| `enableKeyboardBlock` | boolean | `true` | Block DevTools keyboard shortcuts |
| `disableOnMobile` | boolean | `false` | Force disable on mobile devices |
| `onTerminate` | function | `null` | Custom handler called on detection |

## How It Works

The library uses three independent detection methods:

### 1. Console Logging Detection

This is the primary method. When DevTools console is open, the browser tries to display logged objects in a readable format. We exploit this by defining a property getter that triggers when the console reads it:

```javascript
const element = new Image();
Object.defineProperty(element, 'id', {
    get: function() {
        // DevTools is open
        terminateSession();
    }
});

console.log(element); // Triggers getter if console is open
```

### 2. Window Size Detection

When DevTools docks to the side or bottom of the browser, it creates a difference between the outer and inner window dimensions. We check if this difference exceeds 160 pixels:

```javascript
const widthDiff = window.outerWidth - window.innerWidth;
const heightDiff = window.outerHeight - window.innerHeight;

if (widthDiff > 160 || heightDiff > 160) {
    // DevTools is likely open
}
```

This method is disabled on mobile devices because dynamic toolbars, notches, and keyboards cause false positives.

### 3. Keyboard Shortcut Blocking

All common DevTools shortcuts are intercepted and blocked:

- F12
- Ctrl+Shift+I (Windows/Linux)
- Ctrl+Shift+J (Console)
- Ctrl+Shift+C (Inspect Element)
- Ctrl+U (View Source)
- Cmd+Option+I (Mac)
- Cmd+Option+J (Mac Console)
- Cmd+Option+U (Mac View Source)

When any of these are pressed, the session is terminated immediately.

## What Happens on Detection

When DevTools are detected, the library:

1. Clears all localStorage data
2. Clears all sessionStorage data
3. Deletes all cookies
4. Unregisters service workers
5. Clears browser caches
6. Redirects to the termination page using `window.location.replace()` (prevents back button)

The termination page itself also runs cleanup code and prevents navigation back to the protected page.

## Browser Compatibility

Tested and working on:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Opera 76+
- Mobile browsers (with smart detection)

## Performance

- Memory usage: Less than 1MB
- CPU impact: Negligible (runs every 100ms)
- Load time: Under 10ms
- Network requests: Zero (no external dependencies)

## Limitations

This is not foolproof. Determined users can bypass it with:

- Modified browsers
- Browser extensions that disable JavaScript
- Virtual machines with debugging tools
- Remote debugging protocols

This library is a deterrent, not an impenetrable wall. Always implement proper server-side security as your primary defense.

## Use Cases

**Good uses:**
- Protecting proprietary algorithms in demos
- Securing sensitive business logic
- Preventing casual code inspection
- Educational environments where you want to control access

**Bad uses:**
- Hiding malicious code
- Violating user privacy
- Preventing legitimate security audits
- As a replacement for server-side security

## Public API

The library exposes a global object for programmatic control:

```javascript
// Check version
console.log(window.DevToolsTerminator.version);

// Check if session has been terminated
console.log(window.DevToolsTerminator.isTerminated());

// Manually trigger termination
window.DevToolsTerminator.terminate();

// View current configuration
console.log(window.DevToolsTerminator.config);
```

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
if (window.location.hostname !== 'localhost') {
    const script = document.createElement('script');
    script.src = 'devtools-terminator.js';
    document.head.appendChild(script);
}
</script>
```

### Custom Termination Handler

```html
<script>
window.DEVTOOLS_TERMINATOR_CONFIG = {
    onTerminate: function() {
        // Log to your analytics
        fetch('/api/security-event', {
            method: 'POST',
            body: JSON.stringify({ event: 'devtools_detected' })
        });
        
        // Then redirect
        window.location.href = 'access-denied.html';
    }
};
</script>
<script src="devtools-terminator.js"></script>
```

## Contributing

Contributions are welcome. Please read [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) before submitting pull requests.

To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on multiple browsers
5. Submit a pull request

## License

MIT License. See LICENSE file for details.

## Credits

Created by Mohammad Faiz, extracted from the Rox AI platform and open-sourced for the developer community.

- GitHub: [@Mohammad-Faiz-Cloud-Engineer](https://github.com/Mohammad-Faiz-Cloud-Engineer)
- Repository: [Devtools-Terminator](https://github.com/Mohammad-Faiz-Cloud-Engineer/Devtools-Terminator)

Inspired by various DevTools detection techniques from the security research community.

## Support

- Report bugs: [GitHub Issues](https://github.com/Mohammad-Faiz-Cloud-Engineer/Devtools-Terminator/issues)
- Request features: [GitHub Issues](https://github.com/Mohammad-Faiz-Cloud-Engineer/Devtools-Terminator/issues)
- Documentation: [docs/](docs/)
- Examples: [examples/](examples/)

## Project Structure

```
devtools-terminator/
├── devtools-terminator.js       # Main library (ready to use)
├── devtools-terminator.d.ts     # TypeScript definitions (optional)
├── examples/                    # Demo and termination pages
├── assets/                      # Icons and static resources
├── docs/                        # Documentation
├── TESTING.md                   # Testing guide
├── BUILD.md                     # Build instructions (optional minification)
├── SECURITY.md                  # Security policy
├── NO_NPM_SETUP.md             # Guide for using without NPM
└── README.md                    # This file
```

**Note**: No NPM setup required! See [NO_NPM_SETUP.md](NO_NPM_SETUP.md) for details.

## Disclaimer

This tool is provided as-is for legitimate security purposes. The author is not responsible for misuse or any damages caused by this software. Always comply with applicable laws and respect user privacy.

**This is a deterrent, not a security solution.** Always implement proper server-side security. See [SECURITY.md](SECURITY.md) for important security considerations.
