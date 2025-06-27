[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / Component

# Type Alias: Component\<P\>

> **Component**\<`P`\> = `HTMLElement` & `P` & `object`

Defined in: [src/component.ts:42](https://github.com/zeixcom/ui-element/blob/8a5f554f7f150bc30f3cc67f612a4c3067704cb6/src/component.ts#L42)

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

> **getSignal**(`prop`): [`Signal`](Signal.md)\<`P`\[keyof `P`\]\>

#### Parameters

##### prop

keyof `P`

#### Returns

[`Signal`](Signal.md)\<`P`\[keyof `P`\]\>

### setSignal()

> **setSignal**(`prop`, `signal`): `void`

#### Parameters

##### prop

keyof `P`

##### signal

[`Signal`](Signal.md)\<`P`\[keyof `P`\]\>

#### Returns

`void`

## Type Parameters

### P

`P` *extends* [`ComponentProps`](ComponentProps.md)
