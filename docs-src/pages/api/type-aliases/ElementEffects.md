[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ElementEffects

# Type Alias: ElementEffects()\<P\>

> **ElementEffects**\<`P`\> = \{\<`S`\>(`selector`, `effects`, `required?`): () => `void` \| [`Cleanup`](Cleanup.md); \<`E`\>(`selector`, `effects`, `required?`): () => `void` \| [`Cleanup`](Cleanup.md); \}

Defined in: [src/core/dom.ts:84](https://github.com/zeixcom/ui-element/blob/1e5ebee179adfc4619d3d0e9d2b864d1e97ba797/src/core/dom.ts#L84)

## Type Parameters

### P

`P` *extends* [`ComponentProps`](ComponentProps.md)

## Call Signature

> \<`S`\>(`selector`, `effects`, `required?`): () => `void` \| [`Cleanup`](Cleanup.md)

### Type Parameters

#### S

`S` *extends* `string`

### Parameters

#### selector

`S`

#### effects

[`Effects`](Effects.md)\<`P`, [`ElementFromSelector`](ElementFromSelector.md)\<`S`\>\>

#### required?

`string`

### Returns

> (): `void` \| [`Cleanup`](Cleanup.md)

#### Returns

`void` \| [`Cleanup`](Cleanup.md)

## Call Signature

> \<`E`\>(`selector`, `effects`, `required?`): () => `void` \| [`Cleanup`](Cleanup.md)

### Type Parameters

#### E

`E` *extends* `Element`

### Parameters

#### selector

`string`

#### effects

[`Effects`](Effects.md)\<`P`, `E`\>

#### required?

`string`

### Returns

> (): `void` \| [`Cleanup`](Cleanup.md)

#### Returns

`void` \| [`Cleanup`](Cleanup.md)
