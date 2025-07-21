[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromSelector

# Function: fromSelector()

> **fromSelector**\<`E`, `C`, `S`\>(`selector`): [`SignalProducer`](../type-aliases/SignalProducer.md)\<[`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`, `E`\>[], `C`\>

Defined in: [src/core/dom.ts:229](https://github.com/zeixcom/ui-element/blob/09c98ef25d6964a68bdac33e61f389dd027c5b92/src/core/dom.ts#L229)

Produce a computed signal of an array of elements matching a selector

## Type Parameters

### E

`E` *extends* `Element` = `HTMLElement`

### C

`C` *extends* `HTMLElement` = `HTMLElement`

### S

`S` *extends* `string` = `string`

## Parameters

### selector

`S`

CSS selector for descendant elements

## Returns

[`SignalProducer`](../type-aliases/SignalProducer.md)\<[`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`, `E`\>[], `C`\>

Signal producer for descendant element collection from a selector

## Since

0.13.1
