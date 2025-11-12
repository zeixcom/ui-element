[**@zeix/el-truco**](../README.md)

***

[@zeix/el-truco](../globals.md) / ElementEffects

# Type Alias: ElementEffects()\<P\>

> **ElementEffects**\<`P`\> = \{\<`S`\>(`selector`, `effects`, `required?`): () => [`MaybeCleanup`](MaybeCleanup.md); \<`E`\>(`selector`, `effects`, `required?`): () => [`MaybeCleanup`](MaybeCleanup.md); \}

Defined in: [src/core/dom.ts:86](https://github.com/zeixcom/ui-element/blob/8085b01c567eb5438a72e6d26eca9f9f0ad6e39f/src/core/dom.ts#L86)

## Type Parameters

### P

`P` *extends* [`ComponentProps`](ComponentProps.md)

## Call Signature

> \<`S`\>(`selector`, `effects`, `required?`): () => [`MaybeCleanup`](MaybeCleanup.md)

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

> (): [`MaybeCleanup`](MaybeCleanup.md)

#### Returns

[`MaybeCleanup`](MaybeCleanup.md)

## Call Signature

> \<`E`\>(`selector`, `effects`, `required?`): () => [`MaybeCleanup`](MaybeCleanup.md)

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

> (): [`MaybeCleanup`](MaybeCleanup.md)

#### Returns

[`MaybeCleanup`](MaybeCleanup.md)
