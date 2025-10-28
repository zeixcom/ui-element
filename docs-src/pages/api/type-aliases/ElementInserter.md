[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / ElementInserter

# Type Alias: ElementInserter\<E\>

> **ElementInserter**\<`E`\> = `object`

Defined in: [src/lib/effects.ts:47](https://github.com/zeixcom/ui-element/blob/1c934178f8926c03a10af2b29ad6cc201eead501/src/lib/effects.ts#L47)

## Type Parameters

### E

`E` *extends* `Element`

## Properties

### create()

> **create**: (`parent`) => `Element` \| `null`

Defined in: [src/lib/effects.ts:49](https://github.com/zeixcom/ui-element/blob/1c934178f8926c03a10af2b29ad6cc201eead501/src/lib/effects.ts#L49)

#### Parameters

##### parent

`E`

#### Returns

`Element` \| `null`

***

### position?

> `optional` **position**: `InsertPosition`

Defined in: [src/lib/effects.ts:48](https://github.com/zeixcom/ui-element/blob/1c934178f8926c03a10af2b29ad6cc201eead501/src/lib/effects.ts#L48)

***

### reject()?

> `optional` **reject**: (`error`) => `void`

Defined in: [src/lib/effects.ts:51](https://github.com/zeixcom/ui-element/blob/1c934178f8926c03a10af2b29ad6cc201eead501/src/lib/effects.ts#L51)

#### Parameters

##### error

`unknown`

#### Returns

`void`

***

### resolve()?

> `optional` **resolve**: (`parent`) => `void`

Defined in: [src/lib/effects.ts:50](https://github.com/zeixcom/ui-element/blob/1c934178f8926c03a10af2b29ad6cc201eead501/src/lib/effects.ts#L50)

#### Parameters

##### parent

`E`

#### Returns

`void`
