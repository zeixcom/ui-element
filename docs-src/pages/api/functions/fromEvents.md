[**@zeix/el-truco**](../README.md)

***

[@zeix/el-truco](../globals.md) / fromEvents

# Function: fromEvents()

> **fromEvents**\<`T`, `C`, `S`\>(`selector`, `events`, `initialize`): [`Extractor`](../type-aliases/Extractor.md)\<[`Computed`](../type-aliases/Computed.md)\<`T`\>, `C`\>

Defined in: [src/core/events.ts:66](https://github.com/zeixcom/ui-element/blob/8085b01c567eb5438a72e6d26eca9f9f0ad6e39f/src/core/events.ts#L66)

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
