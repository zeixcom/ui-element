[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / Component

# Type Alias: Component\<P\>

> **Component**\<`P`\> = `HTMLElement` & `P` & `object`

Defined in: [src/component.ts:59](https://github.com/zeixcom/ui-element/blob/333374b65ccc17c36a30cb41ca66f6ca0a5c37d0/src/component.ts#L59)

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
