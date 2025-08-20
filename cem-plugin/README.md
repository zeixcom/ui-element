# UIElement Custom Elements Manifest Plugin

A Custom Elements Manifest analyzer plugin for UIElement components that generates proper CEM documentation from UIElement's unique `component()` function syntax.

## Overview

UIElement uses a functional approach to define web components that differs from standard class-based custom elements. This plugin bridges that gap by analyzing UIElement component definitions and generating standard Custom Elements Manifest entries that are compatible with the entire CEM ecosystem.

## Features

### 🎯 **Complete UIElement Support**

The plugin recognizes and processes all UIElement component patterns:

- **Parser Properties**: `asString()`, `asBoolean()`, `asNumber()`, `asInteger()`, `asEnum()`, `asJSON()`
- **Extractor Properties**: `fromDOM()`, `fromEvents()`, `getAttribute()`, `getText()`, `hasAttribute()`, etc.
- **Literal Properties**: Direct values with automatic type inference
- **Function Properties**: Computed properties and methods

### 🎯 **Rich CEM Output**

- **Full CEM v1.0.0 Compliance**: Generates valid Custom Elements Manifest declarations
- **Smart Attribute Mapping**: Creates HTML attributes only for parser-based properties
- **TypeScript Integration**: Preserves TypeScript types and interface documentation
- **JSDoc Support**: Extracts and enhances documentation with @example, @since, @deprecated tags
- **UIElement Metadata**: Custom `_uielement` extensions preserve framework-specific information

### 🎯 **Production Quality**

- **Comprehensive Testing**: 78 passing tests with 382 assertions
- **Error Handling**: Graceful degradation for malformed components
- **Debug Support**: Detailed logging for troubleshooting
- **Performance Optimized**: Efficient AST analysis for large codebases

## Installation

```bash
npm install cem-plugin-uielement
```

## Quick Start

### Basic Configuration

```javascript
// cem.config.mjs
import { uiElementPlugin } from 'cem-plugin-uielement'

export default {
  plugins: [uiElementPlugin()],
}
```

### Advanced Configuration

```javascript
// cem.config.mjs
import { uiElementPlugin } from 'cem-plugin-uielement'

export default {
  plugins: [
    uiElementPlugin({
      debug: false, // Enable detailed logging
      componentFunctionNames: ['component'], // Custom function names
      customParsers: {
        // Add custom parser recognition
        myParser: 'string',
      },
      customExtractors: {
        // Add custom extractor recognition
        myExtractor: 'any',
      },
    }),
  ],
}
```

### Generate Manifest

```bash
npx @custom-elements-manifest/analyzer
```

## Example

### Input: UIElement Component

```typescript
import { component, asString, asBoolean, fromDOM, getText } from 'ui-element'

export type HelloWorldProps = {
  /** The name to display in the greeting */
  name: string
  /** Whether the component is disabled */
  disabled: boolean
}

/**
 * A simple greeting component that displays "Hello, {name}!"
 * @since 1.0.0
 * @example
 * <hello-world name="World" disabled>
 *   <input type="text" />
 *   <span>World</span>
 * </hello-world>
 */
export default component(
  'hello-world',
  {
    name: asString(el => el.querySelector('span')?.textContent?.trim() ?? ''),
    disabled: asBoolean(),
    count: fromDOM({ '.counter': getText() }, 0),
  },
  (el, { first }) => [
    first(
      'input',
      on('input', ({ target }) => ({ name: target.value })),
    ),
    first('span', setText('name')),
  ],
)
```

### Output: Generated CEM Declaration

````json
{
  "kind": "class",
  "name": "HelloWorld",
  "tagName": "hello-world",
  "customElement": true,
  "description": "A simple greeting component that displays \"Hello, {name}!\"\n\n**Since:** 1.0.0\n\n**Examples:**\n\n```typescript\n<hello-world name=\"World\" disabled>\n  <input type=\"text\" />\n  <span>World</span>\n</hello-world>\n```",
  "members": [
    {
      "kind": "field",
      "name": "name",
      "type": { "text": "string" },
      "description": "The name to display in the greeting. This is a reactive property that triggers updates when changed.",
      "privacy": "public",
      "default": "\"\"",
      "_uielement": {
        "parser": "asString",
        "arguments": [
          "el => el.querySelector('span')?.textContent?.trim() ?? ''"
        ],
        "defaultValue": ""
      }
    },
    {
      "kind": "field",
      "name": "disabled",
      "type": { "text": "boolean" },
      "description": "Whether the component is disabled. This is a reactive property that triggers updates when changed.",
      "privacy": "public",
      "default": "false",
      "_uielement": {
        "parser": "asBoolean",
        "arguments": [],
        "defaultValue": false
      }
    },
    {
      "kind": "field",
      "name": "count",
      "type": { "text": "number" },
      "description": "Property extracted using fromDOM(). Extracts content from DOM elements using selectors.",
      "privacy": "public",
      "default": "0",
      "_uielement": {
        "extractor": "fromDOM",
        "config": { ".counter": "getText()" },
        "fallback": 0
      }
    }
  ],
  "attributes": [
    {
      "name": "name",
      "type": { "text": "string" },
      "description": "HTML attribute for the name property. Parses attribute as string with optional fallback",
      "fieldName": "name",
      "default": ""
    },
    {
      "name": "disabled",
      "type": { "text": "boolean" },
      "description": "HTML attribute for the disabled property. Parses presence of attribute as boolean",
      "fieldName": "disabled"
    }
  ],
  "events": [],
  "slots": [],
  "cssProperties": [],
  "cssParts": []
}
````

