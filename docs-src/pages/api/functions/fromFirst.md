[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromFirst

# Function: fromFirst()

> **fromFirst**\<`T`, `E`, `C`, `S`\>(`selector`, ...`extractors`): [`LooseExtractor`](../type-aliases/LooseExtractor.md)\<`string` \| `T`, `C`\>

Defined in: [src/core/dom.ts:148](https://github.com/zeixcom/ui-element/blob/f5c20c5e6da1a988462bc7f68d75f2a4c0200046/src/core/dom.ts#L148)

Get a value from the first element matching a selector

## Type Parameters

### T

`T`

### E

`E` *extends* `Element` = `HTMLElement`

### C

`C` *extends* `HTMLElement` = `HTMLElement`

### S

`S` *extends* `string` = `string`

## Parameters

### selector

`S`

Selector to match

### extractors

...[`LooseExtractor`](../type-aliases/LooseExtractor.md)\<`string` \| `T`, [`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`, `E`\>\>[]

Extractor functions to apply to the element

## Returns

[`LooseExtractor`](../type-aliases/LooseExtractor.md)\<`string` \| `T`, `C`\>

Loose extractor function to apply to the host element

## Since

0.13.4
