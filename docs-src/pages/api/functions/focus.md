[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / focus

# Function: focus()

> **focus**\<`P`, `E`\>(`reactive`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:475](https://github.com/zeixcom/ui-element/blob/e1c0693393151dbc67087d7dde9d2a2f9e7dd58b/src/lib/effects.ts#L475)

Effect for controlling element focus by calling the 'focus()' method.
If the reactive value is true, element will be focussed; when false, nothing happens.

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `HTMLElement` = `HTMLElement`

## Parameters

### reactive

[`Reactive`](../type-aliases/Reactive.md)\<`boolean`, `P`, `E`\>

Reactive value bound to the focus state

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Effect function that sets element focus

## Since

0.13.3
