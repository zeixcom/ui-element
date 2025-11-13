[**@zeix/el-truco**](../README.md)

***

[@zeix/el-truco](../globals.md) / ElementUsage

# Type Alias: ElementUsage()

> **ElementUsage** = \{\<`S`\>(`selector`, `required`): [`ElementFromSelector`](ElementFromSelector.md)\<`S`\>; \<`S`\>(`selector`): [`ElementFromSelector`](ElementFromSelector.md)\<`S`\> \| `null`; \<`E`\>(`selector`, `required`): `E`; \<`E`\>(`selector`): `E` \| `null`; \}

Defined in: [src/core/dom.ts:74](https://github.com/zeixcom/ui-element/blob/975417e4fd6cf23617fcf9b7b600f45b8f632860/src/core/dom.ts#L74)

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
