[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / setAttribute

# Function: setAttribute()

> **setAttribute**\<`P`, `E`\>(`name`, `reactive`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:428](https://github.com/zeixcom/ui-element/blob/1c318eb583bce4633e1df4a42dee77859303e28e/src/lib/effects.ts#L428)

Effect for setting an attribute on an element.
Sets the specified attribute with security validation for unsafe values.

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### name

`string`

Name of the attribute to set

### reactive

[`Reactive`](../type-aliases/Reactive.md)\<`string`, `P`, `E`\> = `name`

Reactive value bound to the attribute value (defaults to attribute name)

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Effect function that sets the attribute on the element

## Since

0.8.0
