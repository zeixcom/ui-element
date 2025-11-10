[**@zeix/el-truco**](../README.md)

***

[@zeix/el-truco](../globals.md) / asInteger

# Function: asInteger()

> **asInteger**\<`E`\>(`fallback?`): [`Parser`](../type-aliases/Parser.md)\<`number`, `E`\>

Defined in: [src/lib/parsers.ts:36](https://github.com/zeixcom/ui-element/blob/a49c7d7fbed01d04dd21940c975f1839fc83bb07/src/lib/parsers.ts#L36)

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
