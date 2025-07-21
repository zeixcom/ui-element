[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / show

# Function: show()

> **show**\<`P`, `E`\>(`reactive`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:426](https://github.com/efflore/ui-element/blob/6f13c4cee43b2a37b146c096e1a255409b73e79b/src/lib/effects.ts#L426)

Effect for controlling element visibility by setting the 'hidden' property.
When the reactive value is true, the element is shown; when false, it's hidden.

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `HTMLElement` = `HTMLElement`

## Parameters

### reactive

[`Reactive`](../type-aliases/Reactive.md)\<`boolean`, `P`, `E`\>

Reactive value bound to the visibility state

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Effect function that controls element visibility

## Since

0.13.1
