# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-XX

### Added

- Initial public release
- Triple detection system using console logging, window size, and keyboard shortcuts
- Configurable behavior via `window.DEVTOOLS_TERMINATOR_CONFIG`
- Public API for programmatic control
- Mobile device detection with smart false positive prevention
- Complete session cleanup (localStorage, sessionStorage, cookies, service workers, caches)
- Custom termination handler support
- Zero external dependencies
- Cross-browser compatibility
- Comprehensive documentation
- Demo page with examples
- MIT License

### Detection Methods

- Console logging detection using property getters
- Window size comparison (160px threshold)
- Keyboard shortcut interception (F12, Ctrl+Shift+I/J/C, Ctrl+U, Mac shortcuts)
- iOS and Android device detection
- Automatic mobile optimization

### Security Features

- Immediate session termination on detection
- Complete data wipe (storage, cookies, caches)
- Redirect to termination page with no back button
- Right-click context menu disabled
- Text selection protection
- Drag and drop disabled

### Configuration Options

- `terminationUrl` - Custom termination page
- `checkInterval` - Detection polling interval
- `enableWindowSizeCheck` - Toggle window size detection
- `enableKeyboardBlock` - Toggle keyboard shortcut blocking
- `disableOnMobile` - Force disable on mobile devices
- `onTerminate` - Custom termination callback

### Documentation

- README.md with complete usage guide
- QUICK_START.md for fast setup
- COMPARISON.md showing code comparison with Rox AI platform
- CONTRIBUTING.md with contribution guidelines
- Demo page with interactive examples

## [Unreleased]

### Planned Features

- NPM package publication
- CDN hosting
- Minified version
- TypeScript definitions
- Unit test suite
- CI/CD pipeline
- Additional configuration options
- Whitelist mode for development environments
- Event hooks for detection stages
- Better documentation with more examples

### Under Consideration

- Configurable detection sensitivity
- Multiple termination page templates
- Analytics integration helpers
- React/Vue/Angular wrapper components
- Browser extension detection
- Remote debugging detection
