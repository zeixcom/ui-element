[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / SelectorFunctions

# Type Alias: SelectorFunctions\<P\>

> **SelectorFunctions**\<`P`\> = `object`

Defined in: [src/component.ts:91](https://github.com/zeixcom/ui-element/blob/8a5f554f7f150bc30f3cc67f612a4c3067704cb6/src/component.ts#L91)

## Type Parameters

### P

`P` *extends* [`ComponentProps`](ComponentProps.md)

## Properties

### all()

> **all**: \<`E`, `K`\>(`selector`, ...`fns`) => (`host`) => [`Cleanup`](Cleanup.md)

Defined in: [src/component.ts:96](https://github.com/zeixcom/ui-element/blob/8a5f554f7f150bc30f3cc67f612a4c3067704cb6/src/component.ts#L96)

#### Type Parameters

##### E

`E` *extends* `Element` = `never`

##### K

`K` *extends* `string` = `string`

#### Parameters

##### selector

`K`

##### fns

...[`FxFunction`](FxFunction.md)\<`P`, [`ElementFromSelector`](ElementFromSelector.md)\<`K`, `E`\>\>[]

#### Returns

> (`host`): [`Cleanup`](Cleanup.md)

##### Parameters

###### host

[`Component`](Component.md)\<`P`\>

##### Returns

[`Cleanup`](Cleanup.md)

***

### first()

> **first**: \<`E`, `K`\>(`selector`, ...`fns`) => (`host`) => [`Cleanup`](Cleanup.md) \| `void`

Defined in: [src/component.ts:92](https://github.com/zeixcom/ui-element/blob/8a5f554f7f150bc30f3cc67f612a4c3067704cb6/src/component.ts#L92)

#### Type Parameters

##### E

`E` *extends* `Element` = `never`

##### K

`K` *extends* `string` = `string`

#### Parameters

##### selector

`K`

##### fns

...[`FxFunction`](FxFunction.md)\<`P`, [`ElementFromSelector`](ElementFromSelector.md)\<`K`, `E`\>\>[]

#### Returns

> (`host`): [`Cleanup`](Cleanup.md) \| `void`

##### Parameters

###### host

[`Component`](Component.md)\<`P`\>

##### Returns

[`Cleanup`](Cleanup.md) \| `void`
