# Testing Documentation

This folder contains the testing infrastructure and documentation for the UI Element library.

## Current Setup Status: ✅ Stable & Reliable

Our testing setup has been significantly improved and now provides:

- **248 tests** passing reliably across all browsers
- **~12 second** execution time
- **Pre-test validation** to catch errors early
- **Better error reporting** and debugging

## Quick Start

```bash
# Validate tests before running (recommended)
bun run test:validate

# Run all tests
bun run test

# Watch mode for development
bun run test:watch

# Debug tests manually in browser
bun run test:debug
```

## Test Structure

```
test/
├── README.md                      # This file
├── TESTING_ANALYSIS.md            # Detailed analysis of testing solutions
├── TESTING_RECOMMENDATIONS.md     # Current recommendations and future paths
├── web-test-runner.config.js      # Test runner configuration
├── validate-tests.js              # Pre-test validation script
├── component-test.html            # Component lifecycle and integration tests
├── context-test.html              # Context and state management tests
├── dom-test.html                  # DOM utilities and selectors tests
├── effects-test.html              # Effects and reactive property tests
├── parsers-test.html              # Type parser and validation tests
└── mock/                          # Mock files for testing
    └── 404.html                   # 404 test case
```

## Current Technology Stack

- **Test Runner**: @web/test-runner with Playwright
- **Browsers**: Chromium, Firefox, WebKit
- **Assertions**: @esm-bundle/chai
- **Test Framework**: @web/test-runner-mocha
- **Validation**: Custom pre-test validation script

## Test Commands

| Command                   | Description                                  |
| ------------------------- | -------------------------------------------- |
| `bun run test:validate`   | Check tests for common issues before running |
| `bun run test`            | Run full test suite with validation          |
| `bun run test:ci`         | Run tests (CI-friendly, no validation)       |
| `bun run test:watch`      | Watch mode for development                   |
| `bun run test:debug`      | Manual debugging in browser                  |
| `bun run test:components` | Test documentation components                |

Note: The validation script runs from within the test directory and checks all test files for common issues that could cause timeouts or hangs.

## Configuration Files

- `web-test-runner.config.js` - Test runner configuration
- `validate-tests.js` - Pre-test validation script
- `../package.json` - Test scripts and dependencies

## Test Categories

### 1. Component Tests (`component-test.html`)

- Component lifecycle (connected/disconnected)
- State management and signals
- Attribute parsing and validation
- Property getters and setters
- Debug mode functionality

### 2. Effects Tests (`effects-test.html`)

- Reactive property updates (`setText`, `setProperty`, `setAttribute`, etc.)
- Event handling (`on`, `emit`)
- Element visibility (`show`)
- Style and class manipulation
- Signal passing between components
- Error handling and edge cases

### 3. DOM Tests (`dom-test.html`)

- DOM utilities and element selection
- Signal producers (`fromSelector`, `fromEvent`, etc.)
- Integration with DOM APIs
- Performance and memory management

### 4. Parser Tests (`parsers-test.html`)

- Type parsers (`asString`, `asNumber`, `asBoolean`, etc.)
- Validation and error handling
- Edge cases and boundary conditions

### 5. Context Tests (`context-test.html`)

- Context propagation and inheritance
- State sharing between components
- Provider/consumer patterns

## Writing New Tests

### Test File Structure

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Your Test Title</title>
  </head>
  <body>
    <!-- Test components and setup here -->

    <script type="module">
      import { runTests } from '@web/test-runner-mocha'
      import { assert } from '@esm-bundle/chai'
      import {} from /* your imports */ '../index.dev.js'

      runTests(() => {
        describe('Your Test Suite', function () {
          it('should do something', function () {
            // Your test code
            assert.equal(actual, expected)
          })
        })
      })
    </script>
  </body>
</html>
```

### Best Practices

1. **Use descriptive test names** that explain what's being tested
2. **Clean up after tests** - remove created elements, call cleanup functions
3. **Use `await animationFrame()` helper** for async operations
4. **Test both success and failure cases**
5. **Keep tests focused** - one assertion per test when possible
6. **Use the validation script** before running tests

### Async Testing Pattern

```javascript
const animationFrame = async () => new Promise(requestAnimationFrame)

it('should handle async updates', async function () {
  const signal = state('initial')
  const cleanup = setText(signal)({}, element)

  signal.set('updated')
  await animationFrame()

  assert.equal(element.textContent, 'updated')
  cleanup()
})
```

## Debugging Tests

### Common Issues

- **Import errors**: Check imports match exports in `index.dev.js`
- **Timeout errors**: Use pre-test validation to catch syntax issues
- **Async issues**: Ensure proper `await animationFrame()` usage
- **Memory leaks**: Always call cleanup functions

### Debugging Tools

- `bun run test:debug` - Opens manual testing interface
- Browser DevTools - Full debugging capabilities
- Console logs - Available in test output
- Validation script - Catches common issues early

## Performance Guidelines

- **Target**: <15 seconds total execution time
- **Current**: ~12 seconds for 248 tests
- **Per-file limit**: <80 tests per file
- **File size limit**: <500KB per test file

## Future Considerations

The current setup is stable and meets our needs. Future migration options are documented in:

- `TESTING_ANALYSIS.md` - Detailed comparison of testing solutions
- `TESTING_RECOMMENDATIONS.md` - Migration paths and decision criteria

**Current recommendation**: Continue with improved current setup and reassess in 3 months.

## Contributing

1. Run `bun run test:validate` before submitting changes
2. Ensure all tests pass across all browsers
3. Add tests for new functionality
4. Update documentation when adding new test patterns
5. Follow existing test structure and naming conventions

## Support

For testing issues:

1. Check this documentation
2. Run the validation script to identify common problems
3. Review existing test patterns for similar functionality
4. Use browser DevTools for debugging
