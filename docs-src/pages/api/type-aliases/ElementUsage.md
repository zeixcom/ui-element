[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ElementUsage

# Type Alias: ElementUsage()

> **ElementUsage** = \{\<`S`\>(`selector`, `required`): [`ElementFromSelector`](ElementFromSelector.md)\<`S`\>; \<`S`\>(`selector`): `null` \| [`ElementFromSelector`](ElementFromSelector.md)\<`S`\>; \<`E`\>(`selector`, `required`): `E`; \<`E`\>(`selector`): `null` \| `E`; \}

Defined in: [src/core/dom.ts:72](https://github.com/zeixcom/ui-element/blob/a2e3a5bb1b7ab9e964c80c41c9edbb895cf2ce79/src/core/dom.ts#L72)

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

> \<`S`\>(`selector`): `null` \| [`ElementFromSelector`](ElementFromSelector.md)\<`S`\>

### Type Parameters

#### S

`S` *extends* `string`

### Parameters

#### selector

`S`

### Returns

`null` \| [`ElementFromSelector`](ElementFromSelector.md)\<`S`\>

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

> \<`E`\>(`selector`): `null` \| `E`

### Type Parameters

#### E

`E` *extends* `Element`

### Parameters

#### selector

`string`

### Returns

`null` \| `E`
