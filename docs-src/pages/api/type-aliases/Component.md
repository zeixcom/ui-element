[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / Component

# Type Alias: Component\<P\>

> **Component**\<`P`\> = `HTMLElement` & `P` & `object`

Defined in: [src/component.ts:42](https://github.com/zeixcom/ui-element/blob/e1c0693393151dbc67087d7dde9d2a2f9e7dd58b/src/component.ts#L42)

## Type declaration

### debug?

> `optional` **debug**: `boolean`

### shadowRoot

> **shadowRoot**: `ShadowRoot` \| `null`

### adoptedCallback()?

> `optional` **adoptedCallback**(): `void`

#### Returns

`void`

### attributeChangedCallback()

> **attributeChangedCallback**(`name`, `oldValue`, `newValue`): `void`

#### Parameters

##### name

`string`

##### oldValue

`null` | `string`

##### newValue

`null` | `string`

#### Returns

`void`

### connectedCallback()

> **connectedCallback**(): `void`

#### Returns

`void`

### disconnectedCallback()

> **disconnectedCallback**(): `void`

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
