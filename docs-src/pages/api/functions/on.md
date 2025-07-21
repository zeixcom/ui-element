[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / on

# Function: on()

> **on**\<`K`, `E`\>(`type`, `listener`, `options`): [`Effect`](../type-aliases/Effect.md)\<[`ComponentProps`](../type-aliases/ComponentProps.md), `E`\>

Defined in: [src/lib/effects.ts:646](https://github.com/zeixcom/ui-element/blob/09c98ef25d6964a68bdac33e61f389dd027c5b92/src/lib/effects.ts#L646)

Effect for attaching an event listener to an element.
Provides proper cleanup when the effect is disposed.

## Type Parameters

### K

`K` *extends* `string`

### E

`E` *extends* `HTMLElement`

## Parameters

### type

`K`

Event type

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
