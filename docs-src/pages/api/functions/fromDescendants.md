[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromDescendants

# Function: fromDescendants()

> **fromDescendants**\<`T`, `E`, `K`\>(`selectors`, `reducer`, `init`): [`SignalProducer`](../type-aliases/SignalProducer.md)\<`T`\>

Defined in: [src/core/dom.ts:234](https://github.com/zeixcom/ui-element/blob/dca68975dbf6990768dc34ee0f32fba5091cee2d/src/core/dom.ts#L234)

Produce a computed signal from reduced properties of descendant elements with type safety

## Type Parameters

### T

`T` *extends* `object`

### E

`E` *extends* `Element` = `HTMLElement`

### K

`K` *extends* `string` = `string`

## Parameters

### selectors

`K`

CSS selector for descendant elements

### reducer

(`accumulator`, `currentElement`, `currentIndex`, `array`) => `T`

function to reduce values

### init

initial value for reduction

`T` | (`host`) => `T`

## Returns

[`SignalProducer`](../type-aliases/SignalProducer.md)\<`T`\>

signal producer that emits reduced value

## Since

0.13.1

## Examples

```ts
// TypeScript knows each 'input' is HTMLInputElement
fromDescendants('input', (total, input) => total + input.value.length, 0)
```

```ts
// Works with UIElement components when properly declared
// declare global { interface HTMLElementTagNameMap { 'form-spinbutton': Component<FormSpinbuttonProps> } }
fromDescendants('form-spinbutton', (sum, item) => {
  // TypeScript knows item is Component<FormSpinbuttonProps>
  return sum + item.value // Access reactive property
}, 0)
```
