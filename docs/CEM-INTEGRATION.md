# Custom Elements Manifest (CEM) Integration

This document explains how to use the Custom Elements Manifest integration for UIElement components.

## Overview

The CEM integration automatically analyzes UIElement components and generates detailed manifest files that describe their properties, attributes, and metadata. This enables better tooling support, documentation generation, and IDE features.

## Usage

### Generating Manifests

To generate Custom Elements Manifest files for all components:

```bash
bun run build:cem
```

This command will:
1. Scan all components in `docs-src/components/`
2. Analyze each `component()` function call using the UIElement CEM plugin
3. Generate individual JSON manifest files in `docs/cem/`
4. Create a unified manifest at `custom-elements.json`

### Output Structure

The integration generates:

- **Individual manifests**: `docs/cem/{component-name}.json` - One file per component
- **Unified manifest**: `custom-elements.json` - All components in a single file

Each manifest contains:
- Component metadata (tag name, description)
- Property definitions with types and default values
- Attribute mappings
- UIElement-specific metadata (parsers, extractors, etc.)

### Example Manifest

```json
{
  "schemaVersion": "1.0.0",
  "readme": "Component: hello-world",
  "modules": [
    {
      "kind": "javascript-module",
      "path": "docs-src/components/hello-world/hello-world.ts",
      "declarations": [
        {
          "kind": "class",
          "name": "HelloWorld",
          "tagName": "hello-world",
          "customElement": true,
          "members": [
            {
              "kind": "field",
              "name": "name",
              "type": { "text": "string" },
              "description": "Reactive property parsed with asString()",
              "privacy": "public",
              "_uielement": {
                "parser": "asString",
                "pattern": "Parses attribute as string with optional fallback"
              }
            }
          ],
          "attributes": [
            {
              "name": "name",
              "type": { "text": "string" },
              "description": "HTML attribute for the name property"
            }
          ]
        }
      ]
    }
  ]
}
```

## Configuration

The CEM integration is configured in `custom-elements-manifest.config.js`:

```javascript
export default {
  // Scan all component TypeScript files
  globs: ['docs-src/components/*/*.ts'],

  // Use UIElement plugin for component analysis
  plugins: [
    uiElementPlugin({
      componentDetection: {
        functionNames: ['component'],
        includeInterfaces: true,
      },
      propertyAnalysis: {
        analyzeReactiveProps: true,
        includeJSDoc: true,
        inferTypesFromInitializers: true,
      },
    }),
  ],
}
```

## Plugin Features

The UIElement CEM plugin provides:

### Component Detection
- Automatically finds `component()` function calls
- Extracts tag names and component structure
- Maps TypeScript interfaces to component props

### Property Analysis
- Detects reactive properties from initializer objects
- Identifies parser functions (`asString`, `asInteger`, etc.)
- Extracts extractor functions (`fromDOM`, `fromEvents`, etc.)
- Infers types from TypeScript annotations and default values

### Metadata Enrichment
- Adds UIElement-specific metadata under `_uielement` field
- Documents parser patterns and arguments
- Tracks reactive property behavior
- Maps properties to HTML attributes

### Documentation Integration
- Extracts JSDoc comments
- Generates property descriptions
- Includes usage examples and patterns

## Development Integration

### Build Process
The CEM generation is integrated into the docs build process:

```json
{
  "scripts": {
    "build:cem": "cem analyze --config custom-elements-manifest.config.js",
    "build:docs": "... && bun run build:cem"
  }
}
```

### IDE Support
Generated manifests enable:
- Auto-completion for component properties
- Type checking in HTML templates
- Documentation tooltips
- Property validation

## Troubleshooting

### Missing Components
If components aren't appearing in manifests:
1. Ensure they use the `component()` function
2. Check that files are in `docs-src/components/*/`
3. Verify TypeScript compilation succeeds

### Incorrect Property Types
If property types are wrong:
1. Add explicit TypeScript types to property interfaces
2. Use proper JSDoc comments
3. Ensure parser/extractor functions are recognized

### Performance Issues
For large codebases:
1. Use specific glob patterns to limit scope
2. Disable debug mode in production
3. Consider excluding test files

## Related Tools

The generated manifests work with:
- [Custom Elements Language Server](https://github.com/runem/web-component-analyzer)
- [VS Code Lit Plugin](https://marketplace.visualstudio.com/items?itemName=runem.lit-plugin)
- [Web Components Analyzer](https://github.com/runem/web-component-analyzer)
- Documentation generators and API tools

## Future Enhancements

Planned improvements:
- Event extraction from setup functions
- Slot discovery and documentation
- CSS custom property detection
- CSS part analysis
- Advanced JSDoc pattern recognition
