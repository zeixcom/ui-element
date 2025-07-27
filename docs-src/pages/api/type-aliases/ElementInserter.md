[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ElementInserter

# Type Alias: ElementInserter\<E\>

> **ElementInserter**\<`E`\> = `object`

Defined in: [src/lib/effects.ts:48](https://github.com/zeixcom/ui-element/blob/2605753812ae73569ed9fdbb08b86e62a74ff14d/src/lib/effects.ts#L48)

## Type Parameters

### E

`E` *extends* `Element`

## Properties

### create()

> **create**: (`parent`) => `Element` \| `null`

Defined in: [src/lib/effects.ts:50](https://github.com/zeixcom/ui-element/blob/2605753812ae73569ed9fdbb08b86e62a74ff14d/src/lib/effects.ts#L50)

#### Parameters

##### parent

`E`

#### Returns

`Element` \| `null`

***

### position?

> `optional` **position**: `InsertPosition`

Defined in: [src/lib/effects.ts:49](https://github.com/zeixcom/ui-element/blob/2605753812ae73569ed9fdbb08b86e62a74ff14d/src/lib/effects.ts#L49)

***

### reject()?

> `optional` **reject**: (`error`) => `void`

Defined in: [src/lib/effects.ts:52](https://github.com/zeixcom/ui-element/blob/2605753812ae73569ed9fdbb08b86e62a74ff14d/src/lib/effects.ts#L52)

#### Parameters

##### error

`unknown`

#### Returns

`void`

***

### resolve()?

> `optional` **resolve**: (`parent`) => `void`

Defined in: [src/lib/effects.ts:51](https://github.com/zeixcom/ui-element/blob/2605753812ae73569ed9fdbb08b86e62a74ff14d/src/lib/effects.ts#L51)

#### Parameters

##### parent

`E`

#### Returns

`void`
