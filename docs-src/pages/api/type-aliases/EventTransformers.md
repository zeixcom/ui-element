[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / EventTransformers

# Type Alias: EventTransformers\<T, E, C\>

> **EventTransformers**\<`T`, `E`, `C`\> = `{ [K in keyof HTMLElementEventMap]?: EventTransformer<T, E, C, EventType<K>> }`

Defined in: [src/core/events.ts:36](https://github.com/zeixcom/ui-element/blob/1c934178f8926c03a10af2b29ad6cc201eead501/src/core/events.ts#L36)

## Type Parameters

### T

`T` *extends* `object`

### E

`E` *extends* `Element`

### C

`C` *extends* `HTMLElement`
