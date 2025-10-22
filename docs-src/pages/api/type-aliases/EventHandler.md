[**@zeix/le-truc**](../README.md)

---

[@zeix/le-truc](../globals.md) / EventHandler

# Type Alias: EventHandler()\<P, E, Evt\>

> **EventHandler**\<`P`, `E`, `Evt`\> = (`context`) => `{ [K in keyof P]?: P[K] }` \| `void`

Defined in: [src/core/events.ts:44](https://github.com/zeixcom/le-truc/blob/a2e3a5bb1b7ab9e964c80c41c9edbb895cf2ce79/src/core/events.ts#L44)

## Type Parameters

### P

`P` _extends_ [`ComponentProps`](ComponentProps.md)

### E

`E` _extends_ `Element`

### Evt

`Evt` _extends_ `Event`

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
