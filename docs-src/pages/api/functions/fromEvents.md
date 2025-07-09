[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromEvents

# Function: fromEvents()

> **fromEvents**\<`T`, `E`, `C`, `S`\>(`initialize`, `selector`, `events`): [`SignalProducer`](../type-aliases/SignalProducer.md)\<`T`, `C`\>

Defined in: [src/core/dom.ts:126](https://github.com/zeixcom/ui-element/blob/e1c0693393151dbc67087d7dde9d2a2f9e7dd58b/src/core/dom.ts#L126)

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

`EventTransformers`\<`T`, [`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`, `E`\>, `C`\>

Transformation functions for events

## Returns

[`SignalProducer`](../type-aliases/SignalProducer.md)\<`T`, `C`\>

Signal producer for value from event

## Since

0.13.3
