[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / requireElement

# Function: requireElement()

> **requireElement**\<`S`, `E`\>(`host`, `selector`, `assertCustomElement`): [`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`, `E`\>

Defined in: [src/core/dom.ts:377](https://github.com/zeixcom/ui-element/blob/f5c20c5e6da1a988462bc7f68d75f2a4c0200046/src/core/dom.ts#L377)

Assert that an element contains an expected descendant element

## Type Parameters

### S

`S` *extends* `string` = `string`

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### host

`HTMLElement`

Host element

### selector

`S`

Selector for element to check for

### assertCustomElement

`boolean` = `false`

## Returns

[`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`, `E`\>

First found descendant element

## Since

0.13.4

## Throws

If the element does not contain the required descendant element
