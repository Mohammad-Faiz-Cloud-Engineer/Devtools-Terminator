# Quick Start Guide

Get DevTools Terminator running in your project in under 5 minutes.

## Installation

### Step 1: Get the Files

Clone the repository:

```bash
git clone https://github.com/Mohammad-Faiz-Cloud-Engineer/Devtools-Terminator.git
cd Devtools-Terminator/devtools-terminator
```

### Step 2: Copy to Your Project

You need at minimum two files:

- `devtools-terminator.js` - The main library (required)
- `examples/terminated.html` - The termination page (required)
- `devtools-terminator.d.ts` - TypeScript definitions (optional)

```bash
# Copy the main library
cp devtools-terminator.js /path/to/your/project/

# Copy the termination page
cp examples/terminated.html /path/to/your/project/

# Optional: Copy TypeScript definitions
cp devtools-terminator.d.ts /path/to/your/project/
```

### Step 3: Include in Your HTML

Add the script tag before your other scripts:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Application</title>
    <script src="devtools-terminator.js"></script>
</head>
<body>
    <h1>Protected Content</h1>
</body>
</html>
```

That's it. The protection is now active.

## Testing

Start a local web server (required for proper testing):

```bash
# Using Python 3
python3 -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser and try:

- Pressing F12
- Right-clicking and selecting "Inspect"
- Using Ctrl+Shift+I (Windows/Linux) or Cmd+Option+I (Mac)

You should be immediately redirected to the termination page.

## Configuration (Optional)

If you want to customize the behavior, add configuration before the script:

```html
<script>
window.DEVTOOLS_TERMINATOR_CONFIG = {
    terminationUrl: 'custom-page.html',  // Relative to current page
    checkInterval: 100,
    enableWindowSizeCheck: true,
    enableKeyboardBlock: true
};
</script>
<script src="devtools-terminator.js"></script>
```

### Common Configurations

**Custom termination page:**

```javascript
window.DEVTOOLS_TERMINATOR_CONFIG = {
    terminationUrl: 'custom-page.html'  // Relative to current page
};
```

**Custom termination handler:**

```javascript
window.DEVTOOLS_TERMINATOR_CONFIG = {
    onTerminate: function() {
        alert('Developer tools detected');
        window.location.href = 'bye.html';
    }
};
```

**Disable on mobile devices:**

```javascript
window.DEVTOOLS_TERMINATOR_CONFIG = {
    disableOnMobile: true
};
```

## Common Use Cases

### Protect Only Admin Pages

```html
<?php if ($user->isAdmin()): ?>
    <script src="devtools-terminator.js"></script>
<?php endif; ?>
```

### Disable in Development

```html
<script>
if (window.location.hostname !== 'localhost' && 
    window.location.hostname !== '127.0.0.1') {
    const script = document.createElement('script');
    script.src = 'devtools-terminator.js';
    document.head.appendChild(script);
}
</script>
```

### Log Detection Events

```javascript
window.DEVTOOLS_TERMINATOR_CONFIG = {
    onTerminate: function() {
        // Send to your analytics
        fetch('/api/log', {
            method: 'POST',
            body: JSON.stringify({
                event: 'devtools_detected',
                timestamp: Date.now()
            })
        });
        
        // Then terminate
        window.location.href = 'terminated.html';
    }
};
```

## Troubleshooting

### Protection Not Working

Check these common issues:

1. **File path is wrong** - Make sure the script src points to the correct location
2. **JavaScript errors** - Open the console (before protection loads) and check for errors
3. **Browser compatibility** - Ensure you're using a supported browser (Firefox, Safari, Edge, or Chromium-based browsers recommended)
4. **Chrome browser** - If using Chrome desktop, it may have limited support. Try Firefox or Edge instead.
5. **Script loading order** - The script should load before your other JavaScript

### Chrome Browser Issues

If the library doesn't work as expected in Chrome:

**This is expected behavior.** Chrome desktop has limited support due to its highly optimized DevTools.

**Solutions:**
- Use Firefox, Safari, or Microsoft Edge (recommended)
- Use Chromium-based browsers (Brave, Vivaldi, Arc) - these ARE supported
- On mobile: Chrome Mobile works fine
- On small displays: Chrome may work

See [BROWSER_COMPATIBILITY.md](../BROWSER_COMPATIBILITY.md) for details.

### False Positives on Mobile

The library automatically detects mobile devices and adjusts behavior. If you're still getting false positives:

```javascript
window.DEVTOOLS_TERMINATOR_CONFIG = {
    disableOnMobile: true
};
```

### Want to Test Without Termination

Use the public API to check status without triggering termination:

```javascript
// Check if protection is active
console.log(window.DevToolsTerminator.version);

// View configuration
console.log(window.DevToolsTerminator.config);

// Check if already terminated
console.log(window.DevToolsTerminator.isTerminated());
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check out [demo.html](demo.html) for a working example
- See [COMPARISON.md](COMPARISON.md) to understand the detection methods
- Read [CONTRIBUTING.md](CONTRIBUTING.md) if you want to contribute

## Need Help?

- Report issues: [GitHub Issues](https://github.com/Mohammad-Faiz-Cloud-Engineer/Devtools-Terminator/issues)

---

Created by Mohammad Faiz | [GitHub](https://github.com/Mohammad-Faiz-Cloud-Engineer)
