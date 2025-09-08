[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / asNumber

# Function: asNumber()

> **asNumber**\<`E`\>(`fallback?`): [`Parser`](../type-aliases/Parser.md)\<`number`, `E`\>

Defined in: [src/lib/parsers.ts:65](https://github.com/zeixcom/ui-element/blob/0d1d8bcd09361c4e51ed49d4aa52794efffd13c3/src/lib/parsers.ts#L65)

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
