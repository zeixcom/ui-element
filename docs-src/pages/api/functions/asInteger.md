[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / asInteger

# Function: asInteger()

> **asInteger**\<`E`\>(`fallback?`): [`Parser`](../type-aliases/Parser.md)\<`number`, `E`\>

Defined in: [src/lib/parsers.ts:36](https://github.com/zeixcom/ui-element/blob/230cd6cc9b2252d1741350e7be8be3e04b6f2cf4/src/lib/parsers.ts#L36)

Parse a string as a number forced to integer with a fallback

Supports hexadecimal and scientific notation

## Type Parameters

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### fallback?

[`Fallback`](../type-aliases/Fallback.md)\<`number`, `E`\> = `0`

Fallback value or extractor function

## Returns

[`Parser`](../type-aliases/Parser.md)\<`number`, `E`\>

Parser function

## Since

0.11.0
