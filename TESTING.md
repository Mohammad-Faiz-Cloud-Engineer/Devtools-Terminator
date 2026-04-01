# Testing Guide

This document provides comprehensive testing procedures for DevTools Terminator.

## Manual Testing

### Prerequisites

Start a local server (required for proper testing):

```bash
# Option 1: Python
python -m http.server 8000
# or
python3 -m http.server 8000

# Option 2: Node.js
npx serve .

# Option 3: PHP
php -S localhost:8000
```

Then open: `http://localhost:8000/examples/demo.html`

### Test Cases

#### Test 1: F12 Key Detection

1. Open demo.html in browser
2. Press F12
3. **Expected**: Immediate redirect to terminated.html
4. **Expected**: All storage cleared
5. **Expected**: Cannot navigate back

**Status**: [ ] Pass [ ] Fail

---

#### Test 2: Right-Click Inspect

1. Open demo.html
2. Right-click anywhere on page
3. **Expected**: Context menu does not appear
4. **Expected**: Session remains active (no termination)

**Status**: [ ] Pass [ ] Fail

---

#### Test 3: Keyboard Shortcuts (Windows/Linux)

Test each shortcut individually:

- Ctrl+Shift+I (DevTools)
- Ctrl+Shift+J (Console)
- Ctrl+Shift+C (Inspect Element)
- Ctrl+U (View Source)
- Ctrl+S (Save Page)

**Expected**: All blocked, session terminates on DevTools shortcuts

**Status**: [ ] Pass [ ] Fail

---

#### Test 4: Keyboard Shortcuts (Mac)

Test each shortcut individually:

- Cmd+Option+I (DevTools)
- Cmd+Option+J (Console)
- Cmd+Option+U (View Source)

**Expected**: All blocked, session terminates

**Status**: [ ] Pass [ ] Fail

---

#### Test 5: Window Size Detection (Desktop)

1. Open demo.html
2. Open DevTools using browser menu (not keyboard)
3. Dock DevTools to side or bottom
4. **Expected**: Detection within 100-200ms
5. **Expected**: Redirect to terminated.html

**Status**: [ ] Pass [ ] Fail

---

#### Test 6: Console Logging Detection

1. Open demo.html
2. Open DevTools console (any method)
3. **Expected**: Immediate detection
4. **Expected**: Redirect to terminated.html

**Status**: [ ] Pass [ ] Fail

---

#### Test 7: Mobile Device Behavior

Test on actual mobile device or mobile emulator:

1. Open demo.html on mobile
2. Try to open DevTools (if available)
3. **Expected**: Window size check disabled
4. **Expected**: No false positives from keyboard, notches, or toolbars

**Status**: [ ] Pass [ ] Fail

---

#### Test 8: iOS Safari Behavior

Test on iPhone or iPad:

1. Open demo.html
2. Scroll page (address bar hides/shows)
3. Rotate device
4. Open keyboard in input field
5. **Expected**: No false positives from any action

**Status**: [ ] Pass [ ] Fail

---

#### Test 9: Custom Configuration

Create test page with custom config:

```html
<script>
window.DEVTOOLS_TERMINATOR_CONFIG = {
    terminationUrl: 'custom-page.html',
    checkInterval: 200,
    enableWindowSizeCheck: false,
    enableKeyboardBlock: true
};
</script>
<script src="../devtools-terminator.js"></script>
```

**Expected**: 
- Redirects to custom-page.html
- Window size detection disabled
- Keyboard blocking still works

**Status**: [ ] Pass [ ] Fail

---

#### Test 10: Custom Termination Handler

```html
<script>
let handlerCalled = false;
window.DEVTOOLS_TERMINATOR_CONFIG = {
    onTerminate: function() {
        handlerCalled = true;
        console.log('Custom handler executed');
    }
};
</script>
<script src="../devtools-terminator.js"></script>
```

**Expected**: Custom handler executes before redirect

**Status**: [ ] Pass [ ] Fail

---

#### Test 11: Public API

Open demo.html and test in console (before triggering detection):

