[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / ElementEffects

# Type Alias: ElementEffects()\<P\>

> **ElementEffects**\<`P`\> = \{\<`S`\>(`selector`, `effects`, `required?`): () => [`MaybeCleanup`](MaybeCleanup.md); \<`E`\>(`selector`, `effects`, `required?`): () => [`MaybeCleanup`](MaybeCleanup.md); \}

Defined in: [src/core/dom.ts:86](https://github.com/zeixcom/ui-element/blob/95bb6f2fa5df3c16f08fcbbecd9622c693742c39/src/core/dom.ts#L86)

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
