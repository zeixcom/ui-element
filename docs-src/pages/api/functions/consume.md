[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / consume

# Function: consume()

> **consume**\<`T`, `C`\>(`context`, `fallback`): (`host`) => [`Signal`](../type-aliases/Signal.md)\<`T`\>

Defined in: [src/core/context.ts:124](https://github.com/zeixcom/ui-element/blob/bd4ae3ed0a4d2790834ffe22cb9cd0696e3104c4/src/core/context.ts#L124)

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

0.12.0
