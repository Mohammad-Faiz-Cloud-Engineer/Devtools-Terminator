# Security Policy & Threat Model

## Philosophy
DevTools Terminator is designed as a **highly resilient deterrent**, not a substitute for proper backend authorization.

### What it DOES:
- Stops casual and intermediate inspection of proprietary client-side logic.
- Blocks users from easily modifying UI state or harvesting API payloads from the Network tab.
- Automatically and thoroughly clears sensitive storage (`localStorage`, `sessionStorage`, `Cookies`) upon detection.
- (Hybrid Mode) Prevents API access entirely if the client environment is tampered with or heartbeats cease.

### What it DOES NOT DO:
- Stop advanced reverse-engineers who compile custom browsers or modify the Chrome binary directly.
- Protect data sent in the clear over HTTP (Use HTTPS).
- Guarantee 100% impenetrability against completely headless browser scripts (e.g., Puppeteer) configured explicitly to bypass debugging checks.

## Reporting Vulnerabilities
If you discover a logic flaw or bypass that allows standard DevTools to be opened without triggering termination on a supported browser, please open an issue in the main repository.

Do not rely on this library as your sole layer of defense. Always implement robust server-side validation and data sanitization.
