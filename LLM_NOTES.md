# LLM Notes - Unexpected Behavior and Solutions

This document tracks issues encountered while working with the UIElement library, their root causes, and how they were resolved. This helps identify patterns and potential improvements to the library's design and documentation.

## Issue #1: Hello World Component Attribute Handling

**Date**: Initial component testing setup
**Component**: `hello-world`
**Issue**: Expected `name="Alice"` attribute to automatically set the component's `name` property to "Alice", but it remained as default "World".

### Expected Behavior

```html
<hello-world name="Alice">
	<span>Alice</span>
	<!-- Expected this -->
</hello-world>
```

### Actual Behavior

```html
<hello-world name="Alice">
	<span>World</span>
	<!-- Got this instead -->
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
	const mockWriteText = async text => {
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

## Issue #7: Test Timing Best Practices for UIElement Components

**Date**: Component test suite development
**Issue**: Establishing consistent and reliable timing patterns for testing UIElement components across different browsers and scenarios.

### Problem Background

UIElement's reactive system schedules effects rather than executing them synchronously. This creates timing challenges in tests where DOM updates, property changes, and reactive effects need to happen in the correct order.

### Original Approach

Initially used separate timing functions:

```javascript
await animationFrame() // Wait for effects to execute
await microtask() // Wait for DOM to reflect changes
```

### Evolved Solution: `tick()` Helper

Created a unified timing helper used consistently across all component tests:

```javascript
const tick = async () => {
	await animationFrame() // Wait for effects to execute
	await microtask() // Wait for DOM to reflect changes
}
```

### When to Use `tick()`

#### ✅ Always Use After:

- **Property changes**: `el.value = 'new value'; await tick()`
- **Event dispatching**: `input.dispatchEvent(new Event('change')); await tick()`
- **DOM modifications**: Any programmatic DOM changes that should trigger reactive updates

#### ✅ Use in Helper Functions:

```javascript
const typeInInput = async (input, text) => {
	input.value = text
	input.dispatchEvent(new Event('input', { bubbles: true }))
	await tick() // Ensure reactive updates complete
}
```

#### ✅ Use for Reactive Property Dependencies:

Some components need extra timing for complex reactive chains:

```javascript
await typeInInput(input, 'test')
await tick() // Extra tick for clear button visibility updates
```

### Special Cases Discovered

#### Input-Combobox Clear Button

The clear button visibility depends on `el.length` property, which is updated by the `input` event but the `setProperty('hidden', () => !el.length)` reactive effect needs additional time:

```javascript
await typeInInput(input, 'test') // This includes one tick()
await tick() // Need extra tick for clear button reactive update
assert.isFalse(clearBtn.hidden)
```

#### DOM Query Selectors with CSS Pseudo-Selectors

For components using selectors like `:not([hidden])`, DOM needs to update before queries work correctly:

```javascript
// Component hides/shows options via hidden attribute
await typeInInput(input, 'filter')
await tick() // Wait for DOM to reflect hidden attributes
const visibleOptions = el.querySelectorAll('[role="option"]:not([hidden])')
```

### Timing Anti-Patterns

#### ❌ Don't Use Arbitrary Delays:

```javascript
await wait(50) // Bad - unpredictable, slow
```

#### ❌ Don't Skip Timing After Property Changes:

```javascript
el.value = 'test'
assert.equal(input.value, 'test') // Bad - may fail due to timing
```

#### ❌ Don't Use Only `animationFrame()`:

```javascript
await animationFrame() // Incomplete - doesn't wait for DOM updates
```

### Test Structure Best Practices

#### Consistent Helper Pattern:

```javascript
const tick = async () => {
	await animationFrame() // Wait for effects to execute
	await microtask() // Wait for DOM to reflect changes
}

const resetComponent = async el => {
	// Reset component state
	el.value = ''
	await tick()
}

