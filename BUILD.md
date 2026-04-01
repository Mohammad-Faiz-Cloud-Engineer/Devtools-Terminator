# Build Guide

This document explains how to build and prepare DevTools Terminator for distribution.

## Prerequisites

No build tools are required for basic usage. The library is pure vanilla JavaScript.

For minification (optional):

```bash
npm install -g terser
# or
npm install -g uglify-js
```

## Creating Minified Version

### Using Terser (Recommended)

```bash
terser devtools-terminator.js \
    --compress \
    --mangle \
    --comments "/^!/" \
    --output devtools-terminator.min.js
```

### Using UglifyJS

```bash
uglifyjs devtools-terminator.js \
    --compress \
    --mangle \
    --comments "/^!/" \
    --output devtools-terminator.min.js
```

### Expected Results

- Original: ~12KB
- Minified: ~4-5KB
- Gzipped: ~2KB

## File Size Verification

```bash
# Check original size
ls -lh devtools-terminator.js

# Check minified size
ls -lh devtools-terminator.min.js

# Check gzipped size
gzip -c devtools-terminator.min.js | wc -c
```

## NPM Package Preparation

### 1. Update Version

Edit `package.json`:

```json
{
  "version": "1.0.1"
}
```

### 2. Test Package Contents

```bash
npm pack --dry-run
```

This shows what files will be included in the package.

### 3. Create Package

```bash
npm pack
```

This creates `devtools-terminator-1.0.0.tgz`

### 4. Test Package Locally

```bash
npm install ./devtools-terminator-1.0.0.tgz
```

### 5. Publish to NPM

```bash
# Login (first time only)
npm login

# Publish
npm publish
```

## CDN Preparation

### jsDelivr (Automatic)

Once published to NPM, jsDelivr automatically serves it:

```html
<!-- Latest version -->
<script src="https://cdn.jsdelivr.net/npm/devtools-terminator@latest/devtools-terminator.js"></script>

<!-- Specific version -->
<script src="https://cdn.jsdelivr.net/npm/devtools-terminator@1.0.0/devtools-terminator.js"></script>

<!-- Minified (once created) -->
<script src="https://cdn.jsdelivr.net/npm/devtools-terminator@latest/devtools-terminator.min.js"></script>
```

### unpkg (Automatic)

```html
<!-- Latest version -->
<script src="https://unpkg.com/devtools-terminator@latest/devtools-terminator.js"></script>

<!-- Specific version -->
<script src="https://unpkg.com/devtools-terminator@1.0.0/devtools-terminator.js"></script>
```

## GitHub Release

### 1. Create Git Tag

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

### 2. Create Release on GitHub

1. Go to repository on GitHub
2. Click "Releases" → "Create a new release"
3. Select tag: v1.0.0
4. Title: "DevTools Terminator v1.0.0"
5. Description: Copy from CHANGELOG.md
6. Attach files:
   - devtools-terminator.js
   - devtools-terminator.min.js (if created)
   - devtools-terminator.d.ts
7. Publish release

## Pre-Release Checklist

Before building and releasing:

- [ ] All tests pass (see TESTING.md)
- [ ] Version number updated in:
  - [ ] package.json
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
# Check for debug statements
grep -r "console.log" --exclude="*.md" --exclude-dir="examples"

# Check for TODOs
grep -r "TODO\|FIXME" --exclude="*.md"

# Validate JSON files
cat package.json | jq .

# Check file sizes
du -h devtools-terminator.js
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

1. Update README.md with new CDN links
2. Test CDN links work correctly
3. Update documentation site (if applicable)
4. Announce release on social media
5. Update any dependent projects

## Rollback Procedure

If a release has critical issues:

```bash
# Unpublish from NPM (within 72 hours)
npm unpublish devtools-terminator@1.0.0

# Delete Git tag
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0

# Delete GitHub release
# (Use GitHub UI)
```

## Continuous Integration (Future)

Recommended GitHub Actions workflow:

```yaml
name: Build and Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: npm test
      - name: Build minified version
        run: npm run build
```

---

**Last Updated**: April 1, 2026
