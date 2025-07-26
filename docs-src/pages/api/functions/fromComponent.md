[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromComponent

# Function: fromComponent()

## Call Signature

> **fromComponent**\<`T`, `S`, `C`\>(`selector`, `extractor`, `required`): [`Extractor`](../type-aliases/Extractor.md)\<[`Computed`](../type-aliases/Computed.md)\<`T`\>, `C`\>

Defined in: [src/core/dom.ts:391](https://github.com/zeixcom/ui-element/blob/1e2981711e0b3b45697eacbe8601e2ce3440aa11/src/core/dom.ts#L391)

Create a computed signal from a required descendant component's property

### Type Parameters

#### T

`T` *extends* `object`

#### S

`S` *extends* `string`

#### C

`C` *extends* `HTMLElement` = `HTMLElement`

### Parameters

#### selector

`S`

Selector for the required descendant element

#### extractor

[`Extractor`](../type-aliases/Extractor.md)\<`T`, [`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`\>\>

Function to extract the value from the element

#### required

`string`

Explanation why the element is required

### Returns

[`Extractor`](../type-aliases/Extractor.md)\<[`Computed`](../type-aliases/Computed.md)\<`T`\>, `C`\>

Extractor that returns a computed signal that computes the value from the element

### Since

0.14.0

### Throws

If the element does not contain the required descendant element

### Throws

If the element is not a custom element

## Call Signature

> **fromComponent**\<`T`, `E`, `C`\>(`selector`, `extractor`, `required`): [`Extractor`](../type-aliases/Extractor.md)\<[`Computed`](../type-aliases/Computed.md)\<`T`\>, `C`\>

Defined in: [src/core/dom.ts:400](https://github.com/zeixcom/ui-element/blob/1e2981711e0b3b45697eacbe8601e2ce3440aa11/src/core/dom.ts#L400)

Create a computed signal from a required descendant component's property

### Type Parameters

#### T

`T` *extends* `object`

#### E

`E` *extends* `Element`

#### C

`C` *extends* `HTMLElement` = `HTMLElement`

### Parameters

#### selector

`string`

Selector for the required descendant element

#### extractor

[`Extractor`](../type-aliases/Extractor.md)\<`T`, `E`\>

Function to extract the value from the element

#### required

`string`

Explanation why the element is required

### Returns

[`Extractor`](../type-aliases/Extractor.md)\<[`Computed`](../type-aliases/Computed.md)\<`T`\>, `C`\>

Extractor that returns a computed signal that computes the value from the element

### Since

0.14.0

### Throws

If the element does not contain the required descendant element

### Throws

If the element is not a custom element
