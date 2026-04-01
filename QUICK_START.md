# Quick Start Guide

Get DevTools Terminator running in your project in under 5 minutes.

## Installation

### Step 1: Get the Files

Clone the repository:

```bash
git clone https://github.com/Mohammad-Faiz-Cloud-Engineer/Devtools-Terminator.git
cd Devtools-Terminator
```

### Step 2: Copy to Your Project

You need two files:

- `devtools-terminator.js` - The main library
- `terminated.html` - The page users see when their session is terminated

```bash
cp devtools-terminator.js /path/to/your/project/
cp terminated.html /path/to/your/project/
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

Open your page in a browser and try:

- Pressing F12
- Right-clicking and selecting "Inspect"
- Using Ctrl+Shift+I (Windows/Linux) or Cmd+Option+I (Mac)

You should be immediately redirected to the termination page.

## Configuration (Optional)

If you want to customize the behavior, add configuration before the script:

```html
<script>
window.DEVTOOLS_TERMINATOR_CONFIG = {
    terminationUrl: '/custom-page.html',
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
    terminationUrl: '/custom-page.html'
};
```

**Custom termination handler:**

```javascript
window.DEVTOOLS_TERMINATOR_CONFIG = {
    onTerminate: function() {
        alert('Developer tools detected');
        window.location.href = '/bye.html';
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
        window.location.href = '/terminated.html';
    }
};
```

## Troubleshooting

### Protection Not Working

Check these common issues:

1. **File path is wrong** - Make sure the script src points to the correct location
2. **JavaScript errors** - Open the console (before protection loads) and check for errors
3. **Browser compatibility** - Ensure you're using a supported browser version
4. **Script loading order** - The script should load before your other JavaScript

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
