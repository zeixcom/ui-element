# Implementation Plan: Build System & Dev Server with Bun 1.3 & Cause & Effect

## Overview

Create a new build system and development server using Bun 1.3 and the Cause & Effect signals library for reactive incremental builds with HMR support.

## Architecture

### Core Components

1. **Reactive Build System** (`build.ts`)
   - Signal-based file tracking using Cause & Effect
   - Effect functions for different file types
   - Incremental builds based on dependency graphs
   - Build cache management

2. **Development Server** (`serve.ts`)
   - Bun-based HTTP server with WebSocket support
   - HMR client/server communication
   - Static file serving with compression
   - Live reload functionality

3. **File Watcher** (`file-watcher.ts`)
   - Efficient file system monitoring
   - Debounced change detection
   - Pattern-based filtering
   - Integration with reactive signals

4. **Build Effects** (`effects/`)
   - Menu generation effect
   - Markdown processing effect
   - Component fragment effect
   - Asset building effects (JS/CSS)
   - Sitemap generation effects
   - Service worker effect

## Implementation Steps

### Phase 1: Core Infrastructure

#### 1.1 Reactive File System (`file-signals.ts`)

- Set up Cause & Effect signals for file tracking
- Implement file content caching with reactive updates
- Create dependency graph management
- Add file hash calculation for change detection

```typescript
// Key signals:
- sourceFiles: State<Map<string, FileInfo>>
- processedFiles: Computed<Map<string, ProcessedFile>>
- dependencyGraph: Computed<Map<string, Set<string>>>
- buildQueue: State<Set<string>>
```

#### 1.2 Build System Core (`build.ts`)

- Plugin registration and lifecycle management
- Build orchestration with dependency resolution
- Error handling and reporting
- Build result caching

#### 1.3 File Watcher (`file-watcher.ts`)

- Use Bun's native file watching capabilities
- Implement debouncing for rapid changes
- Filter by configured patterns
- Emit reactive signals on changes

### Phase 2: Build Effects

Effects are functions that react to signal changes and generate file outputs.

#### 2.1 Menu Generation Effect (`effects/menu.ts`)

**Input**: Files in `docs-src/pages`
**Output**: `docs-src/includes/menu.html`
**Triggers**: Changes to page files or metadata

- Scan page directory using config paths
- Extract frontmatter from markdown files
- Sort according to `PAGE_ORDER` from config
- Generate HTML using existing `menu.ts` template
- React to page additions/removals/metadata changes

#### 2.2 Asset Build Effects (`effects/assets.ts`)

**JS Pipeline**:

- Input: `docs-src/main.ts`
- Watch: `src/**/*.ts`, `docs-src/components/**/*.ts`, `docs-src/functions/**/*.ts`
- Build: `bun build` with minification and sourcemaps
- Output: `docs/assets/main.js`

**CSS Pipeline**:

- Input: `docs-src/main.css`
- Watch: `docs-src/global.css`, `docs-src/components/**/*.css`
- Build: `bunx lightningcss` with minification and bundling
- Output: `docs/assets/main.css`

#### 2.3 Fragment Generation Effect (`effects/fragment.ts`)

**Input**: `docs-src/components/**/*.{html,css,ts}` (excluding `*.test.html`)
**Output**: `docs-src/examples/*.html`
**Transform**: Using existing `fragments.ts` template

- Create single fragment for all three source files
- Generate tabbed interface with syntax highlighting
- Create reactive relationships between source and output

#### 2.4 Markdown Processing Effect (`effects/markdown.ts`)

**Input**: `docs-src/pages/**/*.md`
**Layout**: `docs-src/layout.html`
**Includes**: Menu and footer files
**Output**: `docs/*.html`

- Parse markdown with frontmatter
- Generate TOC using existing `toc.ts`
- Apply layout template with includes
- Handle relative links and asset references

#### 2.5 Sitemap Effect (`effects/sitemap.ts`)

