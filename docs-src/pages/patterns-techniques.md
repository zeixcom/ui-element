---
title: 'Patterns & Techniques'
emoji: '💡'
description: 'Advanced patterns, testing strategies, and best practices'
---

<section class="hero">

# 💡 Patterns & Techniques

<p class="lead"><strong>Master advanced UIElement patterns and best practices.</strong> Learn how to build maintainable, testable components, handle complex state scenarios, and integrate with modern development workflows.</p>
</section>

<section>

## Advanced Component Patterns

### Composite Components

Build complex UIs by composing multiple focused components:

```js
// Parent component coordinates children
component(
  'data-table',
  {
    data: asJSON([]),
    sortBy: asString(''),
    sortOrder: asString('asc'),
  },
  (el, { first, all }) => [
    // Pass configuration to header
    first(
      'table-header',
      pass({
        sortBy: 'sortBy',
        sortOrder: 'sortOrder',
      }),
    ),

    // Listen for sort changes
    first(
      'table-header',
      on('sort', e => {
        el.sortBy = e.detail.column
        el.sortOrder = e.detail.order
      }),
    ),

    // Pass sorted data to body
    first(
      'table-body',
      pass({
        data: () => sortData(el.data, el.sortBy, el.sortOrder),
      }),
    ),
  ],
)

// Focused child components
component(
  'table-header',
  {
    sortBy: asString(''),
    sortOrder: asString('asc'),
  },
  (el, { all }) => [
    all(
      '[data-column]',
      toogleClass('sorted', th => th.dataset.column === el.sortBy),
      setAttribute('aria-sort', th => {
        if (th.dataset.column !== el.sortBy) return 'none'
        return el.sortOrder === 'asc' ? 'ascending' : 'descending'
      }),
      on('click', e => {
        const column = e.target.dataset.column
        const newOrder =
          el.sortBy === column && el.sortOrder === 'asc' ? 'desc' : 'asc'
        el.dispatchEvent(
          new CustomEvent('sort', {
            detail: { column, order: newOrder },
          }),
        )
      }),
    ),
  ],
)
```

### State Machine Pattern

Implement complex component states using local signals:

```js
component(
  'upload-zone',
  {
    files: asJSON([]),
  },
  (el, { first }) => {
    // State machine with local signals
    const state = signal('idle') // idle, dragover, uploading, success, error
    const progress = signal(0)
    const error = signal('')

    const states = {
      idle: () => ({
        canDrop: true,
        showProgress: false,
        showError: false,
      }),
      dragover: () => ({
        canDrop: true,
        showProgress: false,
        showError: false,
      }),
      uploading: () => ({
        canDrop: false,
        showProgress: true,
        showError: false,
      }),
      success: () => ({
        canDrop: true,
        showProgress: false,
        showError: false,
      }),
      error: () => ({
        canDrop: true,
        showProgress: false,
        showError: true,
      }),
    }

    const currentState = () => states[state()]()

    return [
      first(
        '.drop-zone',
        toogleClass('idle', () => state() === 'idle'),
        toogleClass('dragover', () => state() === 'dragover'),
        toogleClass('uploading', () => state() === 'uploading'),
        toogleClass('success', () => state() === 'success'),
        toogleClass('error', () => state() === 'error'),

        on('dragenter', e => {
          e.preventDefault()
          if (currentState().canDrop) state.set('dragover')
        }),

        on('dragleave', () => {
          state.set('idle')
        }),

        on('drop', async e => {
          e.preventDefault()
          if (!currentState().canDrop) return

          state.set('uploading')
          progress.set(0)

          try {
            const files = Array.from(e.dataTransfer.files)
            for (let i = 0; i < files.length; i++) {
              await uploadFile(files[i])
              progress.set(((i + 1) / files.length) * 100)
            }
            state.set('success')
            setTimeout(() => state.set('idle'), 2000)
          } catch (err) {
            state.set('error')
            error.set(err.message)
          }
        }),
      ),

      first(
        '.progress',
        setStyle('display', () =>
          currentState().showProgress ? 'block' : 'none',
        ),
        setStyle('width', () => `${progress()}%`),
      ),

      first(
        '.error',
        setStyle('display', () =>
          currentState().showError ? 'block' : 'none',
        ),
        setText(error),
      ),
    ]
  },
)
```

