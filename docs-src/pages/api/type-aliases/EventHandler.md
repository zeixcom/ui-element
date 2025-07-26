[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / EventHandler

# Type Alias: EventHandler()\<P, E, Evt\>

> **EventHandler**\<`P`, `E`, `Evt`\> = (`context`) => `{ [K in keyof P]?: P[K] }` \| `void`

Defined in: [src/core/events.ts:49](https://github.com/zeixcom/ui-element/blob/e844a8875dcc0f1e1c331a07fc308d56d924c955/src/core/events.ts#L49)

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

`{ [K in keyof P]?: P[K] }` \| `void`
