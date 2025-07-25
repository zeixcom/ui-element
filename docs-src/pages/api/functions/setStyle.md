[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / setStyle

# Function: setStyle()

> **setStyle**\<`P`, `E`\>(`prop`, `reactive`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:572](https://github.com/zeixcom/ui-element/blob/297c0e8e040b3880ad85a2bc873523a8086f09a3/src/lib/effects.ts#L572)

Effect for setting a CSS style property on an element.
Sets the specified style property with support for deletion via UNSET.

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `HTMLElement` \| `SVGElement` \| `MathMLElement`

## Parameters

### prop

`string`

Name of the CSS style property to set

### reactive

[`Reactive`](../type-aliases/Reactive.md)\<`string`, `P`, `E`\> = `prop`

Reactive value bound to the style property value (defaults to property name)

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Effect function that sets the style property on the element

## Since

0.8.0
