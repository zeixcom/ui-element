[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromDescendant

# Function: fromDescendant()

> **fromDescendant**\<`E`, `K`\>(`selector`, `prop`, `fallback`): [`SignalProducer`](../type-aliases/SignalProducer.md)\<`NonNullable`\<`E`\[`K`\]\>\>

Defined in: [src/core/dom.ts:510](https://github.com/zeixcom/ui-element/blob/1b1fdfb1fc30e6d828e5489798acad1c8a45a5b4/src/core/dom.ts#L510)

Produce a computed signal for projected reactive property from a descendant component

## Type Parameters

### E

`E` *extends* `Element`

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

`NonNullable`\<`E`\[`K`\]\>

fallback value to use until component is ready

## Returns

[`SignalProducer`](../type-aliases/SignalProducer.md)\<`NonNullable`\<`E`\[`K`\]\>\>

signal producer that emits value from descendant component

## Since

0.13.1
