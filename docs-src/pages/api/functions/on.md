[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / on

# Function: on()

> **on**\<`K`, `P`, `E`\>(`type`, `handler`, `options`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/core/events.ts:153](https://github.com/zeixcom/ui-element/blob/95bb6f2fa5df3c16f08fcbbecd9622c693742c39/src/core/events.ts#L153)

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

0.14.0
