[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromEvent

# Function: fromEvent()

> **fromEvent**\<`T`, `E`, `K`, `C`, `S`\>(`selector`, `type`, `transformer`, `init`, `options`): (`host`) => [`Computed`](../type-aliases/Computed.md)\<`T`\>

Defined in: [src/core/dom.ts:317](https://github.com/zeixcom/ui-element/blob/d13febaf363936558771161c1c4f66e2034f5ec3/src/core/dom.ts#L317)

Produce a computed signal from transformed event data

## Type Parameters

### T

`T` *extends* `object`

### E

`E` *extends* `HTMLElement` = `HTMLElement`

### K

`K` *extends* `string` = `string`

### C

`C` *extends* `HTMLElement` = `HTMLElement`

### S

`S` *extends* `string` = `string`

## Parameters

### selector

`S`

CSS selector for the source element

### type

`K`

Event type to listen for

### transformer

[`EventTransformer`](../type-aliases/EventTransformer.md)\<`T`, [`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`, `E`\>, `K`\>

Transformation function for the event

### init

Initial value or initializer function

`T` | (`host`) => `T`

### options

`boolean` | `AddEventListenerOptions`

## Returns

Signal producer for value from event

> (`host`): [`Computed`](../type-aliases/Computed.md)\<`T`\>

### Parameters

#### host

`C`

### Returns

[`Computed`](../type-aliases/Computed.md)\<`T`\>

## Since

0.13.2

## Examples

```ts
// Simple input value extraction
fromEvent('input', 'input', ({ source }) => source.value, '')
```

```ts
// Click counter using previous value
fromEvent('button', 'click', ({ value }) => value + 1, 0)
```

```ts
// Form submission with event handling
fromEvent('form', 'submit', ({ event, source }) => {
  event.preventDefault()
  return new FormData(source)
}, null)
```

```ts
// Complex logic using multiple context values
fromEvent('input', 'input', ({ event, source, value, host }) => {
  if (event.inputType === 'deleteContentBackward') {
    host.dispatchEvent(new CustomEvent('deletion'))
  }
  return source.value.length > value ? source.value : value
}, '')
```

```ts
// TypeScript automatically infers element types from selectors
fromEvent('input', 'input', ({ source }) => {
  return source.value.length // TypeScript knows source is HTMLInputElement
}, 0)
```

```ts
// Custom event handling with TypeScript declarations
// First, declare your custom events and components globally:
// declare global {
//   interface HTMLElementTagNameMap {
//     'my-component': Component<MyComponentProps>
//   }
//   interface HTMLElementEventMap {
//     itemAdded: CustomEvent<{ id: string; quantity: number }>
//   }
// }
fromEvent('my-component', 'itemAdded', ({ event, source }) => {
  // TypeScript knows source is Component<MyComponentProps> with UIElement methods
  const currentValue = source.getSignal('someProperty').get()
  return {
    id: source.dataset.id,
    quantity: event.detail.quantity, // TypeScript knows this is a number
    currentValue,
    timestamp: Date.now()
  }
}, null)
```
