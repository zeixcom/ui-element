[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / asInteger

# Function: asInteger()

> **asInteger**\<`E`\>(`fallback?`): [`Parser`](../type-aliases/Parser.md)\<`number`, `E`\>

Defined in: [src/lib/parsers.ts:36](https://github.com/zeixcom/ui-element/blob/2605753812ae73569ed9fdbb08b86e62a74ff14d/src/lib/parsers.ts#L36)

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
