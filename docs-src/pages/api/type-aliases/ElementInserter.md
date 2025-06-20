[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ElementInserter

# Type Alias: ElementInserter\<E\>

> **ElementInserter**\<`E`\> = `object`

Defined in: [src/lib/effects.ts:46](https://github.com/zeixcom/ui-element/blob/019cf77c80beb600bfb17e452913f013b9d638c1/src/lib/effects.ts#L46)

## Type Parameters

### E

`E` *extends* `Element`

## Properties

### create()

> **create**: (`parent`) => `Element` \| `null`

Defined in: [src/lib/effects.ts:48](https://github.com/zeixcom/ui-element/blob/019cf77c80beb600bfb17e452913f013b9d638c1/src/lib/effects.ts#L48)

#### Parameters

##### parent

`E`

#### Returns

`Element` \| `null`

***

### position?

> `optional` **position**: `InsertPosition`

Defined in: [src/lib/effects.ts:47](https://github.com/zeixcom/ui-element/blob/019cf77c80beb600bfb17e452913f013b9d638c1/src/lib/effects.ts#L47)

***

### reject()?

> `optional` **reject**: (`error`) => `void`

Defined in: [src/lib/effects.ts:50](https://github.com/zeixcom/ui-element/blob/019cf77c80beb600bfb17e452913f013b9d638c1/src/lib/effects.ts#L50)

#### Parameters

##### error

`unknown`

#### Returns

`void`

***

### resolve()?

> `optional` **resolve**: (`parent`) => `void`

Defined in: [src/lib/effects.ts:49](https://github.com/zeixcom/ui-element/blob/019cf77c80beb600bfb17e452913f013b9d638c1/src/lib/effects.ts#L49)

#### Parameters

##### parent

`E`

#### Returns

`void`
