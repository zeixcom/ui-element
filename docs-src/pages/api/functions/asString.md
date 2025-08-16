[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / asString

# Function: asString()

> **asString**\<`E`\>(`fallback?`): [`Parser`](../type-aliases/Parser.md)\<`string`, `E`\>

Defined in: [src/lib/parsers.ts:79](https://github.com/zeixcom/ui-element/blob/bee447e049cdd5cefc5eb0bcaa9adbe956d6b5a4/src/lib/parsers.ts#L79)

Parse a string as a string with a fallback

## Type Parameters

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### fallback?

[`Fallback`](../type-aliases/Fallback.md)\<`string`, `E`\> = `''`

Fallback value or extractor function

## Returns

[`Parser`](../type-aliases/Parser.md)\<`string`, `E`\>

Parser function

## Since

0.11.0
