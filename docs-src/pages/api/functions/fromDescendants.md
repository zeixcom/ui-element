[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromDescendants

# Function: fromDescendants()

> **fromDescendants**\<`T`, `E`\>(`selectors`, `reducer`, `initialValue`): [`SignalProducer`](../type-aliases/SignalProducer.md)\<`T`\>

Defined in: [src/core/dom.ts:273](https://github.com/zeixcom/ui-element/blob/fbfc14f2b364007b204dfef842cb4c272bdfad41/src/core/dom.ts#L273)

Produce a computed signal from reduced properties of descendant elements

## Type Parameters

### T

`T` *extends* `object`

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### selectors

`string`

CSS selector for descendant elements

### reducer

(`accumulator`, `currentElement`, `currentIndex`, `array`) => `T`

function to reduce values

### initialValue

`T`

initial value for reduction

## Returns

[`SignalProducer`](../type-aliases/SignalProducer.md)\<`T`\>

signal producer that emits reduced value

## Since

0.13.1
