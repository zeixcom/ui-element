[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / reduced

# Function: reduced()

> **reduced**\<`T`, `E`, `C`, `S`\>(`host`, `selector`, `reducer`, `initialValue`): [`Computed`](../type-aliases/Computed.md)\<`T`\>

Defined in: [src/core/dom.ts:308](https://github.com/zeixcom/ui-element/blob/297c0e8e040b3880ad85a2bc873523a8086f09a3/src/core/dom.ts#L308)

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
