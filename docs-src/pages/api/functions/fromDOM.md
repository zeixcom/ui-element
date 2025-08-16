[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromDOM

# Function: fromDOM()

> **fromDOM**\<`T`, `C`, `S`\>(`extractors`, `fallback`): [`Extractor`](../type-aliases/Extractor.md)\<`T`, `C`\>

Defined in: [src/core/dom.ts:186](https://github.com/zeixcom/ui-element/blob/3ce60a1d02c8c6608b1b8d191cd2a6123bdc0b3a/src/core/dom.ts#L186)

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
