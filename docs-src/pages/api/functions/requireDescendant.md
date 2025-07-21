[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / requireDescendant

# Function: requireDescendant()

> **requireDescendant**\<`S`, `E`\>(`host`, `selector`): [`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`, `E`\>

Defined in: [src/core/dom.ts:359](https://github.com/zeixcom/ui-element/blob/09c98ef25d6964a68bdac33e61f389dd027c5b92/src/core/dom.ts#L359)

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

Descendant element to check for

## Returns

[`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`, `E`\>

First found descendant element

## Since

0.13.3

## Throws

If the element does not contain the required descendant element
