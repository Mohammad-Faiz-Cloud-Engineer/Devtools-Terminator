# TypeScript Examples

This directory contains TypeScript examples demonstrating how to use DevTools Terminator with full type safety.

## Files

- **typescript-demo.ts** - Comprehensive TypeScript examples (12 patterns)
- **typescript-demo.html** - Interactive browser demo
- **tsconfig.json** - TypeScript compiler configuration

## Quick Start

### 1. View Interactive Demo

Open `typescript-demo.html` in your browser:

```bash
# Start a local server
python3 -m http.server 8000

# Open in browser
# http://localhost:8000/examples/typescript-demo.html
```

### 2. Compile TypeScript Demo

```bash
# Install TypeScript (if not already installed)
npm install -g typescript

# Compile the demo
cd examples
tsc

# Output will be in examples/dist/typescript-demo.js
```

### 3. Use in Your TypeScript Project

```typescript
/// <reference path="./devtools-terminator.d.ts" />

// Configure with full type safety
window.DEVTOOLS_TERMINATOR_CONFIG = {
    terminationUrl: 'terminated.html',
    checkInterval: 100,
    enableWindowSizeCheck: true,
    enableKeyboardBlock: true
};

// Use the API with IntelliSense
const api: DevToolsTerminatorAPI = window.DevToolsTerminator;
console.log('Version:', api.version);
console.log('Terminated:', api.isTerminated());
```

## What's Included

### typescript-demo.ts

Contains 12 comprehensive examples:

1. **Basic Configuration** - Type-safe configuration setup
2. **Partial Configuration** - Using optional properties
3. **Custom Termination Handler** - Type-safe callbacks
4. **Public API Usage** - Accessing all API methods
5. **Environment-Based Config** - Conditional configuration
6. **Configuration Builder Pattern** - Fluent API builder
7. **React Integration** - React component example
8. **Angular Integration** - Angular service example
9. **Vue Integration** - Vue composable example
10. **Type Guards** - Runtime type checking
11. **Testing Helpers** - Utility functions for testing
12. **Error Handling** - Robust error handling patterns

### typescript-demo.html

Interactive browser demo showing:
- Type-safe API usage
- Configuration examples
- Live API method calls
- Visual output of typed values

## TypeScript Configuration

The included `tsconfig.json` is configured for:

- **Target**: ES5 (maximum browser compatibility)
- **Strict Mode**: All strict type checking enabled
- **Source Maps**: For debugging
- **Module System**: CommonJS

## Framework Integration

### React

```typescript
import React, { useEffect, useState } from 'react';

const MyComponent: React.FC = () => {
    const [version, setVersion] = useState<string>('');
    
    useEffect(() => {
        if (window.DevToolsTerminator) {
            setVersion(window.DevToolsTerminator.version);
        }
    }, []);
    
    return <div>Protected by v{version}</div>;
};
```

### Angular

```typescript
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DevToolsService {
    getVersion(): string {
        return window.DevToolsTerminator?.version || 'Not loaded';
    }
}
```

### Vue 3

```typescript
import { ref, onMounted } from 'vue';

export function useDevTools() {
    const version = ref<string>('');
    
    onMounted(() => {
        if (window.DevToolsTerminator) {
            version.value = window.DevToolsTerminator.version;
        }
    });
    
    return { version };
}
```

## Type Definitions

The library provides complete type definitions in `devtools-terminator.d.ts`:

### Interfaces

- **DevToolsTerminatorConfig** - Configuration options
- **DevToolsTerminatorAPI** - Public API interface

### Global Augmentation

```typescript
declare global {
    interface Window {
        DEVTOOLS_TERMINATOR_CONFIG?: DevToolsTerminatorConfig;
        DevToolsTerminator: DevToolsTerminatorAPI;
    }
}
```

## Benefits of TypeScript

1. **IntelliSense** - Autocomplete in VS Code, WebStorm, etc.
2. **Type Safety** - Catch errors at compile time
3. **Documentation** - Inline documentation in your IDE
4. **Refactoring** - Safe refactoring with type checking
5. **Better DX** - Improved developer experience

## Common Patterns

### Configuration Validation

```typescript
function validateConfig(config: DevToolsTerminatorConfig): boolean {
    if (config.checkInterval !== undefined && config.checkInterval < 50) {
        console.error('Check interval must be at least 50ms');
        return false;
    }
    return true;
}
```

### Safe API Access

```typescript
function safelyAccessAPI(): DevToolsTerminatorAPI | null {
    if (typeof window !== 'undefined' && window.DevToolsTerminator) {
        return window.DevToolsTerminator;
    }
    return null;
}
```

### Type Guards

```typescript
function isDevToolsLoaded(): boolean {
    return typeof window !== 'undefined' && 
           typeof window.DevToolsTerminator !== 'undefined';
}
```

## Troubleshooting

### Types Not Found

If TypeScript can't find the types, add a triple-slash reference at the top of your file:

```typescript
/// <reference path="./devtools-terminator.d.ts" />
```

Or if using modules, ensure the `.d.ts` file is in the same directory or add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types", "./"],
    "types": ["devtools-terminator"]
  },
  "include": [
    "**/*.ts",
    "devtools-terminator.d.ts"
  ]
}
```

## Resources

- Main Documentation: [../README.md](../README.md)
- Type Definitions: [../devtools-terminator.d.ts](../devtools-terminator.d.ts)
- JavaScript Demo: [demo.html](demo.html)

## Support

For TypeScript-specific issues, please include:
- TypeScript version (`tsc --version`)
- Your `tsconfig.json`
- Error messages from the compiler
- IDE you're using (VS Code, WebStorm, etc.)
