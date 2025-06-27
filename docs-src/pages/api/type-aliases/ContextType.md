[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ContextType

# Type Alias: ContextType\<T\>

> **ContextType**\<`T`\> = `T` *extends* [`Context`](Context.md)\<`string`, infer V\> ? `V` : `never`

Defined in: [src/core/context.ts:32](https://github.com/zeixcom/ui-element/blob/fbfc14f2b364007b204dfef842cb4c272bdfad41/src/core/context.ts#L32)

A helper type which can extract a Context value type from a Context type

## Type Parameters

### T

`T` *extends* [`UnknownContext`](UnknownContext.md)
