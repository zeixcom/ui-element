[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ContextType

# Type Alias: ContextType\<T\>

> **ContextType**\<`T`\> = `T` *extends* [`Context`](Context.md)\<infer \_, infer V\> ? `V` : `never`

Defined in: [src/core/context.ts:32](https://github.com/zeixcom/ui-element/blob/6eb916701d8e6ad874e5c8ced8c7ac11007d19ad/src/core/context.ts#L32)

A helper type which can extract a Context value type from a Context type

## Type Parameters

### T

`T` *extends* [`UnknownContext`](UnknownContext.md)
