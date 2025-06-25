[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ElementInserter

# Type Alias: ElementInserter\<E\>

> **ElementInserter**\<`E`\> = `object`

Defined in: [src/lib/effects.ts:46](https://github.com/zeixcom/ui-element/blob/a6fb4a88fd37bb5ca41823947687e8a37d5f2e08/src/lib/effects.ts#L46)

## Type Parameters

### E

`E` *extends* `Element`

## Properties

### create()

> **create**: (`parent`) => `Element` \| `null`

Defined in: [src/lib/effects.ts:48](https://github.com/zeixcom/ui-element/blob/a6fb4a88fd37bb5ca41823947687e8a37d5f2e08/src/lib/effects.ts#L48)

#### Parameters

##### parent

`E`

#### Returns

`Element` \| `null`

***

### position?

> `optional` **position**: `InsertPosition`

Defined in: [src/lib/effects.ts:47](https://github.com/zeixcom/ui-element/blob/a6fb4a88fd37bb5ca41823947687e8a37d5f2e08/src/lib/effects.ts#L47)

***

### reject()?

> `optional` **reject**: (`error`) => `void`

Defined in: [src/lib/effects.ts:50](https://github.com/zeixcom/ui-element/blob/a6fb4a88fd37bb5ca41823947687e8a37d5f2e08/src/lib/effects.ts#L50)

#### Parameters

##### error

`unknown`

#### Returns

`void`

***

### resolve()?

> `optional` **resolve**: (`parent`) => `void`

Defined in: [src/lib/effects.ts:49](https://github.com/zeixcom/ui-element/blob/a6fb4a88fd37bb5ca41823947687e8a37d5f2e08/src/lib/effects.ts#L49)

#### Parameters

##### parent

`E`

#### Returns

`void`
