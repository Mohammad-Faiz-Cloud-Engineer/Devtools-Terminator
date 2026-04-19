# TypeScript Integration Guide

Integrating DevTools Terminator in a TypeScript project provides full IntelliSense autocomplete, compile-time safety, and structural confidence.

## 1. Import Definitions
Ensure the type definitions are discoverable in your project. If you copied `src/types/devtools-terminator.d.ts`, include it in your `tsconfig.json` paths or reference it directly.

## 2. Configuring the Library
Because the global `window` object is extended by the definitions, you can safely configure the library with autocomplete for all valid keys:

```typescript
window.DEVTOOLS_TERMINATOR_CONFIG = {
    checkInterval: 200,
    enableKeyboardBlock: true,
    serverValidation: true,
    // TypeScript will warn if you misspell a key or pass an invalid type
    onTerminate: (code: string) => {
        console.log("Terminated with code: " + code);
    }
};
```

## 3. Accessing the Public API
The library exposes a globally typed `DevToolsTerminator` object:

```typescript
const dt = window.DevToolsTerminator;

// Type Guard
if (dt && !dt.isTerminated()) {
    console.log(`Running v${dt.version}`);
    
    // dt.config is strictly typed as Readonly<DevToolsTerminatorConfig>
    console.log(`Termination URL: ${dt.config.terminationUrl}`);
    
    // Manually locking down the session
    dt.terminate();
}
```
