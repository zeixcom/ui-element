[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / ElementEffects

# Type Alias: ElementEffects()\<P\>

> **ElementEffects**\<`P`\> = \{\<`S`\>(`selector`, `effects`, `required?`): () => `void` \| [`Cleanup`](Cleanup.md); \<`E`\>(`selector`, `effects`, `required?`): () => `void` \| [`Cleanup`](Cleanup.md); \}

Defined in: [src/core/dom.ts:84](https://github.com/zeixcom/ui-element/blob/230cd6cc9b2252d1741350e7be8be3e04b6f2cf4/src/core/dom.ts#L84)

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
