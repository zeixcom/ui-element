[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / EventTransformers

# Type Alias: EventTransformers\<T, E, C\>

> **EventTransformers**\<`T`, `E`, `C`\> = `{ [K in keyof HTMLElementEventMap]?: EventTransformer<T, E, C, EventType<K>> }`

Defined in: [src/core/events.ts:36](https://github.com/zeixcom/ui-element/blob/d8ce494088eb3ef4e25b26c5f9ab59c8ffc0b7d8/src/core/events.ts#L36)

## Type Parameters

### T

`T` *extends* `object`

### E

`E` *extends* `Element`

### C

`C` *extends* `HTMLElement`
