[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / setAttribute

# Function: setAttribute()

> **setAttribute**\<`P`, `E`\>(`name`, `s`): [`FxFunction`](../type-aliases/FxFunction.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:353](https://github.com/zeixcom/ui-element/blob/8a5f554f7f150bc30f3cc67f612a4c3067704cb6/src/lib/effects.ts#L353)

Set attribute of an element

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### name

`string`

name of attribute to be set

### s

[`SignalLike`](../type-aliases/SignalLike.md)\<`P`, `string`, `E`\> = `name`

state bound to the attribute value

## Returns

[`FxFunction`](../type-aliases/FxFunction.md)\<`P`, `E`\>

## Since

0.8.0
