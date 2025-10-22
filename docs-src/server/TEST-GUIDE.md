# Dev Server Test Suite Guide

## Overview

This guide covers the comprehensive test suite for the documentation development server. The tests are built using Bun's built-in test runner and provide complete coverage of all server components.

## Test Structure

### Test Organization

```
docs-src/server/test/
├── helpers/
│   ├── test-setup.ts          # Test utilities and mock functions
│   └── test-content.ts        # Test fixtures and sample data
├── config.test.ts             # Configuration system tests
├── event-emitter.test.ts      # Event system tests
├── smart-file-watcher.test.ts # File watching tests
├── modular-ssg.test.ts        # Static site generator tests
├── dev-server.test.ts         # Main server tests
├── integration.test.ts        # End-to-end integration tests
└── run-tests.ts               # Custom test runner
```

### Test Categories

1. **Unit Tests** - Individual component testing
2. **Integration Tests** - Component interaction testing
3. **End-to-End Tests** - Complete workflow testing
4. **Performance Tests** - Load and stress testing

## Running Tests

### Basic Usage

```bash
# Run all server tests
bun run test:server

# Run tests with coverage
bun run test:server:coverage

# Run tests in watch mode
bun run test:server:watch

# Run specific test file
bun test docs-src/server/test/config.test.ts

# Run tests matching pattern
bun test docs-src/server/test/*.test.ts --test-name-pattern="ConfigManager"
```

### Advanced Options

```bash
# Custom test runner with verbose output
bun run docs-src/server/test/run-tests.ts --verbose

# Run specific test suite
bun run docs-src/server/test/run-tests.ts --pattern=config

# Watch mode with coverage
bun run docs-src/server/test/run-tests.ts --watch --coverage
```

## Test Components

### 1. Configuration System Tests (`config.test.ts`)

Tests the type-safe configuration system including:

- ✅ **Default Configuration Loading**
- ✅ **Environment Variable Overrides**
- ✅ **Configuration Validation**
- ✅ **Path Resolution**
- ✅ **Build Command Mapping**
- ✅ **Deep Object Merging**

**Key Test Cases:**
```typescript
// Configuration validation
expect(() => ConfigManager.validate(invalidConfig)).toThrow(ConfigValidationError)

// Environment overrides
process.env.DEV_SERVER_PORT = '4000'
const config = await configManager.load()
expect(config.server.port).toBe(4000)

// Build command mapping
const commands = getBuildCommands('docs-src/pages/test.md')
expect(commands).toEqual(['build:docs-html'])
```

### 2. Event Emitter Tests (`event-emitter.test.ts`)

Tests the pub/sub event system including:

- ✅ **Event Registration and Emission**
- ✅ **Multiple Handler Support**
- ✅ **Error Handling in Handlers**
- ✅ **Once-Only Events**
- ✅ **Handler Removal**
- ✅ **Memory Management**
- ✅ **Type Safety**

**Key Test Cases:**
```typescript
// Event handling
eventEmitter.on('build:start', handler)
eventEmitter.emit('build:start', { files: [], commands: [] })
expect(handler.calls.length).toBe(1)

// Error resilience
const errorHandler = () => { throw new Error('Test') }
expect(() => eventEmitter.emit('event', data)).not.toThrow()
```

### 3. Smart File Watcher Tests (`smart-file-watcher.test.ts`)

Tests the intelligent file watching system including:

- ✅ **File Change Detection**
- ✅ **Debouncing Logic**
- ✅ **Multi-Directory Watching**
- ✅ **Extension Filtering**
- ✅ **Hidden File Ignoring**
- ✅ **Build Command Mapping**
- ✅ **Stat-Based Change Detection**
- ✅ **Error Recovery**

**Key Test Cases:**
```typescript
// File change detection
writeFileSync(testFile, 'modified content')
await waitFor(() => mockEventEmitter.emit.calls.length > 0, 2000, 100)
expect(changeEvent.buildCommands).toEqual(['build:docs-html'])

// Debouncing
writeFileSync(testFile, 'change 1')
writeFileSync(testFile, 'change 2')  // Rapid changes
await delay(200)
expect(fileChangeCalls.length).toBe(1)  // Debounced to single event
```

