[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / toggleAttribute

# Function: toggleAttribute()

> **toggleAttribute**\<`P`, `E`\>(`name`, `s`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:394](https://github.com/zeixcom/ui-element/blob/0678e2841dfcc123c324a841983e7a648bd2315e/src/lib/effects.ts#L394)

Toggle a boolean attribute of an element

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### name

`string`

Name of attribute to be toggled

### s

[`Reactive`](../type-aliases/Reactive.md)\<`boolean`, `P`, `E`\> = `name`

Reactive bound to the attribute existence

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

An effect function that toggles the attribute of the element

## Since

0.8.0
