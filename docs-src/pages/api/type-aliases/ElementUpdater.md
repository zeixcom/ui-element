[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ElementUpdater

# Type Alias: ElementUpdater\<E, T\>

> **ElementUpdater**\<`E`, `T`\> = `object`

Defined in: [src/lib/effects.ts:45](https://github.com/efflore/ui-element/blob/6f13c4cee43b2a37b146c096e1a255409b73e79b/src/lib/effects.ts#L45)

## Type Parameters

### E

`E` *extends* `Element`

### T

`T`

## Properties

### delete()?

> `optional` **delete**: (`element`) => `void`

Defined in: [src/lib/effects.ts:50](https://github.com/efflore/ui-element/blob/6f13c4cee43b2a37b146c096e1a255409b73e79b/src/lib/effects.ts#L50)

#### Parameters

##### element

`E`

#### Returns

`void`

***

### name?

> `optional` **name**: `string`

Defined in: [src/lib/effects.ts:47](https://github.com/efflore/ui-element/blob/6f13c4cee43b2a37b146c096e1a255409b73e79b/src/lib/effects.ts#L47)

***

### op

> **op**: [`UpdateOperation`](UpdateOperation.md)

Defined in: [src/lib/effects.ts:46](https://github.com/efflore/ui-element/blob/6f13c4cee43b2a37b146c096e1a255409b73e79b/src/lib/effects.ts#L46)

***

### read()

> **read**: (`element`) => `T` \| `null`

Defined in: [src/lib/effects.ts:48](https://github.com/efflore/ui-element/blob/6f13c4cee43b2a37b146c096e1a255409b73e79b/src/lib/effects.ts#L48)

#### Parameters

##### element

`E`

#### Returns

`T` \| `null`

***

### reject()?

> `optional` **reject**: (`error`) => `void`

Defined in: [src/lib/effects.ts:52](https://github.com/efflore/ui-element/blob/6f13c4cee43b2a37b146c096e1a255409b73e79b/src/lib/effects.ts#L52)

#### Parameters

##### error

`unknown`

#### Returns

`void`

***

### resolve()?

> `optional` **resolve**: (`element`) => `void`

Defined in: [src/lib/effects.ts:51](https://github.com/efflore/ui-element/blob/6f13c4cee43b2a37b146c096e1a255409b73e79b/src/lib/effects.ts#L51)

#### Parameters

##### element

`E`

#### Returns

`void`

***

### update()

> **update**: (`element`, `value`) => `void`

Defined in: [src/lib/effects.ts:49](https://github.com/efflore/ui-element/blob/6f13c4cee43b2a37b146c096e1a255409b73e79b/src/lib/effects.ts#L49)

#### Parameters

##### element

`E`

##### value

`T`

#### Returns

`void`