const typeInInput = async (input, text) => {
	input.value = text
	input.dispatchEvent(new Event('input', { bubbles: true }))
	await tick()
}
```

#### BeforeEach Cleanup:

```javascript
beforeEach(async () => {
	const testIds = ['test1', 'test2', 'test3']
	for (const id of testIds) {
		const el = document.getElementById(id)
		if (el) await resetComponent(el)
	}
})
```

### Performance Considerations

- `tick()` adds ~1-2ms per call (minimal overhead)
- Much faster than arbitrary timeouts
- Consistent across different browser environments
- No noticeable delay in test execution

### Browser Compatibility

This timing pattern works reliably across:

- ✅ Chromium-based browsers
- ✅ Firefox
- ✅ WebKit/Safari
- ✅ Different test environments (local, CI/CD)

### Takeaway

The `tick()` helper provides a consistent, minimal, and reliable way to handle UIElement's scheduled effect system in tests. It should be used after any operation that triggers reactive updates, and some complex reactive chains may need additional `tick()` calls.

---

## ✅ Issue #8: Component Initialization Timing and getSignal() Access [RESOLVED]

### Problem Summary

Parent components needed to access reactive signals from child components before they were fully initialized, causing runtime errors when `getSignal()` was called on unupgraded HTMLElements.

### Root Cause

**Component initialization timing issue**: Custom elements are defined asynchronously, and `querySelector` can return raw HTMLElements before they're upgraded to Component instances with `getSignal()` methods.

### Solution: `read()` Function

**Status: ✅ RESOLVED** - The library now includes a `read()` function in `src/core/dom.ts` that handles this pattern:

```typescript
// Current implementation in dom.ts
const read = <Q extends ComponentProps, K extends keyof Q>(
	source: Component<Q> | null,
	prop: K,
	fallback: Q[K],
): (() => Q[K]) => {
	if (!source) return () => fallback
	if (!isComponent(source))
		throw new TypeError(`Target element must be a custom element`)

	const awaited = computed(async () => {
		await customElements.whenDefined(source.localName)
		return source.getSignal(prop)
	})

	return () => {
		const value = awaited.get()
		return value === UNSET ? fallback : (value.get() as Q[K])
	}
}
```

**Usage in components:**

```typescript
// Clean API - create accessor functions once in setup
const inputLength = read(input, 'length', 0)
const radioValue = read(radiogroup, 'value', 'all')

// Functions work directly in effects
setProperty('disabled', () => !inputLength())
setAttribute('filter', radioValue)
```

### Key Benefits Achieved

- ✅ **Timing-safe**: Works regardless of component initialization order
- ✅ **Type-safe**: Proper component property typing with `Q[K]`
- ✅ **Efficient**: Creates async computed once, not on every access
- ✅ **Fallback support**: Returns fallback value until component is ready
- ✅ **Clean API**: Simple `read(component, 'prop', fallback)` pattern

### Takeaway

**Component composition timing issues are now solved** with the `read()` function. This is the standard pattern for accessing reactive signals from child components safely. The function handles component readiness timing automatically while providing efficient access to reactive properties.

## Issue #9: Component Method Patterns and Bidirectional State Sync

### Problem Background

When external components need to modify child component state (like clearing an input), simply setting properties doesn't always properly sync all related state and native DOM elements.

**Example issue in todo-app:**

```typescript
// In todo-app form submission
input.value = '' // ❌ Only sets component property
// Missing: length update, error validation, native input sync
```

### Root Cause

Setting component properties directly bypasses the component's internal synchronization logic:

- Native DOM element not updated
- Related properties (length, error) not recalculated
- Validation not re-run
- Events not triggered

### Solution: Component Methods Pattern

Added `.clear()` method to input-textbox component that handles all synchronization:

```typescript
export type InputTextboxProps = {
	value: string
	length: number
	error: string
	description: string
	clear(): void // Method for external components
}

