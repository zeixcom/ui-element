[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / reduced

# Function: reduced()

> **reduced**\<`T`, `E`, `C`, `S`\>(`host`, `selector`, `reducer`, `initialValue`): [`Computed`](../type-aliases/Computed.md)\<`T`\>

Defined in: [src/core/dom.ts:301](https://github.com/efflore/ui-element/blob/6f13c4cee43b2a37b146c096e1a255409b73e79b/src/core/dom.ts#L301)

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
