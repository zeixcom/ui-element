[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / reduced

# Function: reduced()

> **reduced**\<`T`, `E`, `C`, `S`\>(`host`, `selector`, `reducer`, `initialValue`): [`Computed`](../type-aliases/Computed.md)\<`T`\>

Defined in: [src/core/dom.ts:319](https://github.com/zeixcom/ui-element/blob/f5c20c5e6da1a988462bc7f68d75f2a4c0200046/src/core/dom.ts#L319)

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
