[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ElementInserter

# Type Alias: ElementInserter\<E\>

> **ElementInserter**\<`E`\> = `object`

Defined in: [src/lib/effects.ts:47](https://github.com/zeixcom/ui-element/blob/a3d8c74b49b5869fe7d19ae9f979ed1d37f1f695/src/lib/effects.ts#L47)

## Type Parameters

### E

`E` *extends* `Element`

## Properties

### create()

> **create**: (`parent`) => `Element` \| `null`

Defined in: [src/lib/effects.ts:49](https://github.com/zeixcom/ui-element/blob/a3d8c74b49b5869fe7d19ae9f979ed1d37f1f695/src/lib/effects.ts#L49)

#### Parameters

##### parent

`E`

#### Returns

`Element` \| `null`

***

### position?

> `optional` **position**: `InsertPosition`

Defined in: [src/lib/effects.ts:48](https://github.com/zeixcom/ui-element/blob/a3d8c74b49b5869fe7d19ae9f979ed1d37f1f695/src/lib/effects.ts#L48)

***

### reject()?

> `optional` **reject**: (`error`) => `void`

Defined in: [src/lib/effects.ts:51](https://github.com/zeixcom/ui-element/blob/a3d8c74b49b5869fe7d19ae9f979ed1d37f1f695/src/lib/effects.ts#L51)

#### Parameters

##### error

`unknown`

#### Returns

`void`

***

### resolve()?

> `optional` **resolve**: (`parent`) => `void`

Defined in: [src/lib/effects.ts:50](https://github.com/zeixcom/ui-element/blob/a3d8c74b49b5869fe7d19ae9f979ed1d37f1f695/src/lib/effects.ts#L50)

#### Parameters

##### parent

`E`

#### Returns

`void`
