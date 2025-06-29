[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ContextType

# Type Alias: ContextType\<T\>

> **ContextType**\<`T`\> = `T` *extends* [`Context`](Context.md)\<`string`, infer V\> ? `V` : `never`

Defined in: [src/core/context.ts:32](https://github.com/zeixcom/ui-element/blob/ca211b4b90c507d609f4e96effa3624e9208d00e/src/core/context.ts#L32)

A helper type which can extract a Context value type from a Context type

## Type Parameters

### T

`T` *extends* [`UnknownContext`](UnknownContext.md)
