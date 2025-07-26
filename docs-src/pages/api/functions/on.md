[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / on

# Function: on()

> **on**\<`K`, `P`, `E`\>(`type`, `handler`, `options`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/core/events.ts:152](https://github.com/zeixcom/ui-element/blob/e3fa79e199a97014fba6af2a6cf8cb55be8076c3/src/core/events.ts#L152)

Effect for attaching an event listener to an element.
Provides proper cleanup when the effect is disposed.

## Type Parameters

### K

`K` *extends* `string`

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### type

`K`

Event type

### handler

[`EventHandler`](../type-aliases/EventHandler.md)\<`P`, `E`, [`EventType`](../type-aliases/EventType.md)\<`K`\>\>

Event handler function

### options

Event listener options

`boolean` | `AddEventListenerOptions`

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Effect function that manages the event listener

## Since

0.12.0
