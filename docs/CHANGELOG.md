# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-04-13

### Changed

- **BREAKING**: Upgraded to version 2.0.0 with comprehensive security and code quality improvements
- Enhanced URL validation with path traversal protection
- Improved error handling with descriptive comments throughout
- Refactored mobile device detection to eliminate code duplication
- Converted keyboard protection to if-else chain for better readability
- Added feature detection for `closest()` method for better browser compatibility
- Frozen public API config object to prevent external modifications

### Fixed

- Security: Path traversal vulnerability in URL validation
- Security: Public API config object now immutable with Object.freeze()
- Bug: Removed redundant iOS device detection in isMobileDevice()
- Bug: Fixed race condition in initialization check
- Performance: Removed redundant _terminated check in monitoring interval
- Code Quality: Extracted magic number 160 to WINDOW_SIZE_THRESHOLD constant
- Code Quality: Added comprehensive comments explaining error handling
- Code Quality: Improved comment accuracy throughout codebase
- Code Quality: Added upper bound validation (5000ms) for check interval in TypeScript builder
- Code Quality: Added memory leak protection in terminated.html (limited back attempts to 100)

### Removed

- Deleted empty .vscode/settings.json file
- Removed *.min.js from .gitignore to allow distribution of minified files

## [1.0.0] - 2026-04-01

### Added

- Initial public release
- Triple detection system using console logging, window size, and keyboard shortcuts
- Configurable behavior via `window.DEVTOOLS_TERMINATOR_CONFIG`
- Public API for programmatic control
- Mobile device detection with smart false positive prevention
- Complete session cleanup (localStorage, sessionStorage, cookies, service workers, caches)
- Custom termination handler support
- Zero external dependencies
- Cross-browser compatibility (Firefox, Safari, Edge, Opera, Chromium-based browsers)
- Limited Chrome browser support (see Browser Compatibility section)
- Comprehensive documentation
- Demo page with examples
- MIT License
- TypeScript definitions (.d.ts file)
- Testing guide (TESTING.md)
- Build instructions (BUILD.md)
- Security policy (SECURITY.md)
- EditorConfig for consistent coding styles
- Simplified package.json (no NPM dependencies)
- GitHub Actions workflow for quality checks

### Fixed

- Default termination URL changed from `examples/terminated.html` to `terminated.html` for better path resolution
- All documentation examples updated to use relative paths instead of absolute paths
- Path resolution issues in demo.html

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
- PROJECT_INFO.md with technical details
- CONTRIBUTING.md with contribution guidelines
- TESTING.md with comprehensive test procedures
- BUILD.md with build and release instructions
- SECURITY.md with security considerations and policy
- Demo page with interactive examples

## [Unreleased]

### Planned Features

- Minified version (devtools-terminator.min.js)
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
