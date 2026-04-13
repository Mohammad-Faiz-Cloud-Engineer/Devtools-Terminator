# Getting Started - Which Files Do I Need?

**Choose your setup in 30 seconds:**

## Quick Decision Guide

### Option 1: Simple Protection (No Server) - RECOMMENDED FOR MOST USERS

**Use these files:**
- `devtools-terminator.js` (the main library)
- `examples/terminated.html` (the page users see when caught)

**When to use:**
- Static websites (HTML/CSS/JS only)
- GitHub Pages, Netlify, Vercel
- No Node.js server available
- Quick demos or prototypes

**Setup time:** 2 minutes

**[Jump to Simple Setup](#simple-setup-no-server)**

---

### Option 2: Advanced Protection (With Server) - FOR SENSITIVE DATA

**Use these files:**
- `devtools-terminator-hybrid.js` (enhanced client)
- `devtools-terminator-server.js` (server module)
- `examples/terminated.html` (termination page)
- `noscript-handler.html` (detects disabled JavaScript)

**When to use:**
- Admin panels or dashboards
- Applications with sensitive data
- You have a Node.js/Express server
- Need audit logs of security events

**Setup time:** 15 minutes

**[Jump to Advanced Setup](#advanced-setup-with-server)**

---

## Simple Setup (No Server)

### Step 1: Copy 2 Files

```bash
# Copy these to your project:
devtools-terminator.js          → your-project/
examples/terminated.html        → your-project/
```

### Step 2: Add to Your HTML

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Protected Page</title>
    
    <!-- Add this one line: -->
    <script src="devtools-terminator.js"></script>
</head>
<body>
    <h1>Your content here</h1>
</body>
</html>
```

### Step 3: Test It

```bash
# Start a local server (required for testing):
python3 -m http.server 8000

# Open browser:
# http://localhost:8000

# Try pressing F12 → You'll be redirected to terminated.html
```

The protection is now active. You're done.

---

## Advanced Setup (With Server)

### Step 1: Copy 4 Files

```bash
# Copy these to your project:
devtools-terminator-hybrid.js   → your-project/public/
devtools-terminator-server.js   → your-project/
examples/terminated.html        → your-project/public/
noscript-handler.html          → your-project/public/
```

### Step 2: Install Dependencies

```bash
npm install express express-session cookie-parser body-parser
```

### Step 3: Setup Server (server.js)

```javascript
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const devtoolsTerminator = require('./devtools-terminator-server');

const app = express();

// Basic middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: 'change-this-secret',
    resave: false,
    saveUninitialized: true
}));

// Serve static files
app.use(express.static('public'));

// Add DevTools protection
app.use(devtoolsTerminator.middleware({
    secret: process.env.DEVTOOLS_SECRET || 'change-this-secret',
    protectedPaths: ['/admin', '/dashboard'],  // Pages to protect
    terminationUrl: '/terminated.html'
}));

// Your routes
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/public/admin.html');
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
```

### Step 4: Setup Client (admin.html)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Admin Panel</title>
    
    <!-- Detect if JavaScript is disabled -->
    <noscript>
        <meta http-equiv="refresh" content="0; url=/terminated.html">
    </noscript>
    
    <!-- Configure protection -->
    <script>
    window.DEVTOOLS_TERMINATOR_CONFIG = {
        serverValidation: true,
        apiEndpoint: '/api/devtools-terminator'
    };
    </script>
    
    <!-- Load protection -->
    <script src="devtools-terminator-hybrid.js"></script>
</head>
<body>
    <h1>Admin Panel</h1>
    <p>Protected content here</p>
</body>
</html>
```

### Step 5: Run and Test

```bash
# Start server
node server.js

# Open browser
# http://localhost:3000/admin

# Try pressing F12 → Terminated immediately
# Try disabling JavaScript → Redirected to terminated.html
```

Setup complete.

---

## File Reference Guide

### Core Files (You Need These)

