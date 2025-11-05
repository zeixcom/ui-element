[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / Component

# Type Alias: Component\<P\>

> **Component**\<`P`\> = `HTMLElement` & `P` & `object`

Defined in: [src/component.ts:60](https://github.com/zeixcom/ui-element/blob/d3571cdc68e3e4116ef066c6fac00c4d1c8957d3/src/component.ts#L60)

## Type Declaration

### debug?

> `optional` **debug**: `boolean`

### attributeChangedCallback()

> **attributeChangedCallback**\<`K`\>(`name`, `oldValue`, `newValue`): `void`

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### name

`K`

##### oldValue

`string` | `null`

##### newValue

`string` | `null`

#### Returns

`void`

### getSignal()

> **getSignal**\<`K`\>(`prop`): [`Signal`](Signal.md)\<`P`\[`K`\]\>

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### prop

`K`

#### Returns

[`Signal`](Signal.md)\<`P`\[`K`\]\>

### setSignal()

> **setSignal**\<`K`\>(`prop`, `signal`): `void`

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### prop

`K`

##### signal

[`Signal`](Signal.md)\<`P`\[`K`\]\>

#### Returns

`void`

## Type Parameters

### P

`P` *extends* [`ComponentProps`](ComponentProps.md)
