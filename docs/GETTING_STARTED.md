# Getting Started

Welcome to DevTools Terminator! This guide will help you install and configure the library to protect your frontend application.

## Prerequisites
- No external dependencies required for the client library.
- Node.js (v14+) is required *only* if you plan to use the Hybrid Server validation.

## Basic Setup (Client-Only)

1. **Include the Library**
   Copy `src/client/devtools-terminator.js` to your project and include it in the `<head>` of your HTML document.

   ```html
   <script src="path/to/devtools-terminator.js"></script>
   ```

2. **Setup the Termination Page**
   Copy `public/terminated.html` into your public directory. This is where users are sent when DevTools are opened.

3. **Configure (Optional)**
   You can override the default behavior by defining `window.DEVTOOLS_TERMINATOR_CONFIG` before loading the script:
   ```html
   <script>
       window.DEVTOOLS_TERMINATOR_CONFIG = {
           terminationUrl: '/terminated.html',
           checkInterval: 100
       };
   </script>
   ```

## Next Steps
- Read [Which Files?](WHICH_FILES.md) to understand the differences between hybrid and client-only.
- Read [Hybrid Setup](HYBRID_SETUP.md) if you are building an enterprise application requiring cryptographic server validation.