```javascript
// Check version
console.log(window.DevToolsTerminator.version); // "1.0.0"

// Check configuration
console.log(window.DevToolsTerminator.config);

// Check termination status
console.log(window.DevToolsTerminator.isTerminated()); // false

// Manual termination
window.DevToolsTerminator.terminate();
```

**Expected**: All API methods work correctly

**Status**: [ ] Pass [ ] Fail

---

#### Test 12: Storage Cleanup

1. Set some data before opening demo.html:
```javascript
localStorage.setItem('test', 'data');
sessionStorage.setItem('test', 'data');
document.cookie = 'test=data';
```

2. Open demo.html
3. Trigger DevTools detection
4. Check storage after redirect

**Expected**: All storage cleared

**Status**: [ ] Pass [ ] Fail

---

#### Test 13: Service Worker Cleanup

1. Register a service worker
2. Open demo.html
3. Trigger detection
4. Check service workers after redirect

**Expected**: Service worker unregistered

**Status**: [ ] Pass [ ] Fail

---

#### Test 14: Back Button Prevention

1. Navigate to demo.html
2. Trigger detection (redirects to terminated.html)
3. Click browser back button
4. **Expected**: Cannot navigate back to demo.html

**Status**: [ ] Pass [ ] Fail

---

#### Test 15: Text Selection Protection

1. Open demo.html
2. Try to select text on page
3. Try to select text in input fields
4. **Expected**: 
   - Normal text: Selection blocked
   - Input fields: Selection allowed

**Status**: [ ] Pass [ ] Fail

---

#### Test 16: Drag and Drop Protection

1. Open demo.html
2. Try to drag images or elements
3. **Expected**: Drag prevented

**Status**: [ ] Pass [ ] Fail

---

## Browser Compatibility Testing

Test on each browser:

| Browser | Version | Test 1-6 | Mobile Tests | Notes |
|---------|---------|----------|--------------|-------|
| Chrome | 90+ | [ ] | [ ] | |
| Firefox | 88+ | [ ] | [ ] | |
| Safari | 14+ | [ ] | [ ] | |
| Edge | 90+ | [ ] | [ ] | |
| Chrome Mobile | Latest | [ ] | [ ] | |
| Safari iOS | Latest | [ ] | [ ] | |

## Performance Testing

### Memory Usage

1. Open demo.html
2. Open browser Task Manager
3. Monitor memory usage over 5 minutes
4. **Expected**: Less than 1MB additional memory

**Result**: _____ MB

---

### CPU Usage

1. Open demo.html
2. Monitor CPU usage in browser DevTools Performance tab
3. **Expected**: Negligible CPU impact

**Result**: _____ %

---

### Load Time

1. Open demo.html with Network tab open
2. Measure script load and execution time
3. **Expected**: Under 10ms execution time

**Result**: _____ ms

---

## Automated Testing (Future)

### Recommended Test Framework

```bash
npm install --save-dev jest puppeteer
```

### Sample Test Structure

```javascript
describe('DevTools Terminator', () => {
    test('should redirect on F12 press', async () => {
        // Test implementation
    });

    test('should clear localStorage', async () => {
        // Test implementation
    });

    test('should block keyboard shortcuts', async () => {
        // Test implementation
    });
});
```

## Regression Testing Checklist

Before each release, verify:

- [ ] All 16 manual tests pass
- [ ] All 6 browsers tested
- [ ] Mobile devices tested (iOS and Android)
- [ ] Performance metrics within acceptable range
- [ ] No console errors in any browser
- [ ] Documentation matches actual behavior
- [ ] Examples work correctly

## Reporting Issues

When reporting bugs, include:

1. Browser name and version
2. Operating system
3. Test case that failed
4. Expected vs actual behavior
5. Console errors (if any)
6. Screenshots or video

## Test Results Template

```
Date: ___________
Tester: ___________
Version: 1.0.0

Manual Tests: __/16 passed
Browser Tests: __/6 passed
Performance: [ ] Pass [ ] Fail

Notes:
_________________________________
_________________________________
_________________________________
```

---

**Last Updated**: April 1, 2026
