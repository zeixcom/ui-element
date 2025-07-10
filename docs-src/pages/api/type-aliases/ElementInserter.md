[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ElementInserter

# Type Alias: ElementInserter\<E\>

> **ElementInserter**\<`E`\> = `object`

Defined in: [src/lib/effects.ts:55](https://github.com/zeixcom/ui-element/blob/f80be4b02c5d1c80817271ddf0fad982e43ad03e/src/lib/effects.ts#L55)

## Type Parameters

### E

`E` *extends* `Element`

## Properties

### create()

> **create**: (`parent`) => `Element` \| `null`

Defined in: [src/lib/effects.ts:57](https://github.com/zeixcom/ui-element/blob/f80be4b02c5d1c80817271ddf0fad982e43ad03e/src/lib/effects.ts#L57)

#### Parameters

##### parent

`E`

#### Returns

`Element` \| `null`

***

### position?

> `optional` **position**: `InsertPosition`

Defined in: [src/lib/effects.ts:56](https://github.com/zeixcom/ui-element/blob/f80be4b02c5d1c80817271ddf0fad982e43ad03e/src/lib/effects.ts#L56)

***

### reject()?

> `optional` **reject**: (`error`) => `void`

Defined in: [src/lib/effects.ts:59](https://github.com/zeixcom/ui-element/blob/f80be4b02c5d1c80817271ddf0fad982e43ad03e/src/lib/effects.ts#L59)

#### Parameters

##### error

`unknown`

#### Returns

`void`

***

### resolve()?

> `optional` **resolve**: (`parent`) => `void`

Defined in: [src/lib/effects.ts:58](https://github.com/zeixcom/ui-element/blob/f80be4b02c5d1c80817271ddf0fad982e43ad03e/src/lib/effects.ts#L58)

#### Parameters

##### parent

`E`

#### Returns

`void`
