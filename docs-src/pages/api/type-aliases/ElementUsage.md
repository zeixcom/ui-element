[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / ElementUsage

# Type Alias: ElementUsage()

> **ElementUsage** = \{\<`S`\>(`selector`, `required`): [`ElementFromSelector`](ElementFromSelector.md)\<`S`\>; \<`S`\>(`selector`): [`ElementFromSelector`](ElementFromSelector.md)\<`S`\> \| `null`; \<`E`\>(`selector`, `required`): `E`; \<`E`\>(`selector`): `E` \| `null`; \}

Defined in: [src/core/dom.ts:72](https://github.com/zeixcom/ui-element/blob/6f2dec0b8de4a8a6010a0f1311d8457054510e5b/src/core/dom.ts#L72)

## Call Signature

> \<`S`\>(`selector`, `required`): [`ElementFromSelector`](ElementFromSelector.md)\<`S`\>

### Type Parameters

#### S

`S` *extends* `string`

### Parameters

#### selector

`S`

#### required

`string`

### Returns

[`ElementFromSelector`](ElementFromSelector.md)\<`S`\>

## Call Signature

> \<`S`\>(`selector`): [`ElementFromSelector`](ElementFromSelector.md)\<`S`\> \| `null`

### Type Parameters

#### S

`S` *extends* `string`

### Parameters

#### selector

`S`

### Returns

[`ElementFromSelector`](ElementFromSelector.md)\<`S`\> \| `null`

## Call Signature

> \<`E`\>(`selector`, `required`): `E`

### Type Parameters

#### E

`E` *extends* `Element`

### Parameters

#### selector

`string`

#### required

`string`

### Returns

`E`

## Call Signature

> \<`E`\>(`selector`): `E` \| `null`

### Type Parameters

#### E

`E` *extends* `Element`

### Parameters

#### selector

`string`

### Returns

`E` \| `null`
