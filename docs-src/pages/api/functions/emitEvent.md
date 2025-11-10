[**@zeix/el-truco**](../README.md)

***

[@zeix/el-truco](../globals.md) / emitEvent

# Function: emitEvent()

> **emitEvent**\<`T`, `P`, `E`\>(`type`, `reactive`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/core/events.ts:196](https://github.com/zeixcom/ui-element/blob/a49c7d7fbed01d04dd21940c975f1839fc83bb07/src/core/events.ts#L196)

Effect for emitting custom events with reactive detail values.
Creates and dispatches CustomEvent instances with bubbling enabled by default.

## Type Parameters

### T

`T` *extends* `object`

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
