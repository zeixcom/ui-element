[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / asJSON

# Function: asJSON()

> **asJSON**\<`T`\>(`fallback`): [`AttributeParser`](../type-aliases/AttributeParser.md)\<`T`\>

Defined in: [src/lib/parsers.ts:104](https://github.com/zeixcom/ui-element/blob/dca68975dbf6990768dc34ee0f32fba5091cee2d/src/lib/parsers.ts#L104)

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
