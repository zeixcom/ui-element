[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / requireElement

# Function: requireElement()

> **requireElement**\<`E`, `S`\>(`host`, `selector`, `required`, `assertCustomElement?`): [`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`, `E`\>

Defined in: [src/core/dom.ts:360](https://github.com/zeixcom/ui-element/blob/0e9cacf03a8f95418720628d5174fbb006152743/src/core/dom.ts#L360)

Get the first descendant element matching a selector

## Type Parameters

### E

`E` *extends* `Element` = `HTMLElement`

### S

`S` *extends* `string` = `string`

## Parameters

### host

`HTMLElement`

Host element

### selector

`S`

Selector for element to check for

### required

`string`

Reason for the assertion

### assertCustomElement?

`boolean`

Whether to assert that the element is a custom element

## Returns

[`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`, `E`\>

First matching descendant element

## Since

0.14.0

## Throws

If the element does not contain the required descendant element

## Throws

If assertCustomElement is true and the element is not a custom element
