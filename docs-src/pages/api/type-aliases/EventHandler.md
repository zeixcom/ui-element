[**@zeix/el-truco**](../README.md)

***

[@zeix/el-truco](../globals.md) / EventHandler

# Type Alias: EventHandler()\<P, E, Evt\>

> **EventHandler**\<`P`, `E`, `Evt`\> = (`context`) => `{ [K in keyof P]?: P[K] }` \| `void` \| `Promise`\<`void`\>

Defined in: [src/core/events.ts:49](https://github.com/zeixcom/ui-element/blob/975417e4fd6cf23617fcf9b7b600f45b8f632860/src/core/events.ts#L49)

## Type Parameters

### P

`P` *extends* [`ComponentProps`](ComponentProps.md)

### E

`E` *extends* `Element`

### Evt

`Evt` *extends* `Event`

## Parameters

### context

#### event

`Evt`

#### host

[`Component`](Component.md)\<`P`\>

#### target

`E`

## Returns

`{ [K in keyof P]?: P[K] }` \| `void` \| `Promise`\<`void`\>
