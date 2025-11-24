[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / fromContext

# Function: fromContext()

> **fromContext**\<`T`, `C`\>(`context`, `fallback`): [`Extractor`](../type-aliases/Extractor.md)\<() => `T`, `C`\>

Defined in: [src/core/context.ts:129](https://github.com/zeixcom/ui-element/blob/95bb6f2fa5df3c16f08fcbbecd9622c693742c39/src/core/context.ts#L129)

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
