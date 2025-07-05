[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / emit

# Function: emit()

> **emit**\<`T`, `P`, `E`\>(`type`, `s`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:537](https://github.com/zeixcom/ui-element/blob/0678e2841dfcc123c324a841983e7a648bd2315e/src/lib/effects.ts#L537)

Emit a custom event with the given detail

## Type Parameters

### T

`T`

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### type

`string`

Event type to emit

### s

[`Reactive`](../type-aliases/Reactive.md)\<`T`, `P`, `E`\>

State bound to event detail

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Effect function

## Since

0.13.2
