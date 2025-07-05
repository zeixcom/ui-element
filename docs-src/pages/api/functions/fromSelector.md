[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromSelector

# Function: fromSelector()

> **fromSelector**\<`E`, `K`\>(`selectors`): [`SignalProducer`](../type-aliases/SignalProducer.md)\<[`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`K`, `E`\>[]\>

Defined in: [src/core/dom.ts:154](https://github.com/zeixcom/ui-element/blob/d13febaf363936558771161c1c4f66e2034f5ec3/src/core/dom.ts#L154)

Produce a selection signal from a selector with automatic type inference

## Type Parameters

### E

`E` *extends* `Element` = `HTMLElement`

### K

`K` *extends* `string` = `string`

## Parameters

### selectors

`K`

CSS selector for descendant elements

## Returns

[`SignalProducer`](../type-aliases/SignalProducer.md)\<[`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`K`, `E`\>[]\>

Signal producer for descendant element collection from a selector

## Since

0.13.1

## Examples

```ts
// TypeScript automatically infers HTMLInputElement[] for 'input' selector
const inputs = fromSelector('input')(host).get()
inputs[0].value // TypeScript knows this is valid
```

```ts
// Works with custom UIElement components when declared in HTMLElementTagNameMap
// declare global { interface HTMLElementTagNameMap { 'my-button': Component<MyButtonProps> } }
const buttons = fromSelector('my-button')(host).get()
buttons[0].getSignal('disabled').get() // Access UIElement component methods
```
