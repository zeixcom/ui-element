[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromSelector

# Function: fromSelector()

> **fromSelector**\<`E`, `C`, `K`\>(`selector`): [`SignalProducer`](../type-aliases/SignalProducer.md)\<[`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`K`, `E`\>[], `C`\>

Defined in: [src/core/dom.ts:235](https://github.com/zeixcom/ui-element/blob/e1c0693393151dbc67087d7dde9d2a2f9e7dd58b/src/core/dom.ts#L235)

Produce a computed signal of an array of elements matching a selector

## Type Parameters

### E

`E` *extends* `Element` = `HTMLElement`

### C

`C` *extends* `HTMLElement` = `HTMLElement`

### K

`K` *extends* `string` = `string`

## Parameters

### selector

`K`

CSS selector for descendant elements

## Returns

[`SignalProducer`](../type-aliases/SignalProducer.md)\<[`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`K`, `E`\>[], `C`\>

Signal producer for descendant element collection from a selector

## Since

0.13.1
