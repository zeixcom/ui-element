# Documentation Development Server

A modern, high-performance documentation development server built with Bun 1.3+, featuring a unified plugin-based static site generator (SSG), hot module reloading, and comprehensive testing.

## Overview

This documentation server provides a complete development environment for building and serving static documentation sites. It combines a **modular plugin-based static site generator** with an intelligent development server featuring real-time hot module reloading (HMR).

### Key Features

- 🚀 **High Performance** - Built on Bun 1.3+ runtime for maximum speed
- 🔌 **Plugin Architecture** - Unified modular SSG with extensible plugin system
- 🔄 **Hot Module Reloading** - Real-time updates via WebSocket communication
- 📁 **Smart File Watching** - Intelligent debouncing and platform-optimized watchers
- 📝 **Rich Markdown Support** - Frontmatter, TOC generation, code highlighting, and custom extensions
- 🎨 **Asset Optimization** - CSS/JS minification, compression, and content-based hashing
- 🧪 **Comprehensive Testing** - 200+ test cases with 90%+ coverage
- ⚡ **TypeScript** - Full type safety with strict checking

## Quick Start

### Prerequisites

- **Bun 1.3+** - JavaScript runtime and bundler

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

# Direct plugin-based build
bun run docs-src/server/build.ts
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

### Core Components

The server is built around a **unified plugin architecture** that provides clean separation of concerns and extensibility:

#### 1. Smart File Watcher (`smart-file-watcher.ts`)

Monitors file system changes with intelligent debouncing:

- **Cross-platform compatibility** - Uses optimal watchers per OS
- **Debounced events** - Prevents excessive rebuilds during rapid changes
- **Path filtering** - Ignores irrelevant files (node_modules, .git, etc.)
- **Event aggregation** - Batches related changes for efficient processing

#### 2. Modular SSG (`modular-ssg.ts`)

Plugin-based static site generator that processes files through registered plugins:

- **Plugin registration** - Dynamic plugin loading and initialization
- **File discovery** - Automatic detection of processable files
- **Dependency tracking** - Maintains build dependency graphs
- **Incremental builds** - Only rebuilds changed files and dependencies
- **Error handling** - Plugin-level error isolation and reporting

#### 3. Dev Server (`dev-server.ts`)

Bun 1.3-powered development server with HMR capabilities:

- **WebSocket HMR** - Real-time browser updates without page refresh
- **Static file serving** - Efficient serving of built documentation
- **Asset versioning** - Content-based hashing for cache busting
- **Chrome DevTools integration** - Automatic DevTools opening
- **Compression** - Gzip/Brotli support for optimal performance

#### 4. Configuration System (`config.ts`)

Centralized configuration with environment variable support:

- **Path management** - Source, output, and template directory configuration
- **Server settings** - Host, port, and development options
- **Plugin configuration** - Per-plugin settings and options
- **Environment overrides** - CLI and environment variable support

### File Structure

```
docs-src/server/
├── README.md                  # This documentation
├── serve-docs.ts             # Main entry point with CLI
├── dev-server.ts             # Development server with HMR
├── modular-ssg.ts            # Plugin-based SSG engine
├── smart-file-watcher.ts     # Intelligent file watching
├── config.ts                 # Configuration management
├── config-manager.ts         # Config loading and validation
├── event-emitter.ts          # Internal event system
├── types.ts                  # TypeScript type definitions
├── build.ts                  # Unified build script
├── plugins/                  # Plugin implementations
│   ├── markdown-plugin.ts    # Markdown processing
│   ├── fragment-plugin.ts    # Component fragments
│   └── asset-plugin.ts       # CSS/JS optimization
├── templates/                # Template utilities
│   ├── code-blocks.ts       # Code highlighting
│   ├── menu.ts              # Navigation generation
│   ├── toc.ts               # Table of contents
│   ├── sitemap.ts           # XML sitemap
│   ├── service-worker.ts    # PWA service worker
│   └── performance-hints.ts # Performance optimizations
└── test/                     # Test suite
```

## Plugin System

### Unified Plugin Architecture

The documentation system uses a **modular plugin architecture** that consolidates all build functionality into extensible, testable plugins:

### Core Plugins

#### MarkdownPlugin (`plugins/markdown-plugin.ts`)

Processes Markdown files into complete HTML pages:

**Features:**

- **Frontmatter parsing** - YAML metadata extraction
- **Markdown to HTML** - GitHub Flavored Markdown support
- **Code highlighting** - Syntax highlighting with Shiki
- **Template application** - Full HTML page generation with layouts
- **TOC generation** - Automatic table of contents creation
- **Menu generation** - Dynamic navigation menu building
- **Sitemap generation** - XML sitemap for SEO
- **Performance optimization** - Asset preloading hints
- **Internal link resolution** - .md to .html link conversion
- **API content cleanup** - Special handling for API documentation

