# Which Files Do I Need?

DevTools Terminator v2.1.0 offers two distinct security models. Choose the one that fits your architecture.

## 1. The "Client-Only" Model (Simple)
Best for: Static websites, simple demos, blogs, and standalone frontends.

**Required Files:**
- `src/client/devtools-terminator.js`
- `public/terminated.html`

*Pros:* Zero backend needed. Easy to install.
*Cons:* Can theoretically be bypassed if an attacker blocks the script from loading using a local proxy.

## 2. The "Hybrid" Model (Enterprise)
Best for: Financial apps, proprietary SaaS, and environments with a Node.js backend.

**Required Files:**
- `src/client/devtools-terminator-hybrid.js`
- `src/server/devtools-terminator-server.js`
- `public/terminated.html`

*Pros:* Cryptographically validated. Replay-attack resistant. Server strictly denies API access if DevTools is opened or if the script is disabled.
*Cons:* Requires a Node.js Express server to handle the HMAC-SHA256 validations.

## 3. TypeScript Support (Optional)
If your project uses TypeScript, also include:
- `src/types/devtools-terminator.d.ts`
