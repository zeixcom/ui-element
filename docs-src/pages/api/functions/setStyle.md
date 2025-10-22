[**@zeix/le-truc**](../README.md)

---

[@zeix/le-truc](../globals.md) / setStyle

# Function: setStyle()

> **setStyle**\<`P`, `E`\>(`prop`, `reactive`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:467](https://github.com/zeixcom/le-truc/blob/a2e3a5bb1b7ab9e964c80c41c9edbb895cf2ce79/src/lib/effects.ts#L467)

Effect for setting a CSS style property on an element.
Sets the specified style property with support for deletion via UNSET.

## Type Parameters

### P

`P` _extends_ [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` _extends_ `HTMLElement` \| `SVGElement` \| `MathMLElement` = `HTMLElement`

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
