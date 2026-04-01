# Contributing to DevTools Terminator

Thanks for considering contributing to this project. Here's how you can help.

## Code of Conduct

Be respectful. That's it. Don't be a jerk to other contributors.

## How to Contribute

### Reporting Bugs

Before creating a bug report, check the existing issues to avoid duplicates. When you create a bug report, include:

- A clear, descriptive title
- Exact steps to reproduce the problem
- What you expected to happen
- What actually happened
- Browser version and operating system
- Screenshots if relevant

### Suggesting Features

Feature suggestions are tracked as GitHub issues. When suggesting a feature:

- Use a clear, descriptive title
- Explain the problem this feature would solve
- Describe the solution you'd like
- Mention any alternative solutions you've considered
- Explain why this would be useful to other users

### Pull Requests

1. Fork the repository
2. Create a branch from `main` (`git checkout -b feature/my-feature`)
3. Make your changes
4. Test on multiple browsers
5. Commit with a clear message (`git commit -m "Add feature X"`)
6. Push to your fork (`git push origin feature/my-feature`)
7. Open a pull request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/Devtools-Terminator.git
cd Devtools-Terminator

# Create a branch
git checkout -b feature/my-feature

# Make changes and test
# Open demo.html in different browsers

# Commit and push
git add .
git commit -m "Description of changes"
git push origin feature/my-feature
```

## Coding Standards

- Use ES5 syntax for maximum browser compatibility
- Follow the existing code style
- Add comments for complex logic
- Keep functions small and focused
- Avoid external dependencies
- Test on multiple browsers before submitting

### Code Style

```javascript
// Good
function checkDevTools() {
    devtoolsOpen = false;
    console.log(element);
    console.clear();
    return devtoolsOpen;
}

// Bad
function checkDevTools(){
  devtoolsOpen=false;
  console.log(element);console.clear();
  return devtoolsOpen;
}
```

## Testing

Before submitting a pull request, test your changes:

1. Open `demo.html` in Chrome, Firefox, Safari, and Edge
2. Test on both desktop and mobile browsers
3. Verify DevTools detection works correctly
4. Check that the termination page displays properly
5. Ensure no console errors appear
6. Test with different configuration options

## Browser Support

Your changes must work on:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Documentation

If your changes affect functionality:

- Update README.md
- Add JSDoc comments to new functions
- Update examples if the API changes
- Add entries to CHANGELOG.md

## Commit Messages

Write clear commit messages:

```
Good:
- "Add configuration option for custom termination handler"
- "Fix false positives on iOS Safari"
- "Improve window size detection accuracy"

Bad:
- "Update code"
- "Fix bug"
- "Changes"
```

## What We're Looking For

Contributions that would be particularly helpful:

- Bug fixes
- Browser compatibility improvements
- Performance optimizations
- Better mobile detection
- Documentation improvements
- Additional detection methods
- Test coverage

## What We're Not Looking For

- External dependencies (keep it zero-dependency)
- Breaking changes without discussion
- Features that significantly increase file size
- Code that only works in specific browsers

## Questions?

Open an issue with the "question" label on GitHub.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thanks for contributing!