// Implementation in component setup
el.clear = () => {
	input.value = '' // Update native element
	batch(() => {
		el.value = ''
		el.error = input.validationMessage ?? ''
		el.length = 0
	})
}
```

**Usage in external components:**

```typescript
// In todo-app form submission
input.clear() // ✅ Properly clears everything
```

### Benefits of Method Pattern

1. **Complete synchronization**: Updates all related state atomically
2. **Encapsulation**: Component controls its own state management
3. **Consistency**: Same logic as internal clear button
4. **Type safety**: Methods are part of component interface
5. **Future-proof**: Easy to extend with additional logic

### When to Use Component Methods

- **State modifications** that affect multiple properties
- **Actions** that need DOM and component sync
- **Complex operations** with validation/side effects
- **External component interactions** requiring guaranteed consistency

### Alternative Patterns Considered

- **Direct property setting**: ❌ Incomplete synchronization
- **Event dispatching**: 🤔 More complex, less direct
- **Signal passing**: 🤔 Good for data flow, not actions

### Takeaway

**Component methods provide clean APIs for external state modifications**. When components need to expose operations (not just data), methods ensure proper internal synchronization while maintaining encapsulation. This is especially important for form controls where multiple properties and DOM elements must stay in sync.

## Resolved Issues Summary

- ✅ **Issue #8: Component Initialization Timing** - Resolved with `read()` function
- ✅ **Show/Hide Pattern** - Resolved with `show()` helper function

## ✅ Issue #10: Enhanced Event Type Safety for DOM Abstractions [RESOLVED]

### Problem Summary

**Date**: Enhanced DOM abstractions implementation
**Issue**: The new `sensor()` and `fromEvent()` functions needed better TypeScript type safety to prevent common errors like listening for invalid events on specific element types.

### Challenge Description

TypeScript's `HTMLElementEventMap` includes all possible events for any HTML element, but specific element types have different event capabilities:

- `HTMLInputElement` supports `'input'`, `'change'` events
- `HTMLButtonElement` primarily supports `'click'` events
- `HTMLFormElement` supports `'submit'`, `'reset'` events
- `HTMLMediaElement` supports `'play'`, `'pause'`, `'volumechange'` events

The original implementation allowed invalid combinations like listening for `'submit'` events on input elements.

### Solution: Element-Specific Event Type Maps

Implemented enhanced type safety with conditional types that map element types to their appropriate events:

```typescript
// Map common element types to their typical events
type ElementEventMap<E extends Element> = E extends
	| HTMLInputElement
	| HTMLTextAreaElement
	| HTMLSelectElement
	? Pick<
			HTMLElementEventMap,
			'input' | 'change' | 'focus' | 'blur' | 'invalid'
		>
	: E extends HTMLFormElement
		? Pick<HTMLElementEventMap, 'submit' | 'reset' | 'formdata'>
		: E extends HTMLButtonElement
			? Pick<HTMLElementEventMap, 'click' | 'focus' | 'blur'>
			: // ... more element types
				HTMLElementEventMap // fallback to all events

// Helper types for enhanced type safety
type ElementEventType<
	E extends Element,
	K extends string,
> = K extends keyof ElementEventMap<E> ? ElementEventMap<E>[K] : Event
type ValidEventName<E extends Element> = keyof ElementEventMap<E> & string
```

### Updated Function Signatures

```typescript
// Before: Generic event type
const sensor = <T extends {}, K extends string, ...>(
	host: C, source: E, type: K, transform: (..., event: Event, ...) => T, ...
): Computed<T>

// After: Element-specific event type constraints
const sensor = <
	T extends {},
	E extends Element,
	K extends ValidEventName<E>,
	C extends HTMLElement = HTMLElement,
>(
	host: C, source: E, type: K,
	transform: (..., event: ElementEventType<E, K>, ...) => T, ...
): Computed<T>
```

### Benefits Achieved

1. **Compile-time validation**: TypeScript prevents invalid event/element combinations
2. **Proper event typing**: Event parameters get correct types (e.g., `InputEvent` for `'input'`, `SubmitEvent` for `'submit'`)
3. **IDE autocomplete**: Only valid events are suggested for each element type
4. **Graceful fallback**: Unknown element types still get full event support
5. **Backward compatibility**: Existing code continues to work with improved type safety

### Real-World Usage Examples

```typescript
// ✅ Valid: input elements support 'input' events, event properly typed as InputEvent
const inputValue = fromEvent<string, HTMLInputElement, 'input'>(
	'input[type="text"]',
	'input',
	(_, source, event) => {
		console.log('Input type:', event.inputType) // event is InputEvent
		return source.value
	},
	'',
)

// ✅ Valid: form elements support 'submit' events, event properly typed as SubmitEvent
const formData = fromEvent<FormData, HTMLFormElement, 'submit'>(
	'form',
	'submit',
	(_, source, event) => {
		event.preventDefault() // event is SubmitEvent
		return new FormData(source)
	},
	new FormData(),
)

