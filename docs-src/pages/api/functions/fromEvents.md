[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromEvents

# Function: fromEvents()

> **fromEvents**\<`T`, `C`, `S`\>(`selector`, `events`, `initialize`): [`Extractor`](../type-aliases/Extractor.md)\<[`Computed`](../type-aliases/Computed.md)\<`T`\>, `C`\>

Defined in: [src/core/events.ts:66](https://github.com/zeixcom/ui-element/blob/d8ce494088eb3ef4e25b26c5f9ab59c8ffc0b7d8/src/core/events.ts#L66)

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
