[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromComponent

# Function: fromComponent()

> **fromComponent**\<`T`, `E`, `C`, `S`\>(`selector`, `extractor`, `required`): [`Extractor`](../type-aliases/Extractor.md)\<[`Computed`](../type-aliases/Computed.md)\<`T`\>, `C`\>

Defined in: [src/core/dom.ts:392](https://github.com/zeixcom/ui-element/blob/0e9cacf03a8f95418720628d5174fbb006152743/src/core/dom.ts#L392)

Create a computed signal from a required descendant component's property

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

### selector

`S`

Selector for the required descendant element

### extractor

[`Extractor`](../type-aliases/Extractor.md)\<`T`, [`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`, `E`\>\>

Function to extract the value from the element

### required

`string`

Explanation why the element is required

## Returns

[`Extractor`](../type-aliases/Extractor.md)\<[`Computed`](../type-aliases/Computed.md)\<`T`\>, `C`\>

Extractor that returns a computed signal that computes the value from the element

## Since

0.14.0

## Throws

If the element does not contain the required descendant element

## Throws

If the element is not a custom element
