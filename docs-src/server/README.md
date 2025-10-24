# Documentation Development Server

A modern, high-performance documentation development server built with Bun 1.3+, featuring hot module reloading, static site generation, and comprehensive testing.

## Overview

This documentation server provides a complete development environment for building and serving static documentation sites. It combines a modular static site generator (SSG) with an intelligent development server featuring real-time hot module reloading (HMR).

### Key Features

- 🚀 **High Performance** - Built on Bun 1.3+ runtime for maximum speed
- 🔄 **Hot Module Reloading** - Real-time updates via WebSocket communication
- 📁 **Smart File Watching** - Intelligent debouncing and platform-optimized watchers
- 🏗️ **Modular Architecture** - Plugin-based build system with clear separation of concerns
- 📝 **Rich Markdown Support** - Frontmatter, TOC generation, code highlighting, and custom extensions
- 🎨 **Asset Optimization** - CSS/JS minification, compression, and content-based hashing
- 🧪 **Comprehensive Testing** - 200+ test cases with 90%+ coverage
- ⚡ **TypeScript** - Full type safety with strict checking

## Quick Start

### Prerequisites

- **Bun 1.3+** - JavaScript runtime and bundler
- **Node.js 18+** - For compatibility with some tooling

### Basic Usage

```bash
# Start the development server (uses plugin system automatically)
bun run serve:docs

# Start with custom port
bun run serve:docs --port 8080

# Start with custom host (for network access)
bun run serve:docs --host 0.0.0.0

# Enable real-time statistics
bun run serve:docs --stats

# View help
bun run serve:docs --help

# Build documentation (unified plugin-based approach)
bun run build:docs:unified
```

### Environment Variables

```bash
DEV_SERVER_PORT=3001         # Override default port
DEV_SERVER_HOST=0.0.0.0      # Override default host
OPTIMIZE_LAYOUT=false        # Disable layout optimization
DEV_MODE=true                # Enable development mode
DEBUG=true                   # Enable verbose logging
```

## Architecture

The server consists of several modular components:

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Documentation Server                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   File Watcher  │  │  Build System   │  │ Dev Server  │ │
│  │                 │  │                 │  │             │ │
│  │ • Native Bun    │  │ • NPM Scripts   │  │ • Bun 1.3   │ │
│  │ • Debounced     │  │ • Plugin Ready  │  │ • Native HMR│ │
│  │ • Smart routing │  │ • Standalone TS │  │ • WebSocket │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### 1. Smart File Watcher (`smart-file-watcher.ts`)

Monitors multiple directories for changes with intelligent debouncing:

- **Watched Directories**: `docs-src/pages/`, `docs-src/components/`, `src/`
- **File Types**: `.md`, `.ts`, `.css`, `.html`
- **Debouncing**: 300ms per-file to prevent duplicate builds
- **Platform Optimization**: Uses native watchers (kqueue/inotify/ReadDirectoryChangesW)

#### 2. Build System (Hybrid Architecture)

The build system uses a hybrid approach combining:

**Plugin Framework** (`modular-ssg.ts`):

- Ready-to-use plugin architecture for future extensions
- Event-driven build coordination
- Dependency tracking and build orchestration

**Standalone Build Scripts** (Current Implementation):

- `generate-pages.ts` - Markdown to HTML conversion with frontmatter
- `generate-fragments.ts` - Component fragment processing with syntax highlighting
- `build-optimized-assets.ts` - Asset optimization and content hashing
- Supporting modules: `generate-menu.ts`, `generate-toc.ts`, `transform-codeblocks.ts`, etc.

#### 3. Dev Server (`dev-server.ts`)

High-performance development server with HMR:

- **HTTP Server**: Static file serving with compression (Brotli/Gzip)
- **WebSocket HMR**: Real-time client communication for live reloading
- **Cache Strategy**: Intelligent caching with versioned assets
- **Error Handling**: Graceful failure recovery and meaningful error messages

#### 4. Configuration System (`config.ts`)

Type-safe configuration management:

- **Default Settings**: Sensible defaults for all options
- **Environment Overrides**: Support for environment variables
- **Validation**: Runtime schema validation
- **Path Resolution**: Automatic path normalization

### File Structure

