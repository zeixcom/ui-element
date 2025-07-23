[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / SelectorFunctions

# Type Alias: SelectorFunctions\<P\>

> **SelectorFunctions**\<`P`\> = `object`

Defined in: [src/component.ts:97](https://github.com/zeixcom/ui-element/blob/297c0e8e040b3880ad85a2bc873523a8086f09a3/src/component.ts#L97)

## Type Parameters

### P

`P` *extends* [`ComponentProps`](ComponentProps.md)

## Properties

### all()

> **all**: \<`E`, `K`\>(`selector`, ...`fns`) => (`host`) => [`Cleanup`](Cleanup.md)

Defined in: [src/component.ts:102](https://github.com/zeixcom/ui-element/blob/297c0e8e040b3880ad85a2bc873523a8086f09a3/src/component.ts#L102)

#### Type Parameters

##### E

`E` *extends* `Element` = `never`

##### K

`K` *extends* `string` = `string`

#### Parameters

##### selector

`K`

##### fns

...[`Effect`](Effect.md)\<`P`, [`ElementFromSelector`](ElementFromSelector.md)\<`K`, `E`\>\>[]

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

Defined in: [src/component.ts:98](https://github.com/zeixcom/ui-element/blob/297c0e8e040b3880ad85a2bc873523a8086f09a3/src/component.ts#L98)

#### Type Parameters

##### E

`E` *extends* `Element` = `never`

##### K

`K` *extends* `string` = `string`

#### Parameters

##### selector

`K`

##### fns

...[`Effect`](Effect.md)\<`P`, [`ElementFromSelector`](ElementFromSelector.md)\<`K`, `E`\>\>[]

#### Returns

> (`host`): [`Cleanup`](Cleanup.md) \| `void`

##### Parameters

###### host

[`Component`](Component.md)\<`P`\>

##### Returns

[`Cleanup`](Cleanup.md) \| `void`
