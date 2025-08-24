[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / getFallback

# Function: getFallback()

> **getFallback**\<`T`, `E`\>(`element`, `fallback`): `T`

Defined in: [src/core/dom.ts:172](https://github.com/zeixcom/ui-element/blob/be16cef9b9f750168be795bfcb3a37afa34e2af7/src/core/dom.ts#L172)

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
