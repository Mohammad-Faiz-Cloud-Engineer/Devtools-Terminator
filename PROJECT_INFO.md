# Project Information

## Overview

DevTools Terminator is a production-ready JavaScript library that detects when browser Developer Tools are opened and immediately terminates the user session. It was extracted from the Rox AI platform where it has been battle-tested in production.

## Author

**Mohammad Faiz**  
Cloud Engineer & Full Stack Developer

- GitHub: [@Mohammad-Faiz-Cloud-Engineer](https://github.com/Mohammad-Faiz-Cloud-Engineer)
- Repository: https://github.com/Mohammad-Faiz-Cloud-Engineer/Devtools-Terminator

## Repository Structure

```
devtools-terminator/
├── devtools-terminator.js    # Main library (under 5KB)
├── terminated.html            # Session termination page
├── demo.html                  # Interactive demo
├── README.md                  # Complete documentation
├── QUICK_START.md            # Fast setup guide
├── COMPARISON.md             # Code comparison with Rox AI
├── CONTRIBUTING.md           # Contribution guidelines
├── CHANGELOG.md              # Version history
├── LICENSE                   # MIT License
├── package.json              # NPM configuration
└── .gitignore               # Git ignore rules
```

## Technical Details

### Detection Methods

**1. Console Logging Detection (Primary)**

Uses JavaScript property getters to detect when the console tries to display an object. When DevTools console is open, logging an object triggers its property getters for display formatting.

**2. Window Size Detection (Desktop Only)**

Compares outer and inner window dimensions. When DevTools docks to the side or bottom, it creates a size difference. Uses a 160px threshold. Disabled on mobile to prevent false positives from dynamic toolbars and keyboards.

**3. Keyboard Shortcut Blocking**

Intercepts and blocks all common DevTools shortcuts:
- F12
- Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
- Ctrl+U (View Source)
- Cmd+Option+I, Cmd+Option+J, Cmd+Option+U (Mac)

### Performance

- File size: Under 5KB
- Memory usage: Less than 1MB
- CPU impact: Negligible (100ms polling)
- Load time: Under 10ms
- Dependencies: Zero

## License

MIT License - See LICENSE file for full text.

Copyright (c) 2024 Mohammad Faiz

## Support

- Issues: [GitHub Issues](https://github.com/Mohammad-Faiz-Cloud-Engineer/Devtools-Terminator/issues)

---

Last updated: January 2024
