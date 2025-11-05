[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / asNumber

# Function: asNumber()

> **asNumber**\<`E`\>(`fallback?`): [`Parser`](../type-aliases/Parser.md)\<`number`, `E`\>

Defined in: [src/lib/parsers.ts:65](https://github.com/zeixcom/ui-element/blob/d3571cdc68e3e4116ef066c6fac00c4d1c8957d3/src/lib/parsers.ts#L65)

Parse a string as a number with a fallback

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
