[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / EventHandler

# Type Alias: EventHandler()\<P, E, Evt\>

> **EventHandler**\<`P`, `E`, `Evt`\> = (`context`) => `{ [K in keyof P]?: P[K] }` \| `void`

Defined in: [src/core/events.ts:44](https://github.com/zeixcom/ui-element/blob/824b5fcbd5a33ce95b6c2a43bfe0cce0fd18afb8/src/core/events.ts#L44)

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
