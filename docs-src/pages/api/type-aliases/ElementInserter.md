[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ElementInserter

# Type Alias: ElementInserter\<E\>

> **ElementInserter**\<`E`\> = `object`

Defined in: [src/lib/effects.ts:54](https://github.com/zeixcom/ui-element/blob/e1c0693393151dbc67087d7dde9d2a2f9e7dd58b/src/lib/effects.ts#L54)

## Type Parameters

### E

`E` *extends* `Element`

## Properties

### create()

> **create**: (`parent`) => `Element` \| `null`

Defined in: [src/lib/effects.ts:56](https://github.com/zeixcom/ui-element/blob/e1c0693393151dbc67087d7dde9d2a2f9e7dd58b/src/lib/effects.ts#L56)

#### Parameters

##### parent

`E`

#### Returns

`Element` \| `null`

***

### position?

> `optional` **position**: `InsertPosition`

Defined in: [src/lib/effects.ts:55](https://github.com/zeixcom/ui-element/blob/e1c0693393151dbc67087d7dde9d2a2f9e7dd58b/src/lib/effects.ts#L55)

***

### reject()?

> `optional` **reject**: (`error`) => `void`

Defined in: [src/lib/effects.ts:58](https://github.com/zeixcom/ui-element/blob/e1c0693393151dbc67087d7dde9d2a2f9e7dd58b/src/lib/effects.ts#L58)

#### Parameters

##### error

`unknown`

#### Returns

`void`

***

### resolve()?

> `optional` **resolve**: (`parent`) => `void`

Defined in: [src/lib/effects.ts:57](https://github.com/zeixcom/ui-element/blob/e1c0693393151dbc67087d7dde9d2a2f9e7dd58b/src/lib/effects.ts#L57)

#### Parameters

##### parent

`E`

#### Returns

`void`
