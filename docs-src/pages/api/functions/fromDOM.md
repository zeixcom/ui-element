[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / fromDOM

# Function: fromDOM()

> **fromDOM**\<`T`, `C`, `S`\>(`extractors`, `fallback`): [`Extractor`](../type-aliases/Extractor.md)\<`T`, `C`\>

Defined in: [src/core/dom.ts:188](https://github.com/zeixcom/ui-element/blob/95bb6f2fa5df3c16f08fcbbecd9622c693742c39/src/core/dom.ts#L188)

Get a value from elements in the DOM

## Type Parameters

### T

`T` *extends* `object`

### C

`C` *extends* `HTMLElement` = `HTMLElement`

### S

`S` *extends* \{ \[K in string\]: LooseExtractor\<string \| T, ElementFromSelector\<K\>\> \} = \{ \}

## Parameters

### extractors

`S`

An object of extractor functions for selectors as keys to get a value from

### fallback

[`ParserOrFallback`](../type-aliases/ParserOrFallback.md)\<`T`, `C`\>

Fallback value or parser function

## Returns

[`Extractor`](../type-aliases/Extractor.md)\<`T`, `C`\>

Loose extractor function to apply to the host element

## Since

0.14.0
