[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / setStyle

# Function: setStyle()

> **setStyle**\<`P`, `E`\>(`prop`, `s`): [`FxFunction`](../type-aliases/FxFunction.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:422](https://github.com/zeixcom/ui-element/blob/fbfc14f2b364007b204dfef842cb4c272bdfad41/src/lib/effects.ts#L422)

Set a style property of an element

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `HTMLElement` \| `SVGElement` \| `MathMLElement`

## Parameters

### prop

`string`

name of style property to be set

### s

[`SignalLike`](../type-aliases/SignalLike.md)\<`P`, `string`, `E`\> = `prop`

state bound to the style property value

## Returns

[`FxFunction`](../type-aliases/FxFunction.md)\<`P`, `E`\>

## Since

0.8.0