**Input**: Generated HTML files in `docs/`
**Output**: `docs/sitemap.xml`
**Dependency**: Runs after all HTML is generated

#### 2.6 Service Worker Effect (`effects/service-worker.ts`)

**Input**: Asset files and build results
**Output**: `docs/sw.js`
**Dependency**: Runs after assets are built

### Phase 3: Development Server

#### 3.1 HTTP Server (`serve.ts`)

- Bun-based server with WebSocket support
- Static file serving with compression
- Development-specific middleware
- Error page handling

#### 3.2 HMR System (`hmr.ts`)

- WebSocket communication for live updates
- Client-side update injection
- CSS hot reloading
- JavaScript module replacement
- HTML partial updates

### Phase 4: Integration & Configuration

#### 4.1 Main Entry Points

- `build.ts` - Production build command
- `serve.ts` - Development server with HMR

#### 4.2 Configuration Management

- Extend existing `config.ts` with server options
- Environment-specific settings
- Plugin configuration options

#### 4.3 Error Handling & Logging

- Structured error reporting
- Build progress indicators
- Performance monitoring
- Debug logging levels

## File Structure

```
docs-src/server/
├── IMPLEMENTATION_PLAN.md
├── REQUIREMENTS.md
├── config.ts (existing - extend)
├── types.ts (existing - extend)
├── build.ts (new main build entry)
├── serve.ts (new dev server entry)
├── file-signals.ts (reactive)
├── file-watcher.ts (with pattern matching & debouncing)
├── hmr.ts
├── effects/
│   ├── base.ts
│   ├── menu.ts
│   ├── assets.ts
│   ├── fragments.ts
│   ├── markdown.ts
│   ├── sitemap.ts
│   └── service-worker.ts
└── utils/
    ├── file-utils.ts
    ├── path-utils.ts
    └── hash-utils.ts
```

## Implementation Order

1. **Core Infrastructure**
   - Reactive file system with Cause & Effect
   - Base plugin architecture
   - File watcher implementation
   - Build system core

2. **Essential Effects**
   - Menu generation plugin
   - Asset build plugin (JS/CSS)
   - Markdown processing plugin

3. **Advanced Effects**
   - Fragment generation plugin
   - Sitemap plugin
   - Service worker plugin

4. **Development Server**
   - HTTP server with static serving
   - WebSocket HMR implementation
   - Client-side HMR script

5. **Integration & Testing**
   - Main entry point scripts
   - Error handling and logging
   - Performance optimization
   - Testing with existing build scripts

## Success Criteria

- [ ] All 6 build steps from requirements work correctly
- [ ] HMR updates work for JS, CSS, HTML, and Markdown changes
- [ ] Incremental builds only process changed files and dependencies
- [ ] Build performance is faster than current system
- [ ] Development server starts quickly and serves files efficiently
- [ ] Error reporting is clear and actionable
- [ ] Existing `package.json` scripts continue to work
- [ ] Memory usage is reasonable during long development sessions

## Technical Considerations

### Performance

- Use Bun's native performance features (faster file I/O, JSON parsing)
- Implement efficient file hashing for change detection
- Cache parsed results to avoid redundant processing
- Use incremental builds based on dependency graphs

### Reliability

- Handle file system race conditions gracefully
- Provide clear error messages with context
- Implement proper cleanup on process termination
- Add retry logic for transient failures

### Maintainability

- Clear separation of concerns between plugins
- Comprehensive TypeScript types
- Consistent error handling patterns
- Good test coverage for core functionality

## Migration Strategy

1. Keep existing build system as backup
2. Implement new system alongside existing one
3. Add feature flag to switch between systems
4. Test thoroughly with existing content
5. Gradual rollout with fallback option
6. Remove old system once stable

## Next Steps

1. Review plan with team
2. Set up development branch
3. Begin implementation with Phase 1
4. Regular testing against existing content
5. Documentation updates as features are completed
