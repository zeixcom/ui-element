[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / on

# Function: on()

> **on**\<`E`, `K`\>(`type`, `listener`, `options`): [`Effect`](../type-aliases/Effect.md)\<[`ComponentProps`](../type-aliases/ComponentProps.md), `E`\>

Defined in: [src/lib/effects.ts:590](https://github.com/zeixcom/ui-element/blob/d13febaf363936558771161c1c4f66e2034f5ec3/src/lib/effects.ts#L590)

Effect for attaching an event listener to an element.
Provides proper cleanup when the effect is disposed.

## Type Parameters

### E

`E` *extends* `HTMLElement`

### K

`K` *extends* `string`

## Parameters

### type

`K`

Event type to listen for

### listener

(`event`) => `void`

Event listener function

### options

Event listener options

`boolean` | `AddEventListenerOptions`

## Returns

[`Effect`](../type-aliases/Effect.md)\<[`ComponentProps`](../type-aliases/ComponentProps.md), `E`\>

Effect function that manages the event listener

## Since

0.12.0

## Throws

When the provided handler is not a function
