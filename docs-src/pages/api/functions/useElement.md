[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / useElement

# Function: useElement()

## Call Signature

> **useElement**\<`S`\>(`host`, `selector`, `required?`): [`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`\>

Defined in: [src/core/dom.ts:351](https://github.com/zeixcom/ui-element/blob/e844a8875dcc0f1e1c331a07fc308d56d924c955/src/core/dom.ts#L351)

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

#### required?

`string`

Optional reason for the assertion; if provided, throws on missing element

### Returns

[`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`\>

First matching descendant element, or null if not found and not required

### Since

0.14.0

### Throws

If the element does not contain the required descendant element and required is specified

## Call Signature

> **useElement**\<`S`\>(`host`, `selector`): `null` \| [`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`\>

Defined in: [src/core/dom.ts:356](https://github.com/zeixcom/ui-element/blob/e844a8875dcc0f1e1c331a07fc308d56d924c955/src/core/dom.ts#L356)

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

### Returns

`null` \| [`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`\>

First matching descendant element, or null if not found and not required

### Since

0.14.0

### Throws

If the element does not contain the required descendant element and required is specified

## Call Signature

> **useElement**\<`E`\>(`host`, `selector`, `required`): `E`

Defined in: [src/core/dom.ts:360](https://github.com/zeixcom/ui-element/blob/e844a8875dcc0f1e1c331a07fc308d56d924c955/src/core/dom.ts#L360)

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

Optional reason for the assertion; if provided, throws on missing element

### Returns

`E`

First matching descendant element, or null if not found and not required

### Since

0.14.0

### Throws

If the element does not contain the required descendant element and required is specified

## Call Signature

> **useElement**\<`E`\>(`host`, `selector`): `null` \| `E`

Defined in: [src/core/dom.ts:365](https://github.com/zeixcom/ui-element/blob/e844a8875dcc0f1e1c331a07fc308d56d924c955/src/core/dom.ts#L365)

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

### Returns

`null` \| `E`

First matching descendant element, or null if not found and not required

### Since

0.14.0

### Throws

If the element does not contain the required descendant element and required is specified
