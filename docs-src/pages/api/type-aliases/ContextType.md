[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / ContextType

# Type Alias: ContextType\<T\>

> **ContextType**\<`T`\> = `T` *extends* [`Context`](Context.md)\<infer \_, infer V\> ? `V` : `never`

Defined in: [src/core/context.ts:27](https://github.com/zeixcom/ui-element/blob/95bb6f2fa5df3c16f08fcbbecd9622c693742c39/src/core/context.ts#L27)

A helper type which can extract a Context value type from a Context type

## Type Parameters

### T

`T` *extends* [`UnknownContext`](UnknownContext.md)
