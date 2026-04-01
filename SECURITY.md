# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Considerations

### What This Library Does

DevTools Terminator is a client-side deterrent that:
- Detects when browser Developer Tools are opened
- Terminates the user session
- Clears local storage, session storage, and cookies
- Redirects to a termination page

### What This Library Does NOT Do

This is **not** a security solution. It is a deterrent only.

**Important Limitations:**

1. **Bypassable**: Determined users can bypass this protection using:
   - Modified browsers
   - Browser extensions that disable JavaScript
   - Virtual machines with debugging tools
   - Remote debugging protocols
   - Proxy tools like Charles or Fiddler

2. **Client-Side Only**: All code runs in the browser and can be:
   - Disabled by turning off JavaScript
   - Modified by the user
   - Bypassed by intercepting network requests

3. **Not a Replacement**: This should never replace:
   - Server-side authentication
   - Server-side authorization
   - API security
   - Proper encryption
   - Rate limiting
   - Input validation

### Proper Use Cases

**Good Uses:**
- Protecting proprietary algorithms in demos
- Deterring casual code inspection
- Educational environments
- Adding an extra layer of protection to already-secured applications

**Bad Uses:**
- Hiding malicious code
- As the only security measure
- Protecting sensitive data (use server-side security)
- Preventing legitimate security audits
- Violating user privacy

### Security Best Practices

When using this library:

1. **Always implement server-side security first**
2. **Never store sensitive data client-side**
3. **Use HTTPS for all communications**
4. **Implement proper authentication and authorization**
5. **Validate all inputs on the server**
6. **Use this as one layer in defense-in-depth strategy**

### Known Limitations

1. **Detection Delay**: 100ms polling interval means detection is not instant
2. **False Positives**: Possible on some mobile devices (mitigated by smart detection)
3. **Browser Compatibility**: May not work on very old browsers
4. **Headless Browsers**: May not detect headless browser debugging

## Reporting a Vulnerability

If you discover a security vulnerability in this library:

### What to Report

- Bypass methods that are not already documented
- Ways to crash or break the library
- XSS or injection vulnerabilities
- Privacy concerns

### What NOT to Report

- "JavaScript can be disabled" (this is documented)
- "Users can modify the code" (this is documented)
- "Headless browsers can bypass this" (this is documented)
- General limitations already listed above

### How to Report

1. **Do NOT** open a public GitHub issue
2. Email: [Create a private security advisory on GitHub]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **24 hours**: Initial response acknowledging receipt
- **7 days**: Assessment of vulnerability and severity
- **30 days**: Fix released (if applicable)

### Disclosure Policy

- We follow responsible disclosure
- Please allow 30 days before public disclosure
- We will credit you in the CHANGELOG (if desired)

## Security Updates

Security updates will be released as patch versions (e.g., 1.0.1).

Subscribe to releases on GitHub to be notified:
https://github.com/Mohammad-Faiz-Cloud-Engineer/Devtools-Terminator/releases

## Disclaimer

This software is provided "as is" without warranty of any kind. The author is not responsible for:

- Misuse of this software
- Damages caused by this software
- Security breaches in applications using this software
- Bypasses or circumvention of the protection

**Always implement proper server-side security as your primary defense.**

## Compliance

### GDPR Considerations

This library:
- Clears cookies and storage (may affect user data)
- Does not collect or transmit any data
- Does not track users
- Runs entirely client-side

If you use this library:
- Inform users in your privacy policy
- Ensure compliance with data protection laws
- Provide opt-out mechanisms if required

### Accessibility

This library:
- Blocks right-click context menu
- Prevents text selection (except in input fields)
- May interfere with assistive technologies

Consider:
- Providing alternative access methods
- Exempting accessibility tools
- Testing with screen readers

## License

This security policy applies to DevTools Terminator licensed under MIT License.

---

**Last Updated**: April 1, 2026
