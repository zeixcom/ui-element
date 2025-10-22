[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / toggleAttribute

# Function: toggleAttribute()

> **toggleAttribute**\<`P`, `E`\>(`name`, `reactive`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:420](https://github.com/zeixcom/ui-element/blob/b9ddf83c928c93d84a49a796a2342da755e4896e/src/lib/effects.ts#L420)

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
