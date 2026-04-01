# Build Guide

How to prepare DevTools Terminator for distribution.

## Prerequisites

No build tools are required for basic usage. The library is pure vanilla JavaScript and ready to use as-is.

For minification (optional), you can use online tools or install minifiers:

**Online Tools (No Installation Required)**:
- https://javascript-minifier.com/
- https://www.toptal.com/developers/javascript-minifier
- https://jscompress.com/

**Command Line Tools (Optional)**:
```bash
# If you have Node.js installed, you can use:
npm install -g terser
# or
npm install -g uglify-js
```

## Creating Minified Version

### Option 1: Online Tools (Easiest)

1. Go to https://javascript-minifier.com/
2. Copy the contents of `devtools-terminator.js`
3. Paste into the minifier
4. Click "Minify"
5. Save the output as `devtools-terminator.min.js`

### Option 2: Using Terser (If Node.js Installed)

```bash
terser devtools-terminator.js \
    --compress \
    --mangle \
    --comments "/^!/" \
    --output devtools-terminator.min.js
```

### Option 3: Using UglifyJS (If Node.js Installed)

```bash
uglifyjs devtools-terminator.js \
    --compress \
    --mangle \
    --comments "/^!/" \
    --output devtools-terminator.min.js
```

### Expected Results

- Original: ~12KB
- Minified: ~4-5KB (using online tools or command line)
- Gzipped: ~2KB (if your web server supports gzip compression)

## File Size Verification

```bash
# Check original size (Linux/Mac)
ls -lh devtools-terminator.js

# Check original size (Windows)
dir devtools-terminator.js

# Check minified size
ls -lh devtools-terminator.min.js
```

## Distribution

### Option 1: Direct File Sharing

Simply share these files:
- `devtools-terminator.js` (main library)
- `devtools-terminator.min.js` (minified version, if created)
- `devtools-terminator.d.ts` (TypeScript definitions)
- `examples/terminated.html` (termination page)

### Option 2: GitHub Release

1. Create Git Tag:
```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

2. Create Release on GitHub:
   - Go to repository on GitHub
   - Click "Releases" → "Create a new release"
   - Select tag: v1.0.0
   - Title: "DevTools Terminator v1.0.0"
   - Description: Copy from CHANGELOG.md
   - Attach files:
     - devtools-terminator.js
     - devtools-terminator.min.js (if created)
     - devtools-terminator.d.ts
     - examples/terminated.html
   - Publish release

### Option 3: Host on Your Own Server

Upload the files to your web server and reference them:

```html
<script src="https://your-domain.com/js/devtools-terminator.js"></script>
```

## Pre-Release Checklist

Before building and releasing:

- [ ] All tests pass (see TESTING.md for manual testing)
- [ ] Version number updated in:
  - [ ] devtools-terminator.js (header comment)
  - [ ] devtools-terminator.d.ts (header comment)
  - [ ] CHANGELOG.md
- [ ] CHANGELOG.md updated with changes
- [ ] README.md is current
- [ ] No console.log debug statements (except intentional ones)
- [ ] No TODO/FIXME comments
- [ ] All documentation reviewed
- [ ] Examples tested
- [ ] TypeScript definitions validated

## Validation Commands

```bash
# Check for debug statements (Linux/Mac)
grep -r "console.log" --exclude="*.md" --exclude-dir="examples"

# Check for TODOs (Linux/Mac)
grep -r "TODO\|FIXME" --exclude="*.md"

# Check file sizes (Linux/Mac)
du -h devtools-terminator.js

# Check file sizes (Windows)
dir devtools-terminator.js
```

## Distribution Checklist

- [ ] Source file (devtools-terminator.js)
- [ ] Minified file (devtools-terminator.min.js)
- [ ] TypeScript definitions (devtools-terminator.d.ts)
- [ ] Examples directory
- [ ] Assets directory
- [ ] README.md
- [ ] LICENSE
- [ ] CHANGELOG.md

## Post-Release Tasks

1. Update README.md with new download links (if applicable)
2. Test that files work correctly when downloaded
3. Update documentation site (if applicable)
4. Announce release on social media or relevant channels
5. Update any dependent projects

## Rollback Procedure

If a release has critical issues:

```bash
# Delete Git tag locally
git tag -d v1.0.0

# Delete Git tag remotely
git push origin :refs/tags/v1.0.0

# Delete GitHub release (use GitHub UI)
# Go to Releases → Click on the release → Delete
```

---

**Last Updated**: April 1, 2026