### Plugin Architecture

Create extensible components using composition:

```js
// Base editor component
component(
  'code-editor',
  {
    content: asString(''),
    language: asString('javascript'),
  },
  (el, { first }) => {
    const plugins = new Set()

    // Plugin registration API
    el.addPlugin = plugin => {
      plugins.add(plugin)
      plugin.init(el)
    }

    el.removePlugin = plugin => {
      plugin.destroy?.()
      plugins.delete(plugin)
    }

    return [
      first(
        '.editor',
        setText('content'),
        on('input', e => {
          el.content = e.target.value
          // Notify plugins
          plugins.forEach(plugin => plugin.onContentChange?.(el.content))
        }),
      ),
    ]
  },
)

// Syntax highlighting plugin
const syntaxHighlightPlugin = {
  init(editor) {
    this.highlight(editor.content)
  },

  onContentChange(content) {
    this.highlight(content)
  },

  highlight(content) {
    // Syntax highlighting logic
  },
}

// Line numbers plugin
const lineNumbersPlugin = {
  init(editor) {
    this.addLineNumbers(editor)
  },

  addLineNumbers(editor) {
    // Line number implementation
  },
}
```

</section>

<section>

## Testing Strategies

### Understanding UIElement's Timing

UIElement uses a scheduled effect system that impacts how you write tests:

```js
// ❌ Wrong: Expecting immediate DOM updates
it('updates count display', () => {
  const component = document.querySelector('counter')
  component.count = 5

  // This will fail - DOM not updated yet
  expect(component.querySelector('.count').textContent).toBe('5')
})

// ✅ Correct: Wait for scheduled effects
it('updates count display', async () => {
  const component = document.querySelector('counter')
  component.count = 5

  // Wait for effects to apply
  await new Promise(resolve => requestAnimationFrame(resolve))

  expect(component.querySelector('.count').textContent).toBe('5')
})
```

### Component State Isolation

Components maintain state between test runs, which can cause interference:

```js
// ❌ Tests can interfere with each other
describe('Counter Component', () => {
  it('starts at zero', () => {
    const counter = document.querySelector('my-counter')
    expect(counter.count).toBe(0)
  })

  it('increments when clicked', async () => {
    const counter = document.querySelector('my-counter')
    // This test might start with count=1 from previous test!
    counter.querySelector('button').click()
    await animationFrame()
    expect(counter.count).toBe(1) // Could be 2 if state persisted
  })
})

// ✅ Proper test isolation
describe('Counter Component', () => {
  let counter

  beforeEach(() => {
    // Create fresh component for each test
    document.body.innerHTML = `
            <my-counter data-test="${Date.now()}">
                <span class="count">0</span>
                <button>+</button>
            </my-counter>
        `
    counter = document.querySelector('my-counter')
  })

  afterEach(() => {
    // Clean up
    counter?.remove()
  })

  it('starts at zero', () => {
    expect(counter.count).toBe(0)
  })

  it('increments when clicked', async () => {
    counter.querySelector('button').click()
    await animationFrame()
    expect(counter.count).toBe(1)
  })
})

// Helper function for timing
const animationFrame = () =>
  new Promise(resolve => requestAnimationFrame(resolve))
```

### Testing Async Components

Components with async behavior need different timing strategies:

