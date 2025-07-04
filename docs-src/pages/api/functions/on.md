[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / on

# Function: on()

> **on**\<`E`, `K`\>(`type`, `listener`, `options`): [`Effect`](../type-aliases/Effect.md)\<[`ComponentProps`](../type-aliases/ComponentProps.md), `E`\>

Defined in: [src/core/dom.ts:303](https://github.com/zeixcom/ui-element/blob/1b1fdfb1fc30e6d828e5489798acad1c8a45a5b4/src/core/dom.ts#L303)

Attach an event listener to an element

## Type Parameters

### E

`E` *extends* `Element`

### K

`K` *extends* `string`

## Parameters

### type

`K`

event type to listen for (type-safe based on element type)

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
