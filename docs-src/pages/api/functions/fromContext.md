[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromContext

# Function: fromContext()

> **fromContext**\<`T`, `C`\>(`context`, `fallback`): [`Extractor`](../type-aliases/Extractor.md)\<[`Signal`](../type-aliases/Signal.md)\<`T`\>, `C`\>

Defined in: [src/core/context.ts:125](https://github.com/zeixcom/ui-element/blob/1e5ebee179adfc4619d3d0e9d2b864d1e97ba797/src/core/context.ts#L125)

Consume a context value for a component.

## Type Parameters

### T

`T` *extends* `object`

### C

`C` *extends* `HTMLElement` = `HTMLElement`

## Parameters

### context

[`Context`](../type-aliases/Context.md)\<`string`, [`Signal`](../type-aliases/Signal.md)\<`T`\>\>

Context key to consume

### fallback

[`Fallback`](../type-aliases/Fallback.md)\<`T`, `C`\>

Fallback value or extractor function

## Returns

[`Extractor`](../type-aliases/Extractor.md)\<[`Signal`](../type-aliases/Signal.md)\<`T`\>, `C`\>

Function that returns the consumed context signal or a signal of the fallback value

## Since

0.13.1
