[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / provide

# Function: provide()

> **provide**\<`P`, `K`\>(`provided`): (`host`) => [`Cleanup`](../type-aliases/Cleanup.md)

Defined in: [src/core/context.ts:98](https://github.com/zeixcom/ui-element/blob/ca211b4b90c507d609f4e96effa3624e9208d00e/src/core/context.ts#L98)

Provide a context for descendant component consumers

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### K

`K` *extends* `string` \| `number` \| `symbol`

## Parameters

### provided

[`Context`](../type-aliases/Context.md)\<`K`, [`Signal`](../type-aliases/Signal.md)\<`P`\[`K`\]\>\>[]

array of contexts to provide

## Returns

- function to add an event listener for ContextRequestEvent returning a cleanup function to remove the event listener

> (`host`): [`Cleanup`](../type-aliases/Cleanup.md)

### Parameters

#### host

[`Component`](../type-aliases/Component.md)\<`P`\>

### Returns

[`Cleanup`](../type-aliases/Cleanup.md)

## Since

0.12.0
