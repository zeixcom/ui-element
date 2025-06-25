[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ElementUpdater

# Type Alias: ElementUpdater\<E, T\>

> **ElementUpdater**\<`E`, `T`\> = `object`

Defined in: [src/lib/effects.ts:36](https://github.com/zeixcom/ui-element/blob/a6fb4a88fd37bb5ca41823947687e8a37d5f2e08/src/lib/effects.ts#L36)

## Type Parameters

### E

`E` *extends* `Element`

### T

`T`

## Properties

### delete()?

> `optional` **delete**: (`element`) => `void`

Defined in: [src/lib/effects.ts:41](https://github.com/zeixcom/ui-element/blob/a6fb4a88fd37bb5ca41823947687e8a37d5f2e08/src/lib/effects.ts#L41)

#### Parameters

##### element

`E`

#### Returns

`void`

***

### name?

> `optional` **name**: `string`

Defined in: [src/lib/effects.ts:38](https://github.com/zeixcom/ui-element/blob/a6fb4a88fd37bb5ca41823947687e8a37d5f2e08/src/lib/effects.ts#L38)

***

### op

> **op**: [`UpdateOperation`](UpdateOperation.md)

Defined in: [src/lib/effects.ts:37](https://github.com/zeixcom/ui-element/blob/a6fb4a88fd37bb5ca41823947687e8a37d5f2e08/src/lib/effects.ts#L37)

***

### read()

> **read**: (`element`) => `T` \| `null`

Defined in: [src/lib/effects.ts:39](https://github.com/zeixcom/ui-element/blob/a6fb4a88fd37bb5ca41823947687e8a37d5f2e08/src/lib/effects.ts#L39)

#### Parameters

##### element

`E`

#### Returns

`T` \| `null`

***

### reject()?

> `optional` **reject**: (`error`) => `void`

Defined in: [src/lib/effects.ts:43](https://github.com/zeixcom/ui-element/blob/a6fb4a88fd37bb5ca41823947687e8a37d5f2e08/src/lib/effects.ts#L43)

#### Parameters

##### error

`unknown`

#### Returns

`void`

***

### resolve()?

> `optional` **resolve**: (`element`) => `void`

Defined in: [src/lib/effects.ts:42](https://github.com/zeixcom/ui-element/blob/a6fb4a88fd37bb5ca41823947687e8a37d5f2e08/src/lib/effects.ts#L42)

#### Parameters

##### element

`E`

#### Returns

`void`

***

### update()

> **update**: (`element`, `value`) => `void`

Defined in: [src/lib/effects.ts:40](https://github.com/zeixcom/ui-element/blob/a6fb4a88fd37bb5ca41823947687e8a37d5f2e08/src/lib/effects.ts#L40)

#### Parameters

##### element

`E`

##### value

`T`

#### Returns

`void`
