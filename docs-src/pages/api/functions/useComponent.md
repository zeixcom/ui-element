[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / useComponent

# Function: useComponent()

## Call Signature

> **useComponent**\<`S`\>(`host`, `selector`, `required?`): `Promise`\<[`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`\>\>

Defined in: [src/core/dom.ts:391](https://github.com/zeixcom/ui-element/blob/e844a8875dcc0f1e1c331a07fc308d56d924c955/src/core/dom.ts#L391)

Get a descendant custom element matching a selector awaited to be defined

### Type Parameters

#### S

`S` *extends* `string`

### Parameters

#### host

`HTMLElement`

Host element

#### selector

`S`

Selector for the descendant element

#### required?

`string`

Optional explanation why the element is required; if provided, throws on missing element

### Returns

`Promise`\<[`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`\>\>

The element or null if not found and not required

### Since

0.14.0

### Throws

If the element does not contain the required descendant element and required is specified

### Throws

If the element is not a custom element

## Call Signature

> **useComponent**\<`S`\>(`host`, `selector`): `Promise`\<`null` \| [`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`\>\>

Defined in: [src/core/dom.ts:396](https://github.com/zeixcom/ui-element/blob/e844a8875dcc0f1e1c331a07fc308d56d924c955/src/core/dom.ts#L396)

Get a descendant custom element matching a selector awaited to be defined

### Type Parameters

#### S

`S` *extends* `string`

### Parameters

#### host

`HTMLElement`

Host element

#### selector

`S`

Selector for the descendant element

### Returns

`Promise`\<`null` \| [`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`\>\>

The element or null if not found and not required

### Since

0.14.0

### Throws

If the element does not contain the required descendant element and required is specified

### Throws

If the element is not a custom element

## Call Signature

> **useComponent**\<`E`\>(`host`, `selector`, `required`): `Promise`\<`E`\>

Defined in: [src/core/dom.ts:400](https://github.com/zeixcom/ui-element/blob/e844a8875dcc0f1e1c331a07fc308d56d924c955/src/core/dom.ts#L400)

Get a descendant custom element matching a selector awaited to be defined

### Type Parameters

#### E

`E` *extends* `Element`

### Parameters

#### host

`HTMLElement`

Host element

#### selector

`string`

Selector for the descendant element

#### required

`string`

Optional explanation why the element is required; if provided, throws on missing element

### Returns

`Promise`\<`E`\>

The element or null if not found and not required

### Since

0.14.0

### Throws

If the element does not contain the required descendant element and required is specified

### Throws

If the element is not a custom element

## Call Signature

> **useComponent**\<`E`\>(`host`, `selector`): `Promise`\<`null` \| `E`\>

Defined in: [src/core/dom.ts:405](https://github.com/zeixcom/ui-element/blob/e844a8875dcc0f1e1c331a07fc308d56d924c955/src/core/dom.ts#L405)

Get a descendant custom element matching a selector awaited to be defined

### Type Parameters

#### E

`E` *extends* `Element`

### Parameters

#### host

`HTMLElement`

Host element

#### selector

`string`

Selector for the descendant element

### Returns

`Promise`\<`null` \| `E`\>

The element or null if not found and not required

### Since

0.14.0

### Throws

If the element does not contain the required descendant element and required is specified

### Throws

If the element is not a custom element