**Configuration:**

```typescript
const markdownPlugin = new MarkdownPlugin(assetOptimizationResults)
ssg.use(markdownPlugin)
```

#### FragmentPlugin (`plugins/fragment-plugin.ts`)

Handles component fragments with syntax highlighting and UI generation:

**Features:**

- **Component discovery** - Automatic triplet detection (HTML/CSS/TypeScript)
- **Syntax highlighting** - Code highlighting for all supported languages
- **Tabbed interfaces** - Interactive `<module-tabgroup>` components
- **Copy-to-clipboard** - Built-in code copying functionality
- **Accessibility support** - Full keyboard navigation and screen reader support

**File Structure Support:**

```
components/
├── button/
│   ├── button.html          # Component template
│   ├── button.css           # Component styles
│   └── button.ts            # Component logic
```

#### AssetPlugin (`plugins/asset-plugin.ts`)

Optimizes and versions CSS and JavaScript assets:

**Features:**

- **CSS optimization** - LightningCSS with minification and autoprefixing
- **JavaScript bundling** - Bun-powered bundling with minification
- **Content-based hashing** - Cache-busting with hash-based filenames
- **Source maps** - Development debugging support
- **Service worker generation** - PWA capabilities with asset caching
- **Legacy asset cleanup** - Automatic removal of old versioned files

**Output:**

```
docs/assets/
├── main.a1b2c3d4.css       # Versioned CSS
├── main.a1b2c3d4.js        # Versioned JavaScript
├── main.a1b2c3d4.js.map    # Source map
```

### Creating Custom Plugins

To create a custom plugin, extend the `BaseBuildPlugin` class:

```typescript
import { BaseBuildPlugin } from '../modular-ssg'
import type { BuildInput, BuildOutput, DevServerConfig } from '../types'

export class MyCustomPlugin extends BaseBuildPlugin {
  public readonly name = 'my-custom-plugin'
  public readonly version = '1.0.0'
  public readonly description = 'Does custom processing'

  public shouldRun(filePath: string): boolean {
    // Return true if this plugin should process the file
    return filePath.endsWith('.mycustom')
  }

  public async transform(input: BuildInput): Promise<BuildOutput> {
    try {
      // Process the input file
      const processedContent = this.processFile(input.content)

      return this.createSuccess(input, {
        content: processedContent,
        metadata: {
          processed: true,
          processingTime: Date.now(),
        },
      })
    } catch (error) {
      return this.createError(input, `Processing failed: ${error.message}`)
    }
  }

  public async initialize(config: DevServerConfig): Promise<void> {
    // Optional: Initialize plugin resources
    console.log(`Initializing ${this.name}`)
  }

  public async cleanup(): Promise<void> {
    // Optional: Clean up plugin resources
    console.log(`Cleaning up ${this.name}`)
  }

  private processFile(content: string): string {
    // Your custom processing logic here
    return content.toUpperCase()
  }
}
```

Register your plugin:

```typescript
import { ModularSSG } from './modular-ssg'
import { MyCustomPlugin } from './plugins/my-custom-plugin'

const ssg = new ModularSSG(config)
ssg.use(new MyCustomPlugin())
await ssg.initialize()
```

### Plugin Lifecycle

1. **Registration** - Plugins are registered with `ssg.use(plugin)`
2. **Initialization** - `plugin.initialize()` called once during startup
3. **File Processing** - `plugin.shouldRun()` determines applicability
4. **Transformation** - `plugin.transform()` processes matching files
5. **Cleanup** - `plugin.cleanup()` called during shutdown

### Plugin API Reference

#### BuildInput Interface

```typescript
interface BuildInput {
  filePath: string // Absolute path to input file
  content: string // File content
  metadata: any // Accumulated metadata from previous plugins
}
```

#### BuildOutput Interface

```typescript
interface BuildOutput {
  success: boolean // Processing success status
  filePath?: string // Output file path
  content?: string // Processed content
  metadata?: any // Output metadata
  errors?: BuildError[] // Error details
  warnings?: BuildError[] // Warning details
  dependencies?: string[] // File dependencies
  stats?: any // Processing statistics
}
```

## Development Workflow

### File Change Detection

The smart file watcher monitors these directories for changes:

- `docs-src/pages/` - Markdown documentation files
- `docs-src/components/` - Component fragments
- `docs-src/main.css` - Global styles
- `docs-src/main.ts` - Main JavaScript
- `docs-src/templates/` - HTML templates

