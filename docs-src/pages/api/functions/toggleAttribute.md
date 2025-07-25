[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / toggleAttribute

# Function: toggleAttribute()

> **toggleAttribute**\<`P`, `E`\>(`name`, `reactive`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:525](https://github.com/zeixcom/ui-element/blob/297c0e8e040b3880ad85a2bc873523a8086f09a3/src/lib/effects.ts#L525)

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
