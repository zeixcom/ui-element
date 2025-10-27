[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / asString

# Function: asString()

> **asString**\<`E`\>(`fallback?`): [`Parser`](../type-aliases/Parser.md)\<`string`, `E`\>

Defined in: [src/lib/parsers.ts:79](https://github.com/zeixcom/ui-element/blob/e2d0534c92417874d64304e2f9afb7062e5cf6fa/src/lib/parsers.ts#L79)

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
