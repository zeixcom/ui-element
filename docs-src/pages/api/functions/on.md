[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / on

# Function: on()

> **on**\<`E`, `K`\>(`type`, `listener`, `options`): \<`P`\>(`host`, `target`) => [`Cleanup`](../type-aliases/Cleanup.md)

Defined in: [src/core/dom.ts:298](https://github.com/zeixcom/ui-element/blob/fbfc14f2b364007b204dfef842cb4c272bdfad41/src/core/dom.ts#L298)

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

> \<`P`\>(`host`, `target`): [`Cleanup`](../type-aliases/Cleanup.md)

### Type Parameters

#### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### Parameters

#### host

[`Component`](../type-aliases/Component.md)\<`P`\>

#### target

`E` = `...`

### Returns

[`Cleanup`](../type-aliases/Cleanup.md)

## Since

0.12.0

## Throws

- if the provided handler is not an event listener or a provider function
