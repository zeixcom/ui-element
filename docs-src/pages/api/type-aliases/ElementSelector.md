[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ElementSelector

# Type Alias: ElementSelector()\<P\>

> **ElementSelector**\<`P`\> = \{\<`S`\>(`selector`, `effects`, `required?`): (`host`) => `void` \| [`Cleanup`](Cleanup.md); \<`E`\>(`selector`, `effects`, `required?`): (`host`) => `void` \| [`Cleanup`](Cleanup.md); \}

Defined in: [src/component.ts:94](https://github.com/zeixcom/ui-element/blob/e844a8875dcc0f1e1c331a07fc308d56d924c955/src/component.ts#L94)

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