| File | Purpose | When to Use |
|------|---------|-------------|
| `devtools-terminator.js` | Simple client-only protection | Static sites, no server |
| `devtools-terminator-hybrid.js` | Advanced client with server validation | Apps with Node.js server |
| `devtools-terminator-server.js` | Server-side validation module | With hybrid client |
| `examples/terminated.html` | Page shown when DevTools detected | Always (both setups) |

### Optional Files

| File | Purpose | When to Use |
|------|---------|-------------|
| `noscript-handler.html` | Detects disabled JavaScript | Copy code into your HTML |
| `devtools-terminator.d.ts` | TypeScript type definitions | TypeScript projects |

### Documentation Files (Read These)

| File | What It Explains |
|------|------------------|
| `README.md` | Complete documentation, all features |
| `GETTING_STARTED.md` | This file - quick start guide |
| `HYBRID_SETUP.md` | Detailed advanced setup guide |
| `SECURITY.md` | Security policy and limitations |

### Example Files (For Learning)

| File | What It Shows |
|------|---------------|
| `examples/demo.html` | Working demo of simple version |
| `examples/server-example.js` | Complete server example |
| `examples/typescript-demo.ts` | TypeScript usage examples |

---

## Common Questions

### Q: Which version should I use?

**Use Simple (devtools-terminator.js) if:**
- You have a static website
- You don't have a Node.js server
- You want 2-minute setup
- You're okay with basic protection

**Use Advanced (devtools-terminator-hybrid.js) if:**
- You have a Node.js/Express server
- You're protecting sensitive data
- You need audit logs
- You want stronger protection

### Q: Can I use both versions?

No, choose one:
- Simple OR Advanced
- Don't load both scripts on the same page

### Q: Do I need all the files in the repo?

No! You only need:
- **Simple:** 2 files (devtools-terminator.js + terminated.html)
- **Advanced:** 4 files (hybrid.js + server.js + terminated.html + noscript-handler.html)

### Q: What about the other files?

- `docs/` folder = Documentation (optional reading)
- `examples/` folder = Learning examples (optional)
- `assets/` folder = Icons (optional)
- `.github/` folder = GitHub config (ignore)

### Q: Where do I put the files?

**Simple setup:**
```
your-website/
├── index.html
├── devtools-terminator.js       ← Same folder as HTML
└── terminated.html               ← Same folder as HTML
```

**Advanced setup:**
```
your-project/
├── server.js                     ← Your server file
├── devtools-terminator-server.js ← Same folder as server.js
└── public/
    ├── admin.html
    ├── devtools-terminator-hybrid.js
    ├── terminated.html
    └── noscript-handler.html
```

### Q: How do I customize the termination page?

Edit `terminated.html`:
- Change colors, text, logo
- Add your company branding
- Modify the error message

### Q: Does this work on mobile?

Yes! Both versions work on:
- iOS Safari
- Android Chrome
- Mobile browsers

### Q: What if I need help?

1. Read `README.md` for detailed docs
2. Check `examples/` folder for working code
3. Open GitHub issue for bugs
4. Read `SECURITY.md` for security questions

---

## Next Steps

### After Setup

1. **Test thoroughly** - Try F12, Ctrl+Shift+I, right-click
2. **Customize terminated.html** - Add your branding
3. **Read SECURITY.md** - Understand limitations
4. **Deploy** - Push to production

### Learn More

- **Full documentation:** `README.md`
- **Advanced config:** `HYBRID_SETUP.md`
- **TypeScript:** `examples/TYPESCRIPT.md`
- **Contributing:** `docs/CONTRIBUTING.md`

---

## Still Confused?

**Start here:**
1. Do you have a Node.js server? 
   - **No** → Use Simple Setup (2 files)
   - **Yes** → Use Advanced Setup (4 files)

2. Copy the files listed above

3. Follow the setup steps for your choice

4. Test by pressing F12

**That's it!**

Need more help? Open an issue on GitHub.
