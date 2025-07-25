[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromDOM

# Function: fromDOM()

> **fromDOM**\<`T`, `E`, `C`, `S`\>(`fallback`, `extractors`): [`Extractor`](../type-aliases/Extractor.md)\<`T`, `C`\>

Defined in: [src/core/dom.ts:138](https://github.com/zeixcom/ui-element/blob/59d79a082870e892722e0aaa0f251617218ab48f/src/core/dom.ts#L138)

Get a value from elements in the DOM

## Type Parameters

### T

`T` *extends* `object`

### E

`E` *extends* `Element` = `HTMLElement`

### C

`C` *extends* `HTMLElement` = `HTMLElement`

### S

`S` *extends* \{ \[K in string\]: LooseExtractor\<string \| T, ElementFromSelector\<K, E\>\> \} = \{ \}

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
