[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / Component

# Type Alias: Component\<P\>

> **Component**\<`P`\> = `HTMLElement` & `P` & `object`

Defined in: [src/component.ts:61](https://github.com/zeixcom/ui-element/blob/e3fa79e199a97014fba6af2a6cf8cb55be8076c3/src/component.ts#L61)

## Type declaration

### debug?

> `optional` **debug**: `boolean`

### attributeChangedCallback()

> **attributeChangedCallback**\<`K`\>(`name`, `oldValue`, `newValue`): `void`

#### Type Parameters

##### K

`K` *extends* `string`

#### Parameters

##### name

`K`

##### oldValue

`null` | `string`

##### newValue

`null` | `string`

#### Returns

`void`

### getSignal()

> **getSignal**\<`K`\>(`prop`): [`Signal`](Signal.md)\<`P`\[`K`\]\>

#### Type Parameters

##### K

`K` *extends* `string`

#### Parameters

##### prop

`K`

#### Returns

[`Signal`](Signal.md)\<`P`\[`K`\]\>

### setSignal()

> **setSignal**\<`K`\>(`prop`, `signal`): `void`

#### Type Parameters

##### K

`K` *extends* `string`

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
