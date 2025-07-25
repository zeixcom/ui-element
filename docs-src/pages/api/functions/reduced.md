[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / reduced

# Function: reduced()

> **reduced**\<`T`, `E`, `C`, `S`\>(`host`, `selector`, `reducer`, `initialValue`): [`Computed`](../type-aliases/Computed.md)\<`T`\>

Defined in: [src/core/dom.ts:293](https://github.com/zeixcom/ui-element/blob/59d79a082870e892722e0aaa0f251617218ab48f/src/core/dom.ts#L293)

Reduced properties of descendant elements

## Type Parameters

### T

`T` *extends* `object`

### E

`E` *extends* `Element` = `HTMLElement`

### C

`C` *extends* `HTMLElement` = `HTMLElement`

### S

`S` *extends* `string` = `string`

## Parameters

### host

`C`

Host element for computed property

### selector

`S`

CSS selector for descendant elements

### reducer

(`accumulator`, `currentElement`, `currentIndex`, `array`) => `T`

Function to reduce values

### initialValue

`T`

Initial value function for reduction

## Returns

[`Computed`](../type-aliases/Computed.md)\<`T`\>

Computed signal of reduced values of descendant elements

## Since

0.13.3
