[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromDescendant

# Function: fromDescendant()

> **fromDescendant**\<`Q`, `K`\>(`selector`, `prop`, `fallback`): [`SignalProducer`](../type-aliases/SignalProducer.md)\<`Q`\[`K`\]\>

Defined in: [src/core/dom.ts:533](https://github.com/zeixcom/ui-element/blob/ca211b4b90c507d609f4e96effa3624e9208d00e/src/core/dom.ts#L533)

Produce a computed signal for projected reactive property from a descendant component

## Type Parameters

### Q

`Q` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### K

`K` *extends* `string` \| `number` \| `symbol`

## Parameters

### selector

`string`

CSS selector for descendant element

### prop

`K`

property name to get signal for

### fallback

`Q`\[`K`\]

fallback value to use until component is ready

## Returns

[`SignalProducer`](../type-aliases/SignalProducer.md)\<`Q`\[`K`\]\>

signal producer that emits value from descendant component

## Since

0.13.1