```js
// Component with async initialization
component(
  'data-loader',
  {
    data: asJSON(null),
    loading: asBoolean(false),
    error: asString(''),
  },
  (el, { first }) => [
    // Async initialization
    () => {
      const loadData = async () => {
        el.loading = true
        try {
          const response = await fetch(el.getAttribute('src'))
          el.data = await response.json()
        } catch (err) {
          el.error = err.message
        } finally {
          el.loading = false
        }
      }

      // Start loading when component mounts
      setTimeout(loadData, 100)
    },

    first(
      '.loading',
      setStyle('display', () => (el.loading ? 'block' : 'none')),
    ),
    first('.error', setText('error')),
    first(
      '.content',
      setText(() => JSON.stringify(el.data)),
    ),
  ],
)

// Test async component
it('loads data on mount', async () => {
  // Mock fetch
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ message: 'Hello' }),
    }),
  )

  document.body.innerHTML = '<data-loader src="/api/data"></data-loader>'
  const loader = document.querySelector('data-loader')

  // Wait for async initialization
  await new Promise(resolve => setTimeout(resolve, 150))
  await animationFrame()

  expect(loader.data).toEqual({ message: 'Hello' })
  expect(loader.loading).toBe(false)
})
```

### Mocking Browser APIs

Many components interact with browser APIs that need careful mocking:

```js
// Component using clipboard API
component(
  'copy-button',
  {
    text: asString(''),
  },
  (el, { first }) => [
    first(
      'button',
      on('click', async () => {
        try {
          await navigator.clipboard.writeText(el.text)
          el.dispatchEvent(new CustomEvent('copied'))
        } catch (err) {
          el.dispatchEvent(
            new CustomEvent('copy-error', { detail: err.message }),
          )
        }
      }),
    ),
  ],
)

// Test with mocked clipboard
describe('Copy Button', () => {
  let originalWriteText
  let mockClipboard

  beforeEach(() => {
    // Store original and create mock
    originalWriteText = navigator.clipboard?.writeText
    mockClipboard = {
      lastWrittenText: null,
      shouldFail: false,
    }

    // Mock the writeText method
    if (navigator.clipboard) {
      navigator.clipboard.writeText = async text => {
        if (mockClipboard.shouldFail) {
          throw new Error('Clipboard write failed')
        }
        mockClipboard.lastWrittenText = text
        return Promise.resolve()
      }
    }
  })

  afterEach(() => {
    // Restore original
    if (navigator.clipboard && originalWriteText) {
      navigator.clipboard.writeText = originalWriteText
    }
  })

  it('copies text to clipboard', async () => {
    document.body.innerHTML =
      '<copy-button text="Hello World"><button>Copy</button></copy-button>'
    const button = document.querySelector('copy-button button')

    let copied = false
    document.querySelector('copy-button').addEventListener('copied', () => {
      copied = true
    })

    button.click()
    await animationFrame()

    expect(mockClipboard.lastWrittenText).toBe('Hello World')
    expect(copied).toBe(true)
  })
})
```

</section>

<section>

## Performance Optimization

### Efficient List Rendering

Handle large lists with virtual scrolling and efficient updates:

```js
component(
  'virtual-list',
  {
    items: asJSON([]),
    itemHeight: asInteger(50),
    visibleCount: asInteger(10),
  },
  (el, { first }) => {
    const scrollTop = signal(0)

    const visibleItems = () => {
      const start = Math.floor(scrollTop() / el.itemHeight)
      const end = Math.min(start + el.visibleCount, el.items.length)
      return el.items.slice(start, end).map((item, index) => ({
        ...item,
        index: start + index,
      }))
    }

    return [
      first(
        '.container',
        setStyle('height', () => `${el.visibleCount * el.itemHeight}px`),
        on('scroll', e => {
          scrollTop.set(e.target.scrollTop)
        }),
      ),

      first(
        '.content',
        setStyle('height', () => `${el.items.length * el.itemHeight}px`),
        setStyle(
          'paddingTop',
          () => `${Math.floor(scrollTop() / el.itemHeight) * el.itemHeight}px`,
        ),

        () => {
          const content = el.querySelector('.content')
          const update = () => {
            // Only render visible items
            content.innerHTML = visibleItems()
              .map(
                item =>
                  `<div class="item" style="height: ${el.itemHeight}px">${item.text}</div>`,
              )
              .join('')
          }
          update()
          return update
        },
      ),
    ]
  },
)
```