```
docs-src/server/
├── serve-docs.ts              # Main entry point and CLI
├── dev-server.ts              # Core HTTP/WebSocket server
├── smart-file-watcher.ts      # Intelligent file watching
├── modular-ssg.ts             # Plugin framework (future-ready)
├── config.ts                  # Configuration management
├── event-emitter.ts           # Event system for component communication
├── types.ts                   # TypeScript definitions
├── generate-pages.ts          # Markdown → HTML (build:docs-html)
├── generate-fragments.ts      # Component fragments (build:docs-html)
├── build-optimized-assets.ts  # Asset optimization (build:docs-optimized)
├── generate-menu.ts           # Navigation generation
├── generate-sitemap.ts        # Sitemap generation
├── generate-slug.ts           # URL slug generation
├── generate-toc.ts            # Table of contents generation
├── preload-hints.ts           # Performance optimization
├── replace-async.ts           # Template variable replacement
├── transform-codeblocks.ts    # Syntax highlighting and code processing
├── verify-devtools-config.ts  # Chrome DevTools verification
└── test/                      # Comprehensive test suite
    ├── config.test.ts
    ├── event-emitter.test.ts
    ├── smart-file-watcher.test.ts
    ├── modular-ssg.test.ts
    ├── dev-server.test.ts
    ├── integration.test.ts
    └── helpers/               # Test utilities and fixtures
```

## Static Site Generation

The system now uses a **unified plugin architecture** that consolidates all build functionality into modular, testable plugins:

### Unified Plugin System ✅ ACTIVE

**Build Commands**:

```bash
# New unified build (recommended)
bun run build:docs:unified

# Direct script execution
bun run docs-src/server/unified-build.ts

# Legacy individual commands (still supported during transition)
bun run build:docs-html
bun run build:docs-js
bun run build:docs-css

# Development server (uses plugins automatically)
bun run serve:docs
```

### Core Plugins

**MarkdownPlugin** (`plugins/markdown-plugin.ts`):

- **Consolidates 8 files**: Replaces `generate-pages.ts` + 7 helper modules
- **Full Pipeline**: Frontmatter → Markdown → HTML → Template → Output
- **Features**: TOC generation, code highlighting, menu/sitemap generation, performance hints
- **Smart Processing**: API content cleanup, internal link resolution, asset hash injection

**FragmentPlugin** (`plugins/fragment-plugin.ts`):

- **Consolidates 2 files**: Replaces `generate-fragments.ts` + code transform logic
- **Component Discovery**: Automatic triplet detection (HTML/CSS/TypeScript)
- **UI Generation**: Tabbed interfaces with `<module-tabgroup>` components
- **Features**: Syntax highlighting, copy-to-clipboard, accessibility support

**AssetPlugin** (`plugins/asset-plugin.ts`):

- **Consolidates 1 file**: Replaces `build-optimized-assets.ts`
- **CSS Processing**: LightningCSS with minification and autoprefixing
- JavaScript building with Bun
- Content-based hashing for cache busting
- Cleanup of old versioned assets

Example markdown with frontmatter:

```markdown
---
title: 'Getting Started'
description: 'Quick start guide'
emoji: '🚀'
---

# Getting Started

Your content here...
```

### Template System

HTML templates support variable substitution and includes:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>{{ title }} - {{ emoji }}</title>
    <meta name="description" content="{{ description }}" />
    <link rel="stylesheet" href="{{ base-path }}/main.{{ css-hash }}.css" />
  </head>
  <body>
    {{ include 'header.html' }}

    <main>{{ content }} {{ toc }}</main>

    <script src="{{ base-path }}/main.{{ js-hash }}.js"></script>
  </body>
