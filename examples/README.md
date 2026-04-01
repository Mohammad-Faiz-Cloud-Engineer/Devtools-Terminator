# Examples

This directory contains example implementations and demo pages for DevTools Terminator.

## Available Examples

### demo.html
Interactive demonstration page showing all features of DevTools Terminator in action.

**To run:**
```bash
# Using a local server (recommended)
npx serve .
# or
python -m http.server 8000

# Then open: http://localhost:8000/examples/demo.html
```

### terminated.html
The default termination page that users see when DevTools are detected. This page:
- Displays a security message
- Clears all remaining session data
- Prevents navigation back to protected pages
- Can be customized for your application

## Customization

You can customize the termination page by:
1. Copying `terminated.html` to your project
2. Modifying the HTML/CSS to match your brand
3. Configuring the `terminationUrl` in your config:

```javascript
window.DEVTOOLS_TERMINATOR_CONFIG = {
    terminationUrl: '/your-custom-page.html'
};
```

## Integration

To integrate these examples into your project:

```bash
# Copy the library
cp ../devtools-terminator.js your-project/

# Copy the termination page
cp terminated.html your-project/

# Include in your HTML
<script src="devtools-terminator.js"></script>
```

For more details, see the [Quick Start Guide](../docs/QUICK_START.md).
