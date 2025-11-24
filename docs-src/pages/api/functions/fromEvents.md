[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / fromEvents

# Function: fromEvents()

> **fromEvents**\<`T`, `C`, `S`\>(`selector`, `events`, `initialize`): [`Extractor`](../type-aliases/Extractor.md)\<[`Computed`](../type-aliases/Computed.md)\<`T`\>, `C`\>

Defined in: [src/core/events.ts:71](https://github.com/zeixcom/ui-element/blob/95bb6f2fa5df3c16f08fcbbecd9622c693742c39/src/core/events.ts#L71)

Produce a computed signal from transformed event data

## Type Parameters

### T

`T` *extends* `object`

### C

`C` *extends* `HTMLElement` = `HTMLElement`

### S

`S` *extends* `string` = `string`

## Parameters

### selector

`S`

CSS selector for the source element

### events

[`EventTransformers`](../type-aliases/EventTransformers.md)\<`T`, [`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`\>, `C`\>

Transformation functions for events

### initialize

[`ParserOrFallback`](../type-aliases/ParserOrFallback.md)\<`T`, `C`\>

Initial value or extractor function

## Returns

[`Extractor`](../type-aliases/Extractor.md)\<[`Computed`](../type-aliases/Computed.md)\<`T`\>, `C`\>

Extractor function for value from event

## Since

0.14.0
