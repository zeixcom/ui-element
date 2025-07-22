[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / read

# Function: read()

> **read**\<`T`, `E`, `C`, `S`\>(`host`, `selector`, `fn`): [`Computed`](../type-aliases/Computed.md)\<`T`\>

Defined in: [src/core/dom.ts:336](https://github.com/zeixcom/ui-element/blob/62aded0dfd41b132db684ccc25a7494068f0d957/src/core/dom.ts#L336)

Read from a descendant element and map the result

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

Host element

### selector

`S`

CSS selector for descendant element

### fn

(`element`) => `T`

Function to map over the element

## Returns

[`Computed`](../type-aliases/Computed.md)\<`T`\>

A computed signal of the mapped result from the descendant element

## Since

0.13.4
