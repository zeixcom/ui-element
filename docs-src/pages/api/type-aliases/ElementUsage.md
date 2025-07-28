[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ElementUsage

# Type Alias: ElementUsage()

> **ElementUsage** = \{\<`S`\>(`selector`, `required`): [`ElementFromSelector`](ElementFromSelector.md)\<`S`\>; \<`S`\>(`selector`): `null` \| [`ElementFromSelector`](ElementFromSelector.md)\<`S`\>; \<`E`\>(`selector`, `required`): `E`; \<`E`\>(`selector`): `null` \| `E`; \}

Defined in: [src/core/dom.ts:50](https://github.com/zeixcom/ui-element/blob/333374b65ccc17c36a30cb41ca66f6ca0a5c37d0/src/core/dom.ts#L50)

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
