[**@zeix/el-truco**](../README.md)

***

[@zeix/el-truco](../globals.md) / ContextType

# Type Alias: ContextType\<T\>

> **ContextType**\<`T`\> = `T` *extends* [`Context`](Context.md)\<infer \_, infer V\> ? `V` : `never`

Defined in: [src/core/context.ts:27](https://github.com/zeixcom/ui-element/blob/8085b01c567eb5438a72e6d26eca9f9f0ad6e39f/src/core/context.ts#L27)

A helper type which can extract a Context value type from a Context type

## Type Parameters

### T

`T` *extends* [`UnknownContext`](UnknownContext.md)
