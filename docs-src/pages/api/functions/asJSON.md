[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / asJSON

# Function: asJSON()

> **asJSON**\<`T`\>(`fallback`): [`AttributeParser`](../type-aliases/AttributeParser.md)\<`T`\>

Defined in: [src/lib/parsers.ts:106](https://github.com/zeixcom/ui-element/blob/6285025fa3b3778fb2f356dae80a5fa6250ac264/src/lib/parsers.ts#L106)

Parse an attribute as a JSON serialized object with a fallback

## Type Parameters

### T

`T` *extends* `object`

## Parameters

### fallback

`T`

fallback value

## Returns

[`AttributeParser`](../type-aliases/AttributeParser.md)\<`T`\>

parser function

## Since

0.11.0

## Throws

if the value and fallback are both null or undefined

## Throws

if the value is not a valid JSON object
