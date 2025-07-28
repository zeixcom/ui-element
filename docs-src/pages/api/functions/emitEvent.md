[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / emitEvent

# Function: emitEvent()

> **emitEvent**\<`T`, `P`, `E`\>(`type`, `reactive`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/core/events.ts:192](https://github.com/zeixcom/ui-element/blob/6eb916701d8e6ad874e5c8ced8c7ac11007d19ad/src/core/events.ts#L192)

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
