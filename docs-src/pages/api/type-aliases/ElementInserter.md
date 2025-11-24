[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / ElementInserter

# Type Alias: ElementInserter\<E\>

> **ElementInserter**\<`E`\> = `object`

Defined in: [src/lib/effects.ts:33](https://github.com/zeixcom/ui-element/blob/95bb6f2fa5df3c16f08fcbbecd9622c693742c39/src/lib/effects.ts#L33)

## Type Parameters

### E

`E` *extends* `Element`

## Properties

### create()

> **create**: (`parent`) => `Element` \| `null`

Defined in: [src/lib/effects.ts:35](https://github.com/zeixcom/ui-element/blob/95bb6f2fa5df3c16f08fcbbecd9622c693742c39/src/lib/effects.ts#L35)

#### Parameters

##### parent

`E`

#### Returns

`Element` \| `null`

***

### position?

> `optional` **position**: `InsertPosition`

Defined in: [src/lib/effects.ts:34](https://github.com/zeixcom/ui-element/blob/95bb6f2fa5df3c16f08fcbbecd9622c693742c39/src/lib/effects.ts#L34)

***

### reject()?

> `optional` **reject**: (`error`) => `void`

Defined in: [src/lib/effects.ts:37](https://github.com/zeixcom/ui-element/blob/95bb6f2fa5df3c16f08fcbbecd9622c693742c39/src/lib/effects.ts#L37)

#### Parameters

##### error

`unknown`

#### Returns

`void`

***

### resolve()?

> `optional` **resolve**: (`parent`) => `void`

Defined in: [src/lib/effects.ts:36](https://github.com/zeixcom/ui-element/blob/95bb6f2fa5df3c16f08fcbbecd9622c693742c39/src/lib/effects.ts#L36)

#### Parameters

##### parent

`E`

#### Returns

`void`
