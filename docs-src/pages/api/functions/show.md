[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / show

# Function: show()

> **show**\<`P`, `E`\>(`reactive`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:321](https://github.com/zeixcom/ui-element/blob/b9ddf83c928c93d84a49a796a2342da755e4896e/src/lib/effects.ts#L321)

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
