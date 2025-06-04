# LLM Notes - Unexpected Behavior and Solutions

This document tracks issues encountered while working with the UIElement library, their root causes, and how they were resolved. This helps identify patterns and potential improvements to the library's design and documentation.

## Issue #1: Hello World Component Attribute Handling

**Date**: Initial component testing setup
**Component**: `hello-world`
**Issue**: Expected `name="Alice"` attribute to automatically set the component's `name` property to "Alice", but it remained as default "World".

### Expected Behavior
```html
<hello-world name="Alice">
  <span>Alice</span> <!-- Expected this -->
</hello-world>
```

### Actual Behavior  
```html
<hello-world name="Alice">
  <span>World</span> <!-- Got this instead -->
</hello-world>
```

### Root Cause
The `hello-world` component uses `RESET` as its property initializer instead of a parser:
```typescript
component('hello-world', {
  name: RESET, // No parser - doesn't auto-convert attributes
}, ...)
```

### Solution Understanding
`RESET` means "use whatever is initially in the DOM as fallback". The component doesn't automatically parse HTML attributes into properties. To set the property, you must:
1. Set it programmatically: `el.name = 'Alice'`
2. Use input events: User typing triggers the property update
3. Use a parser like `asString()` if you want automatic attribute parsing

### Takeaway
This behavior is actually correct for components that want to preserve server-rendered content. The library prioritizes explicit control over automatic conversions.

## Issue #2: Lazy Load Component Testing Challenges

**Date**: Initial component testing setup  
**Component**: `lazy-load`
**Issue**: Multiple test failures due to misunderstanding the component's URL validation and async behavior.

### Problem 1: Cross-Origin URL Rejection
**Expected**: `data:text/html,<h1>Test</h1>` URLs would work for testing
**Actual**: Got "Invalid URL origin" errors

**Root Cause**: The `asURL` parser enforces same-origin policy for security:
```typescript
if (url.origin === location.origin) value = String(url)
else error = 'Invalid URL origin'
```

**Solution**: Use same-origin URLs or understand that cross-origin rejection is a security feature.

### Problem 2: Library Tests vs Component Tests Confusion
**Expected**: Component tests to work like the existing library tests
**Actual**: Different behavior because library tests use simplified inline components

**Root Cause**: 
- Library tests: Define simplified `lazy-load` component with shadow DOM
- Component tests: Use actual `lazy-load` component from docs-src with different behavior

**Solution**: Understand that real components may behave differently than test fixtures. Test the actual component behavior, not assumed behavior.

### Problem 3: Async Timing Issues
**Expected**: Immediate error/content display
**Actual**: Needed proper async waiting for component lifecycle

**Root Cause**: UIElement effects are scheduled, not synchronous. All batched updates are displayed concurrently after an `animationFrame`. DOM updates don't happen immediately when properties change.

**Solution**: Use appropriate timing patterns based on the operation:
```javascript
// For reactive property updates (most cases)
await animationFrame() // Wait for scheduled effect execution

// For async operations like network requests
const LOADING_DELAY = 200 // Configurable delay for async connectedCallback
await wait(LOADING_DELAY)
```

**Better Understanding**: 
- Reactive updates: Use `animationFrame()` for DOM updates after property changes
- Async operations: Use configurable `LOADING_DELAY` for network requests or complex async work
- The 500ms delay was excessive for most cases

### Takeaway
UIElement's scheduled effect system requires understanding when DOM updates actually occur. Most reactive updates only need `animationFrame()`, while truly async operations need longer delays.

## Issue #3: Test Infrastructure Learning Curve

**Date**: Initial component testing setup
**Issue**: Understanding how to properly test TypeScript components in the existing test framework.

### Challenge 1: Build Process Integration
**Problem**: Needed to compile TypeScript components for testing
**Solution**: Created `build:test-components` script that builds docs-src components into test directory

### Challenge 2: Test File Structure
**Problem**: Unclear how to organize component tests vs library tests
**Solution**: Separate `test/components/` directory with its own build artifacts

### Challenge 3: Timing and Lifecycle
**Problem**: Tests failing due to incorrect assumptions about component timing
**Root Cause**: UIElement effects are scheduled and batched, DOM updates happen after `animationFrame`
**Solution**: Use proper timing patterns:
- `animationFrame()` for reactive property updates
- Configurable `LOADING_DELAY` for async operations like network requests
- Understanding that immediate DOM updates don't happen synchronously

### Takeaway
Component testing requires understanding both the test infrastructure and the actual component implementation details.

---

## Patterns and Improvements Identified

### 1. Documentation Gaps
- RESET behavior could be better documented with examples
- Component attribute parsing behavior needs clearer explanation
- Async component lifecycle documentation needed

### 2. Testing Patterns
- Component tests need different strategies than library tests
- Real components have security and validation constraints
- UIElement's scheduled effect system requires proper async timing:
  - Use `animationFrame()` for reactive updates
  - Use configurable delays for truly async operations
  - Don't assume immediate DOM updates

### 3. Library Design Questions
- Should components provide more automatic attribute parsing?
- Is the RESET behavior intuitive for developers?
- How can we make testing real components easier?

---

## Issue #4: Test Isolation and State Persistence

**Date**: Tab-group component testing
**Component**: `tab-group`
**Issue**: Component state persisting between tests, causing unexpected behavior when tests share DOM elements.

### Expected Behavior
Each test should start with clean component state, with the component reading initial state from HTML attributes.

### Actual Behavior
Component state (like `selected` property) persists between tests, causing tests to fail because the component starts in an unexpected state.

