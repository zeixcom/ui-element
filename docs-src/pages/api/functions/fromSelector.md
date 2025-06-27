[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromSelector

# Function: fromSelector()

> **fromSelector**\<`E`\>(`selectors`): [`SignalProducer`](../type-aliases/SignalProducer.md)\<`E`[]\>

Defined in: [src/core/dom.ts:259](https://github.com/zeixcom/ui-element/blob/8a5f554f7f150bc30f3cc67f612a4c3067704cb6/src/core/dom.ts#L259)

Produce a selection signal from a selector

## Type Parameters

### E

`E` *extends* `Element`

## Parameters

### selectors

`string`

CSS selector for descendant elements

## Returns

[`SignalProducer`](../type-aliases/SignalProducer.md)\<`E`[]\>

signal producer for descendant element collection from a selector

## Since

0.13.1
