[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ElementSelector

# Type Alias: ElementSelector()\<P\>

> **ElementSelector**\<`P`\> = \<`E`, `S`\>(`selector`, `effects`, `required?`) => (`host`) => [`Cleanup`](Cleanup.md) \| `void`

Defined in: [src/component.ts:93](https://github.com/zeixcom/ui-element/blob/59d79a082870e892722e0aaa0f251617218ab48f/src/component.ts#L93)

## Type Parameters

### P

`P` *extends* [`ComponentProps`](ComponentProps.md)

## Type Parameters

### E

`E` *extends* `Element` = `HTMLElement`

### S

`S` *extends* `string` = `string`

## Parameters

### selector

`S`

### effects

[`Effects`](Effects.md)\<`P`, [`ElementFromSelector`](ElementFromSelector.md)\<`S`, `E`\>\>

### required?

`string`

## Returns

> (`host`): [`Cleanup`](Cleanup.md) \| `void`

### Parameters

#### host

[`Component`](Component.md)\<`P`\>

### Returns

[`Cleanup`](Cleanup.md) \| `void`
