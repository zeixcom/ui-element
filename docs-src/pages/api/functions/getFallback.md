[**@zeix/el-truco**](../README.md)

***

[@zeix/el-truco](../globals.md) / getFallback

# Function: getFallback()

> **getFallback**\<`T`, `E`\>(`element`, `fallback`): `T`

Defined in: [src/core/dom.ts:174](https://github.com/zeixcom/ui-element/blob/8085b01c567eb5438a72e6d26eca9f9f0ad6e39f/src/core/dom.ts#L174)

Get a fallback value for an element

## Type Parameters

### T

`T` *extends* `object`

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### element

`E`

Element to get fallback value for

### fallback

[`ParserOrFallback`](../type-aliases/ParserOrFallback.md)\<`T`, `E`\>

Fallback value or parser function

## Returns

`T`

Fallback value or parsed value

## Since

0.14.0