### Debounced Updates

Optimize expensive operations with debouncing:

```js
component(
  'search-input',
  {
    query: asString(''),
    results: asJSON([]),
  },
  (el, { first }) => {
    let searchTimeout

    const debouncedSearch = query => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(async () => {
        if (query.trim()) {
          const response = await fetch(
            `/api/search?q=${encodeURIComponent(query)}`,
          )
          el.results = await response.json()
        } else {
          el.results = []
        }
      }, 300)
    }

    return [
      first(
        'input',
        setProperty('value', 'query'),
        on('input', e => {
          el.query = e.target.value
          debouncedSearch(el.query)
        }),
      ),

      first('.results', () => {
        const results = el.querySelector('.results')
        const update = () => {
          results.innerHTML = el.results
            .map(result => `<div class="result">${result.title}</div>`)
            .join('')
        }
        update()
        return update
      }),
    ]
  },
)
```

</section>

<section>

## Error Handling & Debugging

### Graceful Error Boundaries

Implement error handling patterns that don't break the entire application:

```js
component(
  'error-boundary',
  {
    hasError: asBoolean(false),
    errorMessage: asString(''),
  },
  (el, { first }) => {
    // Global error handler
    const handleError = error => {
      console.error('Component error:', error)
      el.hasError = true
      el.errorMessage = error.message || 'An unexpected error occurred'
    }

    // Catch errors in child components
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', e => {
      handleError(e.reason)
    })

    return [
      first(
        '.error-display',
        setStyle('display', () => (el.hasError ? 'block' : 'none')),
        setText('errorMessage'),
      ),

      first(
        '.content',
        setStyle('display', () => (el.hasError ? 'none' : 'block')),
      ),

      first(
        '.retry-button',
        setStyle('display', () => (el.hasError ? 'inline-block' : 'none')),
        on('click', () => {
          el.hasError = false
          el.errorMessage = ''
          // Trigger re-render of child components
          location.reload()
        }),
      ),

      // Cleanup
      () => {
        return () => {
          window.removeEventListener('error', handleError)
        }
      },
    ]
  },
)
```

### Development vs Production Patterns

Create components that behave differently in development:

```js
component(
  'dev-tools',
  {
    enabled: asBoolean(false),
  },
  (el, { first }) => {
    const isDev = process.env.NODE_ENV === 'development'

    if (!isDev) {
      // Hide in production
      el.style.display = 'none'
      return []
    }

    return [
      first(
        '.component-inspector',
        on('click', () => {
          // Show component state in console
          const components = document.querySelectorAll('[data-component]')
          components.forEach(comp => {
            console.log(comp.tagName, comp)
          })
        }),
      ),

      first(
        '.state-logger',
        on('click', () => {
          // Log all component states
          console.table(
            Array.from(document.querySelectorAll('*'))
              .filter(el => el.constructor.name !== 'HTMLElement')
              .map(comp => ({
                tag: comp.tagName.toLowerCase(),
                state: Object.keys(comp).reduce((acc, key) => {
                  if (typeof comp[key] !== 'function') {
                    acc[key] = comp[key]
                  }
                  return acc
                }, {}),
              })),
          )
        }),
      ),
    ]
  },
)
```

</section>

<section>

## Integration Patterns

### Working with CSS Frameworks

Integrate UIElement components with popular CSS frameworks:

```js
// Bootstrap integration
component(
  'bootstrap-modal',
  {
    visible: asBoolean(false),
    title: asString(''),
  },
  (el, { first }) => {
    let bootstrapModal

    return [
      // Initialize Bootstrap modal
      () => {
        if (typeof bootstrap !== 'undefined') {
          bootstrapModal = new bootstrap.Modal(el.querySelector('.modal'))

          // Sync UIElement state with Bootstrap events
          el.querySelector('.modal').addEventListener('shown.bs.modal', () => {
            el.visible = true
          })

          el.querySelector('.modal').addEventListener('hidden.bs.modal', () => {
            el.visible = false
          })
        }

        return () => {
          bootstrapModal?.dispose()
        }
      },

      // Sync visibility
      first('.modal', () => {
        const update = () => {
          if (bootstrapModal) {
            if (el.visible) {
              bootstrapModal.show()
            } else {
              bootstrapModal.hide()
            }
          }
        }
        update()
        return update
      }),

      first('.modal-title', setText('title')),
    ]
  },
)

// Tailwind CSS integration
component(
  'tailwind-toggle',
  {
    active: asBoolean(false),
  },
  (el, { first }) => [
    first(
      'button',
      // Dynamic Tailwind classes
      () => {
        const button = el.querySelector('button')
        const update = () => {
          button.className = el.active
            ? 'bg-blue-500 text-white px-4 py-2 rounded'
            : 'bg-gray-200 text-gray-800 px-4 py-2 rounded'
        }
        update()
        return update
      },

      on('click', () => {
        el.active = !el.active
      }),
    ),
  ],
)
```

### Server-Side Rendering (SSR)

Design components that work well with SSR:

```js
// SSR-friendly component
component(
  'ssr-component',
  {
    // Use RESET to preserve server-rendered content
    initialData: RESET,
    isClient: asBoolean(false),
  },
  (el, { first }) => [
    // Detect client-side hydration
    () => {
      // This runs only on the client
      el.isClient = true

      // Progressive enhancement
      if (typeof window !== 'undefined') {
        // Client-only features
        el.setupClientFeatures?.()
      }
    },

    first('.content', setText('initialData')),

    // Show client-only features
    first(
      '.interactive-features',
      setStyle('display', () => (el.isClient ? 'block' : 'none')),
    ),
  ],
)
```

</section>

<section>

## Best Practices Summary

### Component Design

- **Single Responsibility**: Each component should have one clear purpose
- **Composition over Configuration**: Build complex UIs by combining simple components
- **Progressive Enhancement**: Start with working HTML, enhance with JavaScript
- **Accessibility First**: Design for screen readers and keyboard navigation

### State Management

- **Use appropriate initialization**: Direct values, parsers, or RESET based on data source
- **Keep state minimal**: Only store what the component actually needs
- **Prefer derived state**: Calculate values from existing state when possible
- **Handle edge cases**: Validate inputs and provide fallbacks

### Performance

- **Batch updates**: Take advantage of UIElement's scheduled effect system
- **Debounce expensive operations**: Network requests, complex calculations
- **Virtual scrolling**: For large lists and data sets
- **Lazy loading**: Load components and data only when needed

### Testing

- **Account for timing**: Use `requestAnimationFrame` for effect scheduling
- **Isolate tests**: Reset component state between tests
- **Mock browser APIs**: Test components that use navigator, fetch, etc.
- **Test real behavior**: Focus on user interactions and outcomes

### Debugging

- **Use development tools**: Build debug-friendly components
- **Error boundaries**: Handle errors gracefully
- **Logging**: Provide meaningful error messages and state information
- **Browser dev tools**: Leverage browser debugging capabilities

</section>

<section>

## Next Steps

With these patterns and techniques, you're equipped to build production-ready UIElement applications:

- **[Examples & Recipes](examples-recipes.html)** - See these patterns applied in real components
- **[Styling Components](styling-components.html)** - Professional styling approaches
- **[Component Communication](component-communication.html)** - Advanced component coordination

</section>