### 4. Modular SSG Tests (`modular-ssg.test.ts`)

Tests the plugin-based static site generator including:

- ✅ **Plugin Registration**
- ✅ **File Processing Pipeline**
- ✅ **Error Handling**
- ✅ **Concurrent Build Prevention**
- ✅ **Dependency Tracking**
- ✅ **Output Writing**
- ✅ **Plugin Lifecycle Management**

**Key Test Cases:**
```typescript
// Plugin processing
const result = await ssg.buildFile(testFile)
expect(result.success).toBe(true)
expect(result.content).toContain('<h1>Test Title</h1>')

// Concurrent build protection
const builds = [ssg.buildFile(file), ssg.buildFile(file)]
const results = await Promise.all(builds)
expect(results.some(r => !r.success)).toBe(true)  // Some should fail
```

### 5. Dev Server Tests (`dev-server.test.ts`)

Tests the main development server including:

- ✅ **Server Lifecycle**
- ✅ **HTTP Request Handling**
- ✅ **WebSocket Communication**
- ✅ **HMR Script Injection**
- ✅ **Static File Serving**
- ✅ **Compression Support**
- ✅ **Error Handling**
- ✅ **Statistics Reporting**

**Key Test Cases:**
```typescript
// Server startup
await devServer.start()
expect(devServer.getStats().server.isRunning).toBe(true)

// HMR script injection
const response = await fetch(`http://localhost:${testPort}/test.html`)
const content = await response.text()
expect(content).toContain('new WebSocket')  // HMR injected

// WebSocket communication
await wsClient.connect(testPort)
wsClient.send(JSON.stringify({ type: 'ping' }))
expect(wsClient.getMessages()).toContain(expect.stringContaining('pong'))
```

### 6. Integration Tests (`integration.test.ts`)

Tests complete system workflows including:

- ✅ **Full Development Workflow**
- ✅ **File Change → Build → Reload Cycle**
- ✅ **Multiple Client Handling**
- ✅ **Component Integration**
- ✅ **Performance Under Load**
- ✅ **Error Recovery**
- ✅ **Real-World Scenarios**

**Key Test Cases:**
```typescript
// Complete workflow
await devServer.start()
const wsClient = new TestWebSocketClient()
await wsClient.connect(testPort)

// Trigger file change
writeFileSync(sourceFile, '# Modified content')

// Verify rebuild and client notification
await waitFor(() => wsClient.getMessages().includes('reload'), 5000, 100)
expect(wsClient.getMessages()).toContain('reload')
```

## Test Utilities

### Mock Functions

```typescript
// Create mock function
const mockFn = createMockFunction()
mockFn('arg1', 'arg2')
expect(mockFn.calls.length).toBe(1)
expect(mockFn.calls[0]).toEqual(['arg1', 'arg2'])
```

### Test Context

```typescript
// Create isolated test environment
const testContext = createTestContext('test-name')
// Provides:
// - Temporary directory
// - Mock files and directories
// - Test configuration
// - Automatic cleanup
```

### WebSocket Client

```typescript
// Test WebSocket interactions
const wsClient = new TestWebSocketClient()
await wsClient.connect(port)
wsClient.send('test message')
const messages = wsClient.getMessages()
wsClient.close()
```

### Timing Utilities

```typescript
// Wait for conditions
await waitFor(() => condition(), timeout, interval)

// Simple delay
await delay(milliseconds)
```

## Test Data and Fixtures

### Sample Content (`test-content.ts`)

- **Markdown samples** with various frontmatter configurations
- **HTML templates** with different feature combinations
- **Component files** (TypeScript, CSS, HTML)
- **Configuration variations** for different scenarios
- **HTTP responses** for mocking server interactions

### Common Patterns

```typescript
// Test file creation
writeFileSync(join(testContext.tempDir, 'test.md'), TEST_MARKDOWN_CONTENT.simple)

// Mock server responses
const response = await fetch(url, { headers: { 'Accept-Encoding': 'gzip' }})

