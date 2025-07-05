[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / on

# Function: on()

> **on**\<`E`, `K`\>(`type`, `listener`, `options`): [`Effect`](../type-aliases/Effect.md)\<[`ComponentProps`](../type-aliases/ComponentProps.md), `E`\>

Defined in: [src/lib/effects.ts:511](https://github.com/zeixcom/ui-element/blob/0678e2841dfcc123c324a841983e7a648bd2315e/src/lib/effects.ts#L511)

Attach an event listener to an element

## Type Parameters

### E

`E` *extends* `HTMLElement`

### K

`K` *extends* `string`

## Parameters

### type

`K`

event type to listen for

### listener

(`event`) => `void`

event listener

### options

event listener options

`boolean` | `AddEventListenerOptions`

## Returns

[`Effect`](../type-aliases/Effect.md)\<[`ComponentProps`](../type-aliases/ComponentProps.md), `E`\>

## Since

0.12.0

## Throws

- if the provided handler is not an event listener or a provider function
