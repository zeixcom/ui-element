[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromEvents

# Function: fromEvents()

> **fromEvents**\<`T`, `E`, `C`, `S`\>(`initialize`, `selector`, `events`): [`SignalProducer`](../type-aliases/SignalProducer.md)\<`T`, `C`\>

Defined in: [src/core/dom.ts:120](https://github.com/zeixcom/ui-element/blob/f80be4b02c5d1c80817271ddf0fad982e43ad03e/src/core/dom.ts#L120)

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
