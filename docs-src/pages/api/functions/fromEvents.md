[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromEvents

# Function: fromEvents()

> **fromEvents**\<`T`, `C`, `S`\>(`initialize`, `selector`, `events`): [`Extractor`](../type-aliases/Extractor.md)\<[`Computed`](../type-aliases/Computed.md)\<`T`\>, `C`\>

Defined in: [src/core/events.ts:71](https://github.com/zeixcom/ui-element/blob/6eb916701d8e6ad874e5c8ced8c7ac11007d19ad/src/core/events.ts#L71)

Produce a computed signal from transformed event data

## Type Parameters

### T

`T` *extends* `object`

### C

`C` *extends* `HTMLElement` = `HTMLElement`

### S

`S` *extends* `string` = `string`

## Parameters

### initialize

[`Fallback`](../type-aliases/Fallback.md)\<`T`, `C`\>

Initial value or extractor function

### selector

`S`

CSS selector for the source element

### events

[`EventTransformers`](../type-aliases/EventTransformers.md)\<`T`, [`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`\>, `C`\>

Transformation functions for events

## Returns

[`Extractor`](../type-aliases/Extractor.md)\<[`Computed`](../type-aliases/Computed.md)\<`T`\>, `C`\>

Extractor function for value from event

## Since

0.13.3
