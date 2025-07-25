[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ElementSelector

# Type Alias: ElementSelector()\<P\>

> **ElementSelector**\<`P`\> = \{\<`S`\>(`selector`, `effects`, `required?`): (`host`) => `void` \| [`Cleanup`](Cleanup.md); \<`E`\>(`selector`, `effects`, `required?`): (`host`) => `void` \| [`Cleanup`](Cleanup.md); \}

Defined in: [src/component.ts:93](https://github.com/zeixcom/ui-element/blob/0e9cacf03a8f95418720628d5174fbb006152743/src/component.ts#L93)

## Type Parameters

### P

`P` *extends* [`ComponentProps`](ComponentProps.md)

## Call Signature

> \<`S`\>(`selector`, `effects`, `required?`): (`host`) => `void` \| [`Cleanup`](Cleanup.md)

### Type Parameters

#### S

`S` *extends* `string`

### Parameters

#### selector

`S`

#### effects

[`Effects`](Effects.md)\<`P`, [`ElementFromSelector`](ElementFromSelector.md)\<`S`\>\>

#### required?

`string`

### Returns

> (`host`): `void` \| [`Cleanup`](Cleanup.md)

#### Parameters

##### host

[`Component`](Component.md)\<`P`\>

#### Returns

`void` \| [`Cleanup`](Cleanup.md)

## Call Signature

> \<`E`\>(`selector`, `effects`, `required?`): (`host`) => `void` \| [`Cleanup`](Cleanup.md)

### Type Parameters

#### E

`E` *extends* `Element`

### Parameters

#### selector

`string`

#### effects

[`Effects`](Effects.md)\<`P`, `E`\>

#### required?

`string`

### Returns

> (`host`): `void` \| [`Cleanup`](Cleanup.md)

#### Parameters

##### host

[`Component`](Component.md)\<`P`\>

#### Returns

`void` \| [`Cleanup`](Cleanup.md)
