[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / setStyle

# Function: setStyle()

> **setStyle**\<`P`, `E`\>(`prop`, `s`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:439](https://github.com/zeixcom/ui-element/blob/0678e2841dfcc123c324a841983e7a648bd2315e/src/lib/effects.ts#L439)

Set a style property of an element

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `HTMLElement` \| `SVGElement` \| `MathMLElement`

## Parameters

### prop

`string`

Name of style property to be set

### s

[`Reactive`](../type-aliases/Reactive.md)\<`string`, `P`, `E`\> = `prop`

Reactive bound to the style property value

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

An effect function that sets the style property of the element

## Since

0.8.0
