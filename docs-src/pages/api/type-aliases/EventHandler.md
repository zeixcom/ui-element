[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / EventHandler

# Type Alias: EventHandler()\<P, E, Evt\>

> **EventHandler**\<`P`, `E`, `Evt`\> = (`context`) => `{ [K in keyof P]?: P[K] }` \| `void`

Defined in: [src/core/events.ts:49](https://github.com/zeixcom/ui-element/blob/1c318eb583bce4633e1df4a42dee77859303e28e/src/core/events.ts#L49)

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
