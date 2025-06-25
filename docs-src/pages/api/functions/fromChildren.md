[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromChildren

# Function: fromChildren()

> **fromChildren**\<`T`, `E`\>(`selectors`, `reducer`, `initialValue`): [`SignalProducer`](../type-aliases/SignalProducer.md)\<`T`\>

Defined in: [src/core/dom.ts:273](https://github.com/zeixcom/ui-element/blob/a6fb4a88fd37bb5ca41823947687e8a37d5f2e08/src/core/dom.ts#L273)

Produce a computed signal from reduced properties of child elements

## Type Parameters

### T

`T` *extends* `object`

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### selectors

`string`

CSS selector for child elements

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
