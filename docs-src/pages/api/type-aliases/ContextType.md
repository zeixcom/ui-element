[**@zeix/le-truc**](../README.md)

---

[@zeix/le-truc](../globals.md) / ContextType

# Type Alias: ContextType\<T\>

> **ContextType**\<`T`\> = `T` _extends_ [`Context`](Context.md)\<infer \_, infer V\> ? `V` : `never`

Defined in: [src/core/context.ts:32](https://github.com/zeixcom/le-truc/blob/a2e3a5bb1b7ab9e964c80c41c9edbb895cf2ce79/src/core/context.ts#L32)

A helper type which can extract a Context value type from a Context type

## Type Parameters

### T

`T` _extends_ [`UnknownContext`](UnknownContext.md)
