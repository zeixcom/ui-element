[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / setAttribute

# Function: setAttribute()

> **setAttribute**\<`P`, `E`\>(`name`, `s`): [`FxFunction`](../type-aliases/FxFunction.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:353](https://github.com/zeixcom/ui-element/blob/fbfc14f2b364007b204dfef842cb4c272bdfad41/src/lib/effects.ts#L353)

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
