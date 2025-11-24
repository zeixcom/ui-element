[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / EventTransformers

# Type Alias: EventTransformers\<T, E, C\>

> **EventTransformers**\<`T`, `E`, `C`\> = `{ [K in keyof HTMLElementEventMap]?: EventTransformer<T, E, C, EventType<K>> }`

Defined in: [src/core/events.ts:41](https://github.com/zeixcom/ui-element/blob/95bb6f2fa5df3c16f08fcbbecd9622c693742c39/src/core/events.ts#L41)

## Type Parameters

### T

`T` *extends* `object`

### E

`E` *extends* `Element`

### C

`C` *extends* `HTMLElement`
