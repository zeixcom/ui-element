[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromContext

# Function: fromContext()

> **fromContext**\<`T`, `C`\>(`context`, `fallback`): (`host`) => [`Signal`](../type-aliases/Signal.md)\<`T`\>

Defined in: [src/core/context.ts:123](https://github.com/zeixcom/ui-element/blob/e1c0693393151dbc67087d7dde9d2a2f9e7dd58b/src/core/context.ts#L123)

## Type Parameters

### T

`T` *extends* `object`

### C

`C` *extends* `HTMLElement`

## Parameters

### context

[`Context`](../type-aliases/Context.md)\<`string`, [`Signal`](../type-aliases/Signal.md)\<`T`\>\>

### fallback

[`MaybeSignal`](../type-aliases/MaybeSignal.md)\<`T`\>

## Returns

> (`host`): [`Signal`](../type-aliases/Signal.md)\<`T`\>

### Parameters

#### host

`C`

### Returns

[`Signal`](../type-aliases/Signal.md)\<`T`\>
