[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / provideContexts

# Function: provideContexts()

> **provideContexts**\<`P`, `K`\>(`contexts`): (`host`) => [`Cleanup`](../type-aliases/Cleanup.md)

Defined in: [src/core/context.ts:105](https://github.com/zeixcom/ui-element/blob/230cd6cc9b2252d1741350e7be8be3e04b6f2cf4/src/core/context.ts#L105)

Provide a context for descendant component consumers

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### K

`K` *extends* `string` \| `number` \| `symbol`

## Parameters

### contexts

[`Context`](../type-aliases/Context.md)\<`K`, [`Signal`](../type-aliases/Signal.md)\<`P`\[`K`\]\>\>[]

Array of contexts to provide

## Returns

Function to add an event listener for ContextRequestEvent returning a cleanup function to remove the event listener

> (`host`): [`Cleanup`](../type-aliases/Cleanup.md)

### Parameters

#### host

[`Component`](../type-aliases/Component.md)\<`P`\>

### Returns

[`Cleanup`](../type-aliases/Cleanup.md)

## Since

0.13.3
