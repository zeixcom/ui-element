[**@zeix/le-truc**](../README.md)

---

[@zeix/le-truc](../globals.md) / Component

# Type Alias: Component\<P\>

> **Component**\<`P`\> = `HTMLElement` & `P` & `object`

Defined in: [src/component.ts:59](https://github.com/zeixcom/le-truc/blob/a2e3a5bb1b7ab9e964c80c41c9edbb895cf2ce79/src/component.ts#L59)

## Type declaration

### debug?

> `optional` **debug**: `boolean`

### attributeChangedCallback()

> **attributeChangedCallback**\<`K`\>(`name`, `oldValue`, `newValue`): `void`

#### Type Parameters

##### K

`K` _extends_ `string`

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

`K` _extends_ `string`

#### Parameters

##### prop

`K`

#### Returns

[`Signal`](Signal.md)\<`P`\[`K`\]\>

### setSignal()

> **setSignal**\<`K`\>(`prop`, `signal`): `void`

#### Type Parameters

##### K

`K` _extends_ `string`

#### Parameters

##### prop

`K`

##### signal

[`Signal`](Signal.md)\<`P`\[`K`\]\>

#### Returns

`void`

## Type Parameters

### P

`P` _extends_ [`ComponentProps`](ComponentProps.md)
