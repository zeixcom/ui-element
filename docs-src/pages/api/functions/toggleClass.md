[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / toggleClass

# Function: toggleClass()

> **toggleClass**\<`P`, `E`\>(`token`, `reactive`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:549](https://github.com/zeixcom/ui-element/blob/e1c0693393151dbc67087d7dde9d2a2f9e7dd58b/src/lib/effects.ts#L549)

Effect for toggling a CSS class token on an element.
When the reactive value is true, the class is added; when false, it's removed.

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### token

`string`

CSS class token to toggle

### reactive

[`Reactive`](../type-aliases/Reactive.md)\<`boolean`, `P`, `E`\> = `token`

Reactive value bound to the class presence (defaults to class name)

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Effect function that toggles the class on the element

## Since

0.8.0
