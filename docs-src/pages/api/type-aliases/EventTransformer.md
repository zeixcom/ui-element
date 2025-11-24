[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / EventTransformer

# Type Alias: EventTransformer()\<T, E, C, Evt\>

> **EventTransformer**\<`T`, `E`, `C`, `Evt`\> = (`context`) => `T` \| `void` \| `Promise`\<`void`\>

Defined in: [src/core/events.ts:29](https://github.com/zeixcom/ui-element/blob/95bb6f2fa5df3c16f08fcbbecd9622c693742c39/src/core/events.ts#L29)

## Type Parameters

### T

`T` *extends* `object`

### E

`E` *extends* `Element`

### C

`C` *extends* `HTMLElement`

### Evt

`Evt` *extends* `Event`

## Parameters

### context

#### event

`Evt`

#### host

`C`

#### target

`E`

#### value

`T`

## Returns

`T` \| `void` \| `Promise`\<`void`\>
