[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / SelectorFunctions

# Type Alias: SelectorFunctions\<P\>

> **SelectorFunctions**\<`P`\> = `object`

Defined in: [src/component.ts:86](https://github.com/zeixcom/ui-element/blob/f5c20c5e6da1a988462bc7f68d75f2a4c0200046/src/component.ts#L86)

## Type Parameters

### P

`P` *extends* [`ComponentProps`](ComponentProps.md)

## Properties

### all()

> **all**: \<`E`, `S`\>(`selector`, ...`effects`) => (`host`) => [`Cleanup`](Cleanup.md)

Defined in: [src/component.ts:91](https://github.com/zeixcom/ui-element/blob/f5c20c5e6da1a988462bc7f68d75f2a4c0200046/src/component.ts#L91)

#### Type Parameters

##### E

`E` *extends* `Element` = `never`

##### S

`S` *extends* `string` = `string`

#### Parameters

##### selector

`S`

##### effects

...[`Effect`](Effect.md)\<`P`, [`ElementFromSelector`](ElementFromSelector.md)\<`S`, `E`\>\>[]

#### Returns

> (`host`): [`Cleanup`](Cleanup.md)

##### Parameters

###### host

[`Component`](Component.md)\<`P`\>

##### Returns

[`Cleanup`](Cleanup.md)

***

### first()

> **first**: \<`E`, `S`\>(`selector`, ...`effects`) => (`host`) => [`Cleanup`](Cleanup.md) \| `void`

Defined in: [src/component.ts:87](https://github.com/zeixcom/ui-element/blob/f5c20c5e6da1a988462bc7f68d75f2a4c0200046/src/component.ts#L87)

#### Type Parameters

##### E

`E` *extends* `Element` = `never`

##### S

`S` *extends* `string` = `string`

#### Parameters

##### selector

`S`

##### effects

...[`Effect`](Effect.md)\<`P`, [`ElementFromSelector`](ElementFromSelector.md)\<`S`, `E`\>\>[]

#### Returns

> (`host`): [`Cleanup`](Cleanup.md) \| `void`

##### Parameters

###### host

[`Component`](Component.md)\<`P`\>

##### Returns

[`Cleanup`](Cleanup.md) \| `void`
