[**@zeix/el-truco**](../README.md)

***

[@zeix/el-truco](../globals.md) / provideContexts

# Function: provideContexts()

> **provideContexts**\<`P`, `K`\>(`contexts`): (`host`) => [`Cleanup`](../type-aliases/Cleanup.md)

Defined in: [src/core/context.ts:100](https://github.com/zeixcom/ui-element/blob/a49c7d7fbed01d04dd21940c975f1839fc83bb07/src/core/context.ts#L100)

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
