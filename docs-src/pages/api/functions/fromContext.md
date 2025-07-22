[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromContext

# Function: fromContext()

> **fromContext**\<`T`, `C`\>(`context`, `fallback`): (`host`) => [`Signal`](../type-aliases/Signal.md)\<`T`\>

Defined in: [src/core/context.ts:125](https://github.com/zeixcom/ui-element/blob/62aded0dfd41b132db684ccc25a7494068f0d957/src/core/context.ts#L125)

Consume a context value for a component.

## Type Parameters

### T

`T` *extends* `object`

### C

`C` *extends* `HTMLElement`

## Parameters

### context

[`Context`](../type-aliases/Context.md)\<`string`, [`Signal`](../type-aliases/Signal.md)\<`T`\>\>

context key to consume

### fallback

[`MaybeSignal`](../type-aliases/MaybeSignal.md)\<`T`\>

fallback value to use if context is not provided

## Returns

- a function that returns the consumed context signal or a signal of the fallback value

> (`host`): [`Signal`](../type-aliases/Signal.md)\<`T`\>

### Parameters

#### host

`C`

### Returns

[`Signal`](../type-aliases/Signal.md)\<`T`\>

## Since

0.13.1
