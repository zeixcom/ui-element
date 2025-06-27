[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromChild

# Function: fromChild()

> **fromChild**\<`Q`, `K`\>(`selector`, `prop`, `fallback`): [`SignalProducer`](../type-aliases/SignalProducer.md)\<`Q`\[`K`\]\>

Defined in: [src/core/dom.ts:533](https://github.com/zeixcom/ui-element/blob/ef7525ef4fcd5329d68c2b65cc085220a29b7a4f/src/core/dom.ts#L533)

Produce a computed signal for projected reactive property from child component

## Type Parameters

### Q

`Q` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### K

`K` *extends* `string` \| `number` \| `symbol`

## Parameters

### selector

`string`

CSS selector for child element

### prop

`K`

property name to get signal for

### fallback

`Q`\[`K`\]

fallback value to use until component is ready

## Returns

[`SignalProducer`](../type-aliases/SignalProducer.md)\<`Q`\[`K`\]\>

signal producer that emits value from child component

## Since

0.13.1
