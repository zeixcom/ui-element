[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / emitEvent

# Function: emitEvent()

> **emitEvent**\<`T`, `P`, `E`\>(`type`, `reactive`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:670](https://github.com/zeixcom/ui-element/blob/297c0e8e040b3880ad85a2bc873523a8086f09a3/src/lib/effects.ts#L670)

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

0.13.3
