[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / toggleAttribute

# Function: toggleAttribute()

> **toggleAttribute**\<`P`, `E`\>(`name`, `reactive`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:468](https://github.com/zeixcom/ui-element/blob/d13febaf363936558771161c1c4f66e2034f5ec3/src/lib/effects.ts#L468)

Effect for toggling a boolean attribute on an element.
When the reactive value is true, the attribute is present; when false, it's absent.

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### name

`string`

Name of the attribute to toggle

### reactive

[`Reactive`](../type-aliases/Reactive.md)\<`boolean`, `P`, `E`\> = `name`

Reactive value bound to the attribute presence (defaults to attribute name)

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Effect function that toggles the attribute on the element

## Since

0.8.0
