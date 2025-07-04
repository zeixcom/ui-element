[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / setStyle

# Function: setStyle()

> **setStyle**\<`P`, `E`\>(`prop`, `s`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:422](https://github.com/zeixcom/ui-element/blob/1b1fdfb1fc30e6d828e5489798acad1c8a45a5b4/src/lib/effects.ts#L422)

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

[`Reactive`](../type-aliases/Reactive.md)\<`string`, `P`, `E`\> = `prop`

state bound to the style property value

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

## Since

0.8.0
