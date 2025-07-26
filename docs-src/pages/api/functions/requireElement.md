[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / requireElement

# Function: requireElement()

## Call Signature

> **requireElement**\<`S`\>(`host`, `selector`, `required`, `assertCustomElement?`): [`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`\>

Defined in: [src/core/dom.ts:353](https://github.com/zeixcom/ui-element/blob/1e2981711e0b3b45697eacbe8601e2ce3440aa11/src/core/dom.ts#L353)

Get the first descendant element matching a selector

### Type Parameters

#### S

`S` *extends* `string`

### Parameters

#### host

`HTMLElement`

Host element

#### selector

`S`

Selector for element to check for

#### required

`string`

Reason for the assertion

#### assertCustomElement?

`boolean`

Whether to assert that the element is a custom element

### Returns

[`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`\>

First matching descendant element

### Since

0.14.0

### Throws

If the element does not contain the required descendant element

### Throws

If assertCustomElement is true and the element is not a custom element

## Call Signature

> **requireElement**\<`E`\>(`host`, `selector`, `required`, `assertCustomElement?`): `E`

Defined in: [src/core/dom.ts:359](https://github.com/zeixcom/ui-element/blob/1e2981711e0b3b45697eacbe8601e2ce3440aa11/src/core/dom.ts#L359)

Get the first descendant element matching a selector

### Type Parameters

#### E

`E` *extends* `Element`

### Parameters

#### host

`HTMLElement`

Host element

#### selector

`string`

Selector for element to check for

#### required

`string`

Reason for the assertion

#### assertCustomElement?

`boolean`

Whether to assert that the element is a custom element

### Returns

`E`

First matching descendant element

### Since

0.14.0

### Throws

If the element does not contain the required descendant element

### Throws

If assertCustomElement is true and the element is not a custom element