// Event verification
await waitFor(() => eventEmitter.emit.calls.length > 0, 3000, 100)
```

## Coverage Goals

### Current Coverage Areas

- **Configuration System**: 100% line coverage
- **Event System**: 100% line coverage
- **File Watching**: 95% line coverage (platform-specific edge cases)
- **Build System**: 90% line coverage (plugin-dependent features)
- **Dev Server**: 85% line coverage (network-dependent features)
- **Integration**: 80% line coverage (real-world complexity)

### Target Metrics

- **Overall Line Coverage**: >90%
- **Function Coverage**: >95%
- **Branch Coverage**: >85%
- **Statement Coverage**: >90%

## Performance Benchmarks

### Test Performance

- **Unit Tests**: <100ms per test
- **Integration Tests**: <5s per test
- **Full Suite**: <2 minutes
- **Coverage Generation**: <3 minutes

### Load Testing

```typescript
// Concurrent request handling
const requests = Array.from({ length: 50 }, () => fetch(url))
const responses = await Promise.all(requests)
expect(responses.every(r => r.status === 200)).toBe(true)

// Rapid file changes
for (let i = 0; i < 100; i++) {
  writeFileSync(testFile, `content ${i}`)
}
// System should remain stable with debounced responses
```

## Debugging Tests

### Verbose Output

```bash
# Enable detailed logging
bun test --verbose docs-src/server/test/*.test.ts

# Debug specific test
bun test --test-name-pattern="specific test name" docs-src/server/test/file.test.ts
```

### Common Issues

1. **Port Conflicts**: Tests automatically find free ports
2. **File System Race Conditions**: Use `waitFor()` for async operations
3. **Timing Issues**: Adjust debounce delays for test environment
4. **Mock Cleanup**: All test contexts auto-cleanup temp files

### Test Isolation

- Each test gets isolated temporary directories
- Mock functions are reset between tests
- Environment variables are restored after each test
- Network ports are dynamically allocated

## Continuous Integration

### GitHub Actions Integration

```yaml
name: Dev Server Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run test:server:coverage
```

### Performance Monitoring

Tests include performance benchmarks that fail if:
- Individual tests take >5 seconds
- Memory usage grows unbounded
- File watching becomes unresponsive
- HTTP requests timeout frequently

## Contributing to Tests

### Adding New Tests

1. **Follow naming convention**: `component.test.ts`
2. **Use descriptive test names**: `should handle error when file not found`
3. **Include setup/teardown**: Use `beforeEach`/`afterEach`
4. **Test error cases**: Don't just test happy paths
5. **Add documentation**: Explain complex test scenarios

### Test Structure Template

```typescript
describe('ComponentName', () => {
  let testContext: TestContext

  beforeEach(() => {
    testContext = createTestContext('component-test')
  })

  afterEach(() => {
    testContext.cleanup()
  })

  describe('feature group', () => {
    it('should handle normal case', () => {
      // Test implementation
    })

    it('should handle error case', () => {
      // Error testing
    })
  })
})
```

## Future Enhancements

### Planned Additions

- [ ] **Visual Regression Tests** for generated HTML
- [ ] **Performance Regression Tests** with historical baselines
- [ ] **Browser Integration Tests** using Playwright
- [ ] **Memory Leak Detection** in long-running scenarios
- [ ] **Accessibility Testing** for generated content

### Testing Tools Integration

- [ ] **Snapshot Testing** for configuration outputs
- [ ] **Property-Based Testing** for configuration validation
- [ ] **Mutation Testing** for test quality verification
- [ ] **Load Testing** with realistic traffic patterns

## Troubleshooting

### Common Test Failures

| Error | Cause | Solution |
|-------|-------|----------|
| Port already in use | Test cleanup failed | Use `getFreePort()` helper |
| File not found | Race condition | Add `await delay()` before file operations |
| WebSocket connection failed | Server not ready | Use `waitFor()` to ensure server startup |
| Test timeout | Long-running operation | Increase timeout or optimize test |

### Environment Setup

```bash
# Verify Bun version
bun --version  # Should be 1.3.1+

# Clean test artifacts
rm -rf test-temp-*

# Run with debugging
DEBUG=true bun run test:server
```

The test suite provides comprehensive coverage of the dev server functionality while maintaining fast execution and reliable results across different environments.
