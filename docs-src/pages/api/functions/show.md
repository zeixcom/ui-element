[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / show

# Function: show()

> **show**\<`P`, `E`\>(`reactive`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:357](https://github.com/zeixcom/ui-element/blob/116b3ce1e8d574ad7f9a1b5bbb952ce797a0b15a/src/lib/effects.ts#L357)

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
