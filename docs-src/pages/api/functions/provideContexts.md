[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / provideContexts

# Function: provideContexts()

> **provideContexts**\<`P`\>(`contexts`): (`host`) => [`Cleanup`](../type-aliases/Cleanup.md)

Defined in: [src/core/context.ts:100](https://github.com/zeixcom/ui-element/blob/95bb6f2fa5df3c16f08fcbbecd9622c693742c39/src/core/context.ts#L100)

Provide a context for descendant component consumers

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

## Parameters

### contexts

keyof `P`[]

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
