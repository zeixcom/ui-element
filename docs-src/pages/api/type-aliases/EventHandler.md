[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / EventHandler

# Type Alias: EventHandler()\<P, E, Evt\>

> **EventHandler**\<`P`, `E`, `Evt`\> = (`context`) => `{ [K in keyof P]?: P[K] }` \| `void`

Defined in: [src/core/events.ts:44](https://github.com/zeixcom/ui-element/blob/d3571cdc68e3e4116ef066c6fac00c4d1c8957d3/src/core/events.ts#L44)

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
