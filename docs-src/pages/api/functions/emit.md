[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / emit

# Function: emit()

> **emit**\<`T`, `P`, `E`\>(`type`, `reactive`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:617](https://github.com/zeixcom/ui-element/blob/dca68975dbf6990768dc34ee0f32fba5091cee2d/src/lib/effects.ts#L617)

Effect for emitting custom events with reactive detail values.
Creates and dispatches CustomEvent instances with bubbling enabled by default.

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

### reactive

[`Reactive`](../type-aliases/Reactive.md)\<`T`, `P`, `E`\>

Reactive value bound to the event detail

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Effect function that emits custom events

## Since

0.13.2
