[**@zeix/le-truc**](../README.md)

---

[@zeix/le-truc](../globals.md) / fromEvents

# Function: fromEvents()

> **fromEvents**\<`T`, `C`, `S`\>(`selector`, `events`, `initialize`): [`Extractor`](../type-aliases/Extractor.md)\<[`Computed`](../type-aliases/Computed.md)\<`T`\>, `C`\>

Defined in: [src/core/events.ts:66](https://github.com/zeixcom/le-truc/blob/a2e3a5bb1b7ab9e964c80c41c9edbb895cf2ce79/src/core/events.ts#L66)

Produce a computed signal from transformed event data

## Type Parameters

### T

`T` _extends_ `object`

### C

`C` _extends_ `HTMLElement` = `HTMLElement`

### S

`S` _extends_ `string` = `string`

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
