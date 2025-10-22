[**@zeix/le-truc**](../README.md)

---

[@zeix/le-truc](../globals.md) / provideContexts

# Function: provideContexts()

> **provideContexts**\<`P`, `K`\>(`contexts`): (`host`) => [`Cleanup`](../type-aliases/Cleanup.md)

Defined in: [src/core/context.ts:98](https://github.com/zeixcom/le-truc/blob/a2e3a5bb1b7ab9e964c80c41c9edbb895cf2ce79/src/core/context.ts#L98)

Provide a context for descendant component consumers

## Type Parameters

### P

`P` _extends_ [`ComponentProps`](../type-aliases/ComponentProps.md)

### K

`K` _extends_ `string` \| `number` \| `symbol`

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
