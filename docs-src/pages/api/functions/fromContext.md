[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / fromContext

# Function: fromContext()

> **fromContext**\<`T`, `C`\>(`context`, `fallback`): [`Extractor`](../type-aliases/Extractor.md)\<[`Signal`](../type-aliases/Signal.md)\<`T`\>, `C`\>

Defined in: [src/core/context.ts:132](https://github.com/zeixcom/ui-element/blob/230cd6cc9b2252d1741350e7be8be3e04b6f2cf4/src/core/context.ts#L132)

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