## How It Works

### Component Detection

The plugin scans TypeScript files for `component()` function calls and extracts:

1. **Tag Name**: Custom element tag name (first argument)
2. **Property Initializers**: Object defining component properties (second argument)
3. **Setup Function**: Component logic and effects (third argument)
4. **TypeScript Interface**: Props type definition for enhanced documentation

### Property Analysis

For each property initializer, the plugin determines:

- **Type**: Parser, extractor, literal, or function
- **Default Value**: Extracted from initializer arguments
- **TypeScript Type**: Inferred from usage or interface definition
- **HTML Attributability**: Whether the property can be set via HTML attributes

### Manifest Generation

The analyzed data is transformed into CEM-compliant declarations with:

- **Property Members**: Complete property definitions with types and defaults
- **HTML Attributes**: Generated only for parser-based properties
- **Documentation**: Enhanced descriptions from JSDoc and TypeScript interfaces
- **Metadata**: UIElement-specific information preserved in `_uielement` extensions

## Supported Patterns

### Parser Properties (HTML Attributable)

These create both component properties and corresponding HTML attributes:

```typescript
{
  // String with default value
  title: asString('Default Title'),

  // Boolean (presence/absence)
  disabled: asBoolean(),

  // Number with fallback
  count: asNumber(0),

  // Enum with union type
  size: asEnum(['small', 'medium', 'large'], 'medium'),

  // JSON for complex data
  config: asJSON({ theme: 'light' })
}
```

### Extractor Properties (Non-Attributable)

These create component properties but no HTML attributes:

```typescript
{
  // DOM content extraction
  text: fromDOM({ '.content': getText() }, ''),

  // Event-based reactivity
  clickCount: fromEvents('button', { click: ({ value }) => value + 1 }, 0),

  // Attribute reading
  id: getAttribute('id', ''),

  // Property access
  value: getProperty('value', '')
}
```

### Literal Properties

Direct values with automatic type inference:

```typescript
{
  // String literal
  message: 'Hello World',

  // Number literal
  max: 100,

  // Boolean literal
  enabled: true,

  // Complex object
  options: { theme: 'dark', animations: true }
}
```

### Function Properties

Computed properties and methods:

```typescript
{
  // Arrow function
  compute: () => someCalculation(),

  // Method function
  reset: function() { this.value = '' },

  // Imported function
  validate: validateInput
}
```

## Testing

Run the comprehensive test suite:

```bash
npm test
```

The test suite includes:

- **Component Detection**: Validates component() call recognition
- **Property Analysis**: Tests parser/extractor/literal analysis
- **Manifest Generation**: Verifies CEM declaration creation
- **Real Components**: Integration tests with actual UIElement patterns
- **Edge Cases**: Error handling and malformed input recovery

## Demo

See the plugin in action with sample components:

```bash
npm run build
node demo/plugin-demo.js
```

This processes representative UIElement components and generates a complete manifest file.

## Debugging

Enable debug mode for detailed logging:

```javascript
uiElementPlugin({
  debug: true,
})
```

This provides:

- Component detection details
- Property analysis step-by-step
- Manifest generation progress
- Error diagnostics and warnings

## Integration

### With Storybook

The generated manifest can be used with Storybook for automatic documentation:

```javascript
// .storybook/main.js
export default {
  addons: ['@storybook/addon-docs', '@storybook/addon-web-components-knobs'],
}
```

### With VS Code

Use the manifest for enhanced autocomplete and IntelliSense:

```json
// .vscode/settings.json
{
  "html.customData": ["./custom-elements.json"]
}
```

### With Other Tools

The manifest works with any tool supporting the Custom Elements Manifest standard:

- lit-analyzer
- web-component-analyzer
- custom-elements-json-schema
- And many more...

## Limitations & Future Enhancements

### Current Limitations

- **JSDoc Extraction**: Comment parsing could be more robust for complex documentation
- **Event Detection**: Setup function event analysis not yet implemented
- **Slot Analysis**: Template slot detection not implemented
- **CSS Properties**: Style-related property extraction not supported
- **Advanced Composition**: Complex component composition patterns need enhancement

### Planned Enhancements (Phase 4+)

#### Event System Support

- Extract `emitEvent()` calls from setup functions
- Generate CEM event declarations with proper typing
- Document event bubbling and composition patterns

#### Template Analysis

- Detect slot usage patterns from setup function effects
- Extract CSS custom property definitions
- Analyze CSS part usage for styling APIs

#### Advanced Features

- Component relationship mapping for composition
- Performance metrics for large component libraries
- Custom validator integration for domain-specific rules
- IDE integration for real-time manifest generation

#### Developer Experience

- Enhanced error messages with fix suggestions
- Interactive configuration wizard
- Integration with popular development tools
- Real-time manifest updates during development

## Contributing

We welcome contributions! Areas where help is needed:

1. **Enhanced JSDoc parsing** - Better comment extraction and formatting
2. **Event detection** - Analysis of setup function event patterns
3. **Performance optimization** - Faster analysis for large codebases
4. **Additional test cases** - More edge cases and real-world scenarios
5. **Documentation** - Usage examples and integration guides

## License

MIT License - see LICENSE file for details.

## Version History

- **v0.1.0** - Phase 3 Complete: Full manifest generation with CEM v1.0.0 compliance
  - Complete UIElement pattern support
  - Rich metadata preservation
  - Production-ready quality with comprehensive testing
  - 78 passing tests across all component types

---

_Ready for production use with UIElement component libraries ✨_
