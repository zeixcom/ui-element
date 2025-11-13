[**@zeix/el-truco**](../README.md)

***

[@zeix/el-truco](../globals.md) / fromContext

# Function: fromContext()

> **fromContext**\<`T`, `C`\>(`context`, `fallback`): [`Extractor`](../type-aliases/Extractor.md)\<() => `T`, `C`\>

Defined in: [src/core/context.ts:127](https://github.com/zeixcom/ui-element/blob/975417e4fd6cf23617fcf9b7b600f45b8f632860/src/core/context.ts#L127)

Consume a context value for a component.

## Type Parameters

### T

`T` *extends* `object`

### C

`C` *extends* `HTMLElement` = `HTMLElement`

## Parameters

### context

[`Context`](../type-aliases/Context.md)\<`string`, () => `T`\>

Context key to consume

### fallback

[`Fallback`](../type-aliases/Fallback.md)\<`T`, `C`\>

Fallback value or extractor function

## Returns

[`Extractor`](../type-aliases/Extractor.md)\<() => `T`, `C`\>

Function that returns the consumed context getter or a signal of the fallback value

## Since

0.13.1
