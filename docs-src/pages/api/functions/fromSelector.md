[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromSelector

# Function: fromSelector()

> **fromSelector**\<`E`\>(`selectors`): [`SignalProducer`](../type-aliases/SignalProducer.md)\<`E`[]\>

Defined in: [src/core/dom.ts:259](https://github.com/zeixcom/ui-element/blob/019cf77c80beb600bfb17e452913f013b9d638c1/src/core/dom.ts#L259)

Produce a selection signal from a selector

## Type Parameters

### E

`E` *extends* `Element`

## Parameters

### selectors

`string`

CSS selector for child elements

## Returns

[`SignalProducer`](../type-aliases/SignalProducer.md)\<`E`[]\>

signal producer for child element collection from a selector

## Since

0.13.1
