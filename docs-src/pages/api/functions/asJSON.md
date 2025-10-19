[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / asJSON

# Function: asJSON()

> **asJSON**\<`T`, `E`\>(`fallback`): [`Parser`](../type-aliases/Parser.md)\<`T`, `E`\>

Defined in: [src/lib/parsers.ts:111](https://github.com/zeixcom/ui-element/blob/661f034749e9d67cfb1d46cbacb8c3372af8ed61/src/lib/parsers.ts#L111)

Parse a string as a JSON serialized object with a fallback

## Type Parameters

### T

`T` *extends* `object`

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### fallback

[`Fallback`](../type-aliases/Fallback.md)\<`T`, `E`\>

Fallback value or extractor function

## Returns

[`Parser`](../type-aliases/Parser.md)\<`T`, `E`\>

Parser function

## Since

0.11.0

## Throws

If the value and fallback are both null or undefined

## Throws

If value is not a valid JSON string
