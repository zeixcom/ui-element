[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromDOM

# Function: fromDOM()

> **fromDOM**\<`T`, `C`, `S`\>(`fallback`, `extractors`): [`Extractor`](../type-aliases/Extractor.md)\<`T`, `C`\>

Defined in: [src/core/dom.ts:136](https://github.com/zeixcom/ui-element/blob/1e2981711e0b3b45697eacbe8601e2ce3440aa11/src/core/dom.ts#L136)

Get a value from elements in the DOM

## Type Parameters

### T

`T` *extends* `object`

### C

`C` *extends* `HTMLElement` = `HTMLElement`

### S

`S` *extends* \{ \[K in string\]: LooseExtractor\<string \| T, ElementFromSelector\<K\>\> \} = \{ \}

## Parameters

### fallback

[`ParserOrFallback`](../type-aliases/ParserOrFallback.md)\<`T`, `C`\>

Fallback value or parser function

### extractors

`S`

An object of extractor functions for selectors as keys to get a value from

## Returns

[`Extractor`](../type-aliases/Extractor.md)\<`T`, `C`\>

Loose extractor function to apply to the host element

## Since

0.14.0