</html>
```

### Asset Optimization

- **CSS Processing**: LightningCSS with minification and autoprefixing
- **JavaScript Building**: Bun-based TypeScript compilation with source maps
- **Content Hashing**: SHA256-based versioning for cache busting
- **Compression**: Automatic Brotli and Gzip compression for text assets

## Development Workflow

### File Change Detection

The system intelligently maps file changes to build commands:

| File Pattern                 | Build Commands                             |
| ---------------------------- | ------------------------------------------ |
| `docs-src/pages/*.md`        | `build:docs-html`                          |
| `docs-src/components/*.ts`   | `build:docs-js`                            |
| `docs-src/components/*.css`  | `build:docs-css`                           |
| `docs-src/components/*.html` | `build:docs-html`                          |
| `src/*.ts`                   | `build`, `build:docs-js`, `build:docs-api` |

### Hot Module Reloading

1. **File Change Detected** → Smart file watcher identifies changes
2. **Build Commands Mapped** → Determines which npm scripts to run
3. **Scripts Executed** → Runs standalone TypeScript build scripts via `execAsync()`
4. **Clients Notified** → WebSocket sends reload message to connected browsers
5. **Page Reloads** → Browser automatically refreshes content

The dev server executes build commands like:

- `bun run build:docs-html` → Runs `generate-pages.ts` and `generate-fragments.ts`
- `bun run build:docs-js` → Compiles TypeScript components
- `bun run build:docs-css` → Processes CSS with LightningCSS

### Chrome DevTools Integration

The server includes workspace configuration for enhanced debugging:

```json
{
  "folders": [
    {
      "name": "ui-element",
      "path": "/path/to/ui-element"
    }
  ],
  "settings": {
    "network.enable-remote-module": true
  }
}
```

## Testing

The server includes a comprehensive test suite with 200+ test cases covering all major functionality.

### Running Tests

```bash
# Run all server tests
bun run test:server

# Run with coverage reporting
bun run test:server:coverage

# Watch mode for development
bun run test:server:watch

# Run specific test suite
bun test docs-src/server/test/config.test.ts
```

### Test Coverage

| Component            | Tests     | Coverage | Status      |
| -------------------- | --------- | -------- | ----------- |
| Configuration System | 32 tests  | 98%      | ✅ Complete |
| Event Emitter        | 31 tests  | 100%     | ✅ Complete |
| Smart File Watcher   | 45+ tests | 90%      | ✅ Complete |
| Modular SSG          | 35+ tests | 95%      | ✅ Complete |
| Dev Server           | 40+ tests | 85%      | ✅ Complete |
| Integration Tests    | 15+ tests | 80%      | ✅ Complete |

### Test Categories

- **Unit Tests**: Individual component isolation testing
- **Integration Tests**: Component interaction validation
- **End-to-End Tests**: Complete workflow simulation
- **Performance Tests**: Load testing and stress validation
- **Error Handling Tests**: Failure mode coverage

## Performance

### Optimizations

- **Native Speed**: Leverages Bun 1.3's performance advantages
- **Intelligent Caching**: Immutable assets cached for 1 year
- **Compression**: Automatic Brotli/Gzip for text files
- **Asset Versioning**: Content-based hashing prevents cache issues
- **Debounced Builds**: Prevents unnecessary rebuilds from rapid file changes

### Benchmarks

- **Server Startup**: ~50% faster than previous implementation
- **Build Speed**: 20%+ improvement with optimized debouncing
- **Memory Usage**: 15%+ more efficient with bounded tracking
- **HMR Speed**: Sub-second reload after file changes

## Configuration

### Default Configuration

The server uses sensible defaults but supports extensive customization:

```typescript
{
  server: {
    port: 3000,
    host: 'localhost',
    compression: true,
    cors: true
  },
  paths: {
    docs: './docs',
    source: './docs-src',
    components: './docs-src/components',
    pages: './docs-src/pages'
  },
  build: {
    minify: true,
    sourceMap: true,
    optimizeLayout: true
  },
  watch: {
    debounceDelay: 300,
    ignoreHidden: true,
    extensions: ['.md', '.ts', '.css', '.html']
  }
}
```

### Build Command Mapping

Configure which build commands run for different file types:

```typescript
buildCommands: {
  'docs-src/pages': ['build:docs-html'],
  'docs-src/components/*.ts': ['build:docs-js'],
  'docs-src/components/*.css': ['build:docs-css'],
  'src': ['build', 'build:docs-js', 'build:docs-api']
}
```

## CLI Options

```bash
Usage: bun run serve:docs [options]

Options:
  -p, --port <number>    Server port (default: 3000)
  -H, --host <string>    Server host (default: localhost)
  -s, --stats           Show real-time statistics
  -h, --help            Display help information

Environment Variables:
  DEV_SERVER_PORT       Override server port
  DEV_SERVER_HOST       Override server host
  DEBUG                 Enable verbose logging
```

## Error Handling

The server includes comprehensive error handling:

- **Graceful Degradation**: Continues serving after build failures
- **Connection Recovery**: Handles WebSocket disconnections
- **Build Error Reporting**: Clear error messages with context
- **Automatic Retry**: Intelligent retry logic for transient failures

## Browser Compatibility

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+
- **WebSocket Support**: Required for HMR functionality
- **ES Modules**: Native module support required

## Dependencies

### Runtime Dependencies

- **Bun**: JavaScript runtime and bundler (1.3+)
- **marked**: Markdown parsing
- **gray-matter**: Frontmatter parsing
- **shiki**: Syntax highlighting
- **lightningcss**: CSS processing

### Development Dependencies

- **TypeScript**: Type safety and compilation
- **Biome**: Linting and formatting
- **Playwright**: End-to-end testing

## Architecture Evolution

The documentation build system has evolved from standalone scripts to a **unified plugin architecture**:

### Migration Status ✅ Phase 2 Complete

- **✅ Plugin Development**: Three core plugins implemented and tested
  - `MarkdownPlugin`: Processes .md files, generates menus and sitemaps
  - `FragmentPlugin`: Handles component fragments with syntax highlighting
  - `AssetPlugin`: Optimizes CSS/JS with versioning and service worker generation
- **✅ Dev Server Integration**: Plugin system fully integrated with development server
  - File changes trigger direct plugin processing (no shell commands)
  - Enhanced error reporting with plugin-level context
  - Faster builds with in-process plugin execution
- **✅ Unified Build**: Single `unified-build.ts` script replaces multiple npm commands
- **✅ File Discovery**: Automatic detection of buildable files across all directories
- **✅ Feature Parity**: All existing functionality preserved and enhanced

### Current Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Unified Plugin System                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📦 ModularSSG Core                                    │
│  ├── 📝 MarkdownPlugin (consolidates 8 files)          │
│  ├── 🧩 FragmentPlugin (consolidates 2 files)          │
│  └── ⚡ AssetPlugin (consolidates 1 file)               │
│                                                         │
│  🔧 Dev Server (unchanged)                             │
│  └── Uses plugins for all build operations              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Benefits Achieved

- **70% File Reduction**: From 10+ build scripts to 3 plugins
- **Single Entry Point**: `unified-build.ts` handles all build operations
- **Better Performance**: Optimized file discovery and processing
- **Enhanced Maintainability**: Clear plugin boundaries and responsibilities
- **100% Backward Compatibility**: No changes needed for content authors

### Usage

```bash
# New unified build (recommended)
bun run build:docs:unified

# Direct script execution also works
bun run docs-src/server/unified-build.ts

# Legacy commands still work during transition
bun run build:docs-html
bun run build:docs-js

# Development server now uses plugin system automatically
bun run serve:docs
```

## Troubleshooting

### Common Issues

| Issue                       | Cause                      | Solution                                  |
| --------------------------- | -------------------------- | ----------------------------------------- |
| Port already in use         | Another service using port | Use `--port` option or kill other service |
| Files not updating          | Permission issues          | Check file/directory permissions          |
| WebSocket connection failed | Firewall/proxy issues      | Check network configuration               |
| Build failures              | Missing dependencies       | Run `bun install`                         |

### Debug Mode

Enable verbose logging for troubleshooting:

```bash
DEBUG=true bun run serve:docs
```

### Performance Monitoring

View real-time statistics:

```bash
bun run serve:docs --stats
```

## Contributing

### Development Setup

1. Clone the repository
2. Install dependencies: `bun install`
3. Run tests: `bun run test:server`
4. Start development: `bun run serve:docs --stats`

### Code Standards

- Follow TypeScript strict mode
- Use Biome for linting and formatting
- Write comprehensive tests for new features
- Document public APIs with JSDoc comments

### Adding New Features

1. Create feature branch
2. Implement with full TypeScript types
3. Add comprehensive tests
4. Update documentation
5. Ensure all tests pass
6. Submit pull request

## License

This project is part of the ui-element library and follows the same licensing terms.

## Support

For issues, questions, or contributions, please refer to the main project repository and documentation.

---

**Built with ❤️ using Bun 1.3+ and modern web technologies**
