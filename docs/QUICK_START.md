# Quick Start (2-Minute Setup)

If you just want to get DevTools Terminator running on a basic HTML page as fast as possible, follow this guide.

## 1. Copy Files
Copy these two files into your project's root:
- `src/client/devtools-terminator.js`
- `public/terminated.html`

## 2. Add to HTML
Place this script tag at the **very top** of your `<head>`, before any other scripts:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>My App</title>
    
    <!-- ADD THIS CONFIG (Optional) AND SCRIPT FIRST -->
    <script>
        window.DEVTOOLS_TERMINATOR_CONFIG = {
            terminationUrl: 'terminated.html'
        };
    </script>
    <script src="devtools-terminator.js"></script>
    
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Protected Content</h1>
    <p>Try pressing F12 or right-clicking!</p>
</body>
</html>
```

That's it. Your page is now protected. If anyone opens DevTools, their local session data is destroyed and they will be redirected to `terminated.html`.
