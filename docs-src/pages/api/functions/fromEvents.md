[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromEvents

# Function: fromEvents()

> **fromEvents**\<`T`, `E`, `C`, `S`\>(`initialize`, `selector`, `events`): [`SignalProducer`](../type-aliases/SignalProducer.md)\<`T`, `C`\>

Defined in: [src/core/dom.ts:125](https://github.com/zeixcom/ui-element/blob/297c0e8e040b3880ad85a2bc873523a8086f09a3/src/core/dom.ts#L125)

Produce a computed signal from transformed event data

## Type Parameters

### T

`T` *extends* `object`

### E

`E` *extends* `Element` = `HTMLElement`

### C

`C` *extends* `HTMLElement` = `HTMLElement`

### S

`S` *extends* `string` = `string`

## Parameters

### initialize

Initial value or initialize function

`T` | (`host`) => `T`

### selector

`S`

CSS selector for the source element

### events

[`EventTransformers`](../type-aliases/EventTransformers.md)\<`T`, [`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`, `E`\>, `C`\>

Transformation functions for events

## Returns

[`SignalProducer`](../type-aliases/SignalProducer.md)\<`T`, `C`\>

Signal producer for value from event

## Since

0.13.3
