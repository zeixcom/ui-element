[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromComponent

# Function: fromComponent()

> **fromComponent**\<`T`, `E`, `C`, `S`\>(`selector`, `extractor`, `fallback`): [`Extractor`](../type-aliases/Extractor.md)\<[`Computed`](../type-aliases/Computed.md)\<`T`\>, `C`\>

Defined in: [src/core/dom.ts:397](https://github.com/zeixcom/ui-element/blob/f5c20c5e6da1a988462bc7f68d75f2a4c0200046/src/core/dom.ts#L397)

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

### extractor

[`Extractor`](../type-aliases/Extractor.md)\<`T`, [`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`, `E`\>\>

### fallback

[`Fallback`](../type-aliases/Fallback.md)\<`T`\>

## Returns

[`Extractor`](../type-aliases/Extractor.md)\<[`Computed`](../type-aliases/Computed.md)\<`T`\>, `C`\>
