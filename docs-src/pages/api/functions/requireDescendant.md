[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / requireDescendant

# Function: requireDescendant()

> **requireDescendant**\<`S`, `E`\>(`host`, `selector`): [`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`, `E`\>

Defined in: [src/core/dom.ts:372](https://github.com/zeixcom/ui-element/blob/297c0e8e040b3880ad85a2bc873523a8086f09a3/src/core/dom.ts#L372)

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