### Root Cause
UIElement components are stateful and when tests share the same DOM elements (same IDs), the component state carries over between tests. The component initialization logic only runs once when the component is first connected.

### Evidence
Debug logs showed:
```
After init - selected: panel1        // First test
Before click - selected: panel2      // Second test (unexpected!)
```

### Solution Approaches
1. **Reset component state**: Manually reset component properties between tests
2. **Unique DOM elements**: Use different IDs for each test fixture
3. **Test isolation**: Ensure tests don't interfere with each other's DOM state
4. **beforeEach cleanup**: Add cleanup hooks to reset component state

### Takeaway
Component testing requires proper test isolation. Components maintain state and sharing DOM elements between tests can cause unpredictable behavior. Each test should either use unique fixtures or explicitly reset component state.

## Issue #5: Browser API Mocking and Clipboard Testing

**Date**: Code-block component testing
**Component**: `code-block`
**Issue**: Testing clipboard functionality requires mocking browser APIs that have restricted access or read-only properties.

### Expected Behavior
Should be able to mock `navigator.clipboard.writeText()` to test copy functionality without requiring user permissions or browser clipboard access.

### Actual Behavior
Initial attempts to replace `navigator.clipboard` failed because it's a read-only property.

### Root Cause
Modern browser APIs like `navigator.clipboard` have security restrictions and some properties are read-only. Direct replacement of the entire object is not allowed.

### Solution
Mock individual methods instead of replacing entire objects:
```javascript
// Store original method
const originalWriteText = navigator.clipboard?.writeText

// Replace just the method
const setupClipboardMock = (shouldFail = false) => {
    const mockWriteText = async (text) => {
        if (shouldFail) throw new Error('Clipboard write failed')
        mockClipboard.lastWrittenText = text
        return Promise.resolve()
    }
    if (navigator.clipboard) {
        navigator.clipboard.writeText = mockWriteText
    }
}

// Restore in cleanup
const restoreClipboard = () => {
    if (navigator.clipboard && originalWriteText) {
        navigator.clipboard.writeText = originalWriteText
    }
}
```

### Takeaway
When testing components that use browser APIs, mock individual methods rather than entire objects. Use proper cleanup to restore original functionality. Consider the security constraints and read-only nature of modern browser APIs.

## Issue #6: Client Router Testing Challenges

**Date**: Client-router component testing
**Component**: `client-router`
**Issue**: Components that fundamentally change browser navigation behavior are extremely difficult to test in standard test environments.

### Expected Behavior
Should be able to test SPA navigation functionality including:
- Link click interception and preventDefault behavior
- Content loading and injection into outlets
- URL updates via history.pushState
- Document title updates
- Active link class management
- Error handling for failed navigation
- Browser back/forward behavior

### Actual Behavior
The client-router component causes the test page itself to navigate away from the test environment, breaking the test runner and causing errors like:
```
Navigation to "about:blank" is interrupted by another navigation to "chrome-error://chromewebdata/"
```

### Root Cause
The client-router component:
1. Listens for all link clicks in its container
2. Intercepts same-origin navigation and prevents default
3. Uses `fetch()` to load new pages and `history.pushState()` to update URLs
4. Updates `document.title` and injects content via `dangerouslySetInnerHTML`
5. Actually navigates the browser, which conflicts with the test environment

### Solution Approaches Evaluated

#### ✅ **Partial Behavior Testing** (Implemented)
Test components without causing navigation:
- Component structure and DOM verification
- External vs internal link detection
- Outlet configuration
- Error display structure and ARIA compliance
- Edge cases (invalid hrefs, missing attributes)

**Results**: 8 tests passing, covers ~40% of functionality

#### ❌ **Iframe Isolation** (Attempted)
Create tests that run client-router inside iframe to contain navigation.

**Issues encountered**:
- Iframe source path resolution problems
- Component still causes navigation even in iframe
- Complex setup and timing issues
- Test environment interference

#### ❌ **Browser API Mocking** (Not implemented)
Mock `window.location`, `window.history`, `fetch`, `document.title`, etc.

**Challenges**:
- Extremely complex mocking (5+ browser APIs)
- Risk of missing real browser behavior
- Maintenance complexity

#### 🔄 **Alternative Approaches**
1. **E2E Testing**: Use Playwright/Cypress with real test server
2. **Component Logic Extraction**: Refactor to separate testable logic
3. **Test Server Setup**: Dedicated navigation test environment

### Lessons Learned

1. **Navigation Components Are Special**: Components that fundamentally change browser behavior need different testing strategies
2. **Test Environment Limitations**: Standard component test setups can't handle real navigation
3. **Hybrid Testing Works**: Combining structural tests + E2E tests may be optimal
4. **Architecture Matters**: Components designed for testability are easier to test

### Recommended Testing Strategy

**Immediate**: 
- ✅ Structural/behavioral tests (implemented) 
- Document limitations clearly

**Future**:
- E2E tests for navigation flows
- Consider component refactoring for testability
- Investigate test-specific component variants

### Takeaway
Some components are too complex for unit testing due to their fundamental interaction with browser APIs. A hybrid approach combining structural tests with E2E testing may be the most practical solution for navigation components.

---

## Future Investigation Topics

1. **Component Attribute Parsing**: Should we provide more examples of when to use parsers vs RESET?
2. **Testing Documentation**: Should we document the differences between testing strategies?
3. **Error Messages**: Can we improve error messages to be more helpful for debugging?
4. **Timing Documentation**: Should we better document the scheduled effect system and when to use `animationFrame()` vs longer delays?
5. **Test Isolation**: Should we provide guidelines for component test isolation and state management?
6. **Developer Experience**: What other unexpected behaviors might trip up developers?
</edits>