[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / EventTransformers

# Type Alias: EventTransformers\<T, E, C\>

> **EventTransformers**\<`T`, `E`, `C`\> = `{ [K in keyof HTMLElementEventMap]?: EventTransformer<T, E, C, EventType<K>> }`

Defined in: [src/core/events.ts:36](https://github.com/zeixcom/ui-element/blob/824b5fcbd5a33ce95b6c2a43bfe0cce0fd18afb8/src/core/events.ts#L36)

## Type Parameters

### T

`T` *extends* `object`

### E

`E` *extends* `Element`

### C

`C` *extends* `HTMLElement`
