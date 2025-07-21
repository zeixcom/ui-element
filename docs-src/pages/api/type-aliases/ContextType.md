[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ContextType

# Type Alias: ContextType\<T\>

> **ContextType**\<`T`\> = `T` *extends* [`Context`](Context.md)\<infer \_, infer V\> ? `V` : `never`

Defined in: [src/core/context.ts:32](https://github.com/zeixcom/ui-element/blob/09c98ef25d6964a68bdac33e61f389dd027c5b92/src/core/context.ts#L32)

A helper type which can extract a Context value type from a Context type

## Type Parameters

### T

`T` *extends* [`UnknownContext`](UnknownContext.md)