When changes are detected:

1. **Debounced Processing** → Changes are batched over 150ms
2. **Plugin Resolution** → Affected files are matched to applicable plugins
3. **Incremental Build** → Only changed files and dependencies are rebuilt
4. **Client Notification** → WebSocket sends targeted updates to browsers

### Hot Module Reloading

The HMR system provides instant feedback during development:

- **CSS Updates** - Styles are updated without page refresh
- **JavaScript Updates** - Modules are hot-swapped when possible
- **HTML Updates** - Pages are refreshed only when necessary
- **Asset Updates** - Images and other assets trigger targeted reloads

### Chrome DevTools Integration

The server can automatically open Chrome DevTools for debugging:

```json
{
  "folders": [
    {
      "name": "docs-src",
      "path": "docs-src/"
    }
  ],
  "settings": {
    "network.enable-remote-module": true
  }
}
```

## Testing

### Running Tests

```bash
# Run all tests
bun run test

# Run tests with coverage
bun run test:coverage

# Run specific test file
bun run test docs-src/server/test/modular-ssg-test.ts

# Run tests in watch mode
bun run test:watch
```

### Test Coverage

Current test coverage includes:

- **Plugin System** - 95%+ coverage of all core plugins
- **File Processing** - Comprehensive markdown and fragment processing tests
- **Asset Optimization** - CSS/JS build pipeline testing
- **Development Server** - HMR and file serving functionality
- **Configuration** - Config loading and validation
- **Error Handling** - Edge cases and error conditions

## Performance

### Optimizations

The system includes several performance optimizations:

- **Incremental builds** - Only rebuild changed files
- **Plugin caching** - Avoid reprocessing unchanged content
- **Asset versioning** - Efficient browser caching with hash-based names
- **Content compression** - Gzip/Brotli compression for all text assets
- **Resource preloading** - Automatic preload hints for critical resources

## Configuration

### Default Configuration

```typescript
const DEFAULT_CONFIG: DevServerConfig = {
  server: {
    port: parseInt(process.env.DEV_SERVER_PORT) || 3000,
    host: process.env.DEV_SERVER_HOST || 'localhost',
    openBrowser: true,
    openDevTools: false,
  },
  paths: {
    pages: 'docs-src/pages',
    components: 'docs-src/components',
    includes: 'docs-src/templates/includes',
    layout: 'docs-src/templates/layout.html',
    src: 'docs-src',
    output: 'docs',
  },
  build: {
    optimizeLayout: process.env.OPTIMIZE_LAYOUT !== 'false',
    generateSourceMaps: true,
    minifyAssets: true,
  },
  watch: {
    ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
    debounceMs: 150,
  },
}
```

### Plugin Configuration

Individual plugins can be configured during registration:

```typescript
const markdownPlugin = new MarkdownPlugin({
  syntaxHighlighting: true,
  generateTOC: true,
  tocDepth: 3,
})

const assetPlugin = new AssetPlugin({
  minification: true,
  sourceMaps: true,
  contentHashing: true,
})

ssg.use(markdownPlugin).use(assetPlugin)
```

## CLI Options

The development server supports various command-line options:

```bash
# Server configuration
bun run serve:docs --port 8080           # Custom port
bun run serve:docs --host 0.0.0.0        # Custom host
bun run serve:docs --no-browser          # Don't open browser
bun run serve:docs --devtools            # Open Chrome DevTools

# Development options
bun run serve:docs --stats               # Show periodic statistics
bun run serve:docs --debug               # Enable verbose logging
bun run serve:docs --no-watch            # Disable file watching

# Help
bun run serve:docs --help                # Show usage information
```

## Error Handling

The system provides comprehensive error handling:

- **Plugin-level isolation** - Errors in one plugin don't affect others
- **Detailed error reporting** - File path, line number, and context information
- **Graceful degradation** - Partial builds continue when possible
- **Development-friendly messages** - Clear, actionable error descriptions

Error output example:

```
❌ Plugin markdown-processor failed for docs-src/pages/api/example.md
   Line 15: Invalid frontmatter syntax
   Expected YAML format but found malformed content
```

## Dependencies

### Runtime Dependencies

```json
{
  "bun": "^1.3.0",
  "gray-matter": "^4.0.3",
  "marked": "^9.1.2",
  "shiki": "^0.14.4"
}
```

## Troubleshooting

### Common Issues

**Port already in use:**

```bash
# Check what's using the port
lsof -ti:3000
# Use a different port
bun run serve:docs --port 3001
```
