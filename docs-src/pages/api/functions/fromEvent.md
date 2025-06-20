[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromEvent

# Function: fromEvent()

> **fromEvent**\<`T`, `E`, `K`, `C`\>(`selector`, `type`, `transform`, `initializer`): [`SignalProducer`](../type-aliases/SignalProducer.md)\<`T`, `C`\>

Defined in: [src/core/dom.ts:402](https://github.com/zeixcom/ui-element/blob/019cf77c80beb600bfb17e452913f013b9d638c1/src/core/dom.ts#L402)

Produce a computed signal from transformed event data

## Type Parameters

### T

`T` *extends* `object`

### E

`E` *extends* `HTMLElement`

### K

`K` *extends* `string`

### C

`C` *extends* `HTMLElement` = `HTMLElement`

## Parameters

### selector

`string`

CSS selector for the source element

### type

`K`

event type to listen for

### transform

(`host`, `source`, `event`, `oldValue`) => `T`

transformation function for the event

### initializer

initial value or initializer function

`T` | (`host`, `source`) => `T`

## Returns

[`SignalProducer`](../type-aliases/SignalProducer.md)\<`T`, `C`\>

signal producer for value from event

## Since

0.13.1
