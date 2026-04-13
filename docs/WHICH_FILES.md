# Which Files Do I Need? (Visual Guide)

## Choose Your Path

```
                    START HERE
                        |
                        v
            Do you have a Node.js server?
                        |
            +-----------+-----------+
            |                       |
           NO                      YES
            |                       |
            v                       v
    SIMPLE SETUP              ADVANCED SETUP
    (2 files)                 (4 files)
```

---

## Simple Setup (No Server)

### What You Need

```
Your Project
├── index.html
├── devtools-terminator.js       <- Copy this
└── terminated.html               <- Copy this
```

### Where to Get Them

```
Devtools-Terminator-main
├── devtools-terminator.js       <- COPY THIS
└── examples/
    └── terminated.html           <- COPY THIS
```

### How to Use

```html
<!-- In your HTML file: -->
<script src="devtools-terminator.js"></script>
```

The protection is now active.

---

## Advanced Setup (With Server)

### What You Need

```
Your Project
├── server.js
├── devtools-terminator-server.js  <- Copy this
└── public/
    ├── admin.html
    ├── devtools-terminator-hybrid.js  <- Copy this
    ├── terminated.html                <- Copy this
    └── noscript-handler.html         <- Copy this
```

### Where to Get Them

```
Devtools-Terminator-main
├── devtools-terminator-hybrid.js   <- COPY THIS
├── devtools-terminator-server.js   <- COPY THIS
├── noscript-handler.html          <- COPY THIS
└── examples/
    └── terminated.html             <- COPY THIS
```

### How to Use

**Server (server.js):**
```javascript
const devtoolsTerminator = require('./devtools-terminator-server');
app.use(devtoolsTerminator.middleware({ /* config */ }));
```

**Client (admin.html):**
```html
<script src="devtools-terminator-hybrid.js"></script>
```

Setup complete.

---

## File Comparison

| File | Simple | Advanced | Purpose |
|------|--------|----------|---------|
| `devtools-terminator.js` | YES | NO | Client-only protection |
| `devtools-terminator-hybrid.js` | NO | YES | Enhanced client |
| `devtools-terminator-server.js` | NO | YES | Server validation |
| `terminated.html` | YES | YES | Termination page |
| `noscript-handler.html` | NO | YES | JS detection |

---

## What About Other Files?

### TypeScript Users

```
devtools-terminator.d.ts    <- Copy this for TypeScript
```

### Everyone Else

```
examples/                   <- Don't copy (just examples)
docs/                       <- Don't copy (just docs)
assets/                     <- Don't copy (optional icons)
.github/                    <- Don't copy (GitHub config)
```

---

## Quick Reference

### I want the simplest setup possible
Copy 2 files: `devtools-terminator.js` + `terminated.html`

### I have a Node.js server and want stronger protection
Copy 4 files: `hybrid.js` + `server.js` + `terminated.html` + `noscript-handler.html`

### I'm using TypeScript
Also copy: `devtools-terminator.d.ts`

### I want to see examples first
Look in: `examples/` folder

### I need detailed setup instructions
Read: `GETTING_STARTED.md`

---

## Still Confused?

**Read these in order:**

1. **WHICH_FILES.md** <- You are here (which files to copy)
2. **GETTING_STARTED.md** <- How to set them up
3. **README.md** <- Complete documentation

**Or just:**
- Copy the files listed above for your setup
- Follow the code examples shown
- Test by pressing F12

**That's all you need!**