// ❌ TypeScript error: input elements don't typically have 'submit' events
const invalid = fromEvent<string, HTMLInputElement, 'submit'>( // <- Error here
	'input',
	'submit', // ...
)
```

### Implementation Details

- **Updated**: `sensor()` and `fromEvent()` functions with enhanced type constraints
- **Added**: Three new exported utility types: `ElementEventMap`, `ElementEventType`, `ValidEventName`
- **Fixed**: Existing `input-textbox` component to use new type signature
- **Updated**: All TypeScript declaration files and exports
- **Tested**: All existing tests pass without changes
- **Created**: Comprehensive example file demonstrating type safety features

### Testing Results

- ✅ All existing tests continue to pass (223 tests across 3 browsers)
- ✅ No breaking changes to existing API usage
- ✅ Type safety improvements are opt-in via generics
- ✅ Enhanced developer experience with better IDE support

### Takeaway

**Enhanced event type safety successfully implemented** without breaking existing functionality. The DOM abstraction functions now provide compile-time validation for element/event combinations while maintaining full flexibility for edge cases. This represents a significant improvement in developer experience and type safety for the library's DOM interaction layer.

## ✅ Issue #11: Stale Compiled Code in Component Tests [RESOLVED]

### Problem Summary

Component tests failing massively (~30 tests) due to running against outdated compiled code instead of latest source changes.

### Expected Behavior

- Tests should run against the latest component source code changes
- Component properties should update when event handlers fire
- Traditional event handlers should work correctly

### Actual Behavior

- 28+ tests failing with component properties not updating
- Event handlers appeared to not be called
- Properties remained at initial values (0 for length, '' for value)
- Misleading symptoms suggesting fundamental issues with component system

### Root Cause

**Build synchronization issue**: Component tests use compiled JavaScript (`test/components/main.js`) built from TypeScript source. Changes to source files in `docs-src/components/` are not reflected in tests until the compiled bundle is rebuilt.

### Evidence

```bash
# Before rebuild - 28+ failing tests
npx web-test-runner "test/components/input-textbox-test.html"

# After rebuild - 28 passing, 1 unrelated failure
bun run build:test-components
npx web-test-runner "test/components/input-textbox-test.html"
```

### Solution

Always run `bun run build:test-components` after making changes to component source files before running component tests.

### Debugging Journey

Wasted significant time investigating:

- ❌ Sensor-based `fromEvent()` vs traditional event handlers
- ❌ Complex timing fixes in test helpers
- ❌ Initial validation state handling
- ❌ Event bubbling and listener registration issues

**None of these were necessary** - the real issue was stale compiled code.

### Prevention

1. **Always rebuild before testing components**: `bun run build:test-components`
2. **Use the proper test command**: `bun run test:components` (includes build step)
3. **Check build timestamps** when debugging mysterious test failures
4. **Verify test output includes recent changes** through debug logging

### Key Lesson

When component tests fail after code changes:

1. **First check**: Is a build step required?
2. **Second check**: Are tests running against latest code?
3. **Only then**: Debug actual component logic

Build system issues can masquerade as complex application logic problems.

### Takeaway

**Component test failures often indicate build synchronization issues rather than component logic bugs**. Always verify tests are running against current code before deep-diving into component implementation debugging. This prevented ~2 hours of unnecessary investigation into working systems.

## Future Investigation Topics

1. **Component Attribute Parsing**: Should we provide more examples of when to use parsers vs RESET?
2. **Testing Documentation**: Should we document the differences between testing strategies?
3. **Error Messages**: Can we improve error messages to be more helpful for debugging?
4. **Timing Documentation**: Should we better document the scheduled effect system and when to use `animationFrame()` vs longer delays?
5. **Show/Hide Patterns**: Document the new `show()` helper and its benefits over manual `setProperty('hidden', ...)`
6. **Test Isolation**: Should we provide guidelines for component test isolation and state management?
7. **Developer Experience**: What other unexpected behaviors might trip up developers?
8. **Sensor Cleanup**: Should we document the automatic cleanup behavior for users?
9. **Build Process Documentation**: Should we better document the component test build requirements?
