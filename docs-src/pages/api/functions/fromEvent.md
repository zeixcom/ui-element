[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromEvent

# Function: fromEvent()

> **fromEvent**\<`T`, `E`, `K`, `C`\>(`selector`, `type`, `transform`, `initializer`): [`SignalProducer`](../type-aliases/SignalProducer.md)\<`T`, `C`\>

Defined in: [src/core/dom.ts:402](https://github.com/zeixcom/ui-element/blob/6285025fa3b3778fb2f356dae80a5fa6250ac264/src/core/dom.ts#L402)

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
