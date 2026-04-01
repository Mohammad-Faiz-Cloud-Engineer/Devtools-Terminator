# Assets

This directory contains static assets for the DevTools Terminator project.

## Directory Structure

```
assets/
└── icons/
    ├── favicon.svg              # Main favicon (lock icon)
    └── favicon-terminated.svg   # Termination page favicon (error icon)
```

## Icons

### favicon.svg
- **Purpose**: Main project favicon for demo and documentation pages
- **Design**: Lock icon in purple (#667eea)
- **Format**: SVG (scalable, production-ready)
- **Size**: 32x32 viewBox

### favicon-terminated.svg
- **Purpose**: Favicon for the termination page
- **Design**: Error/close icon in red (#ef4444)
- **Format**: SVG (scalable, production-ready)
- **Size**: 32x32 viewBox

## Usage

Include in your HTML:

```html
<!-- For main pages -->
<link rel="icon" type="image/svg+xml" href="assets/icons/favicon.svg">

<!-- For termination page -->
<link rel="icon" type="image/svg+xml" href="assets/icons/favicon-terminated.svg">
```

## Customization

These icons can be customized by:
1. Editing the SVG files directly
2. Changing colors in the `fill` attributes
3. Replacing with your own brand icons

All icons are production-ready and optimized for web use.
