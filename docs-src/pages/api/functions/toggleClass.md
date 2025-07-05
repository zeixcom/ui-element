[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / toggleClass

# Function: toggleClass()

> **toggleClass**\<`P`, `E`\>(`token`, `s`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:418](https://github.com/zeixcom/ui-element/blob/0678e2841dfcc123c324a841983e7a648bd2315e/src/lib/effects.ts#L418)

Toggle a classList token of an element

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### token

`string`

Class token to be toggled

### s

[`Reactive`](../type-aliases/Reactive.md)\<`boolean`, `P`, `E`\> = `token`

Reactive bound to the class existence

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

An effect function that toggles the classList token of the element

## Since

0.8.0
