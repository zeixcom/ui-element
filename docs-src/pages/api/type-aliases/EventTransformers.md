[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / EventTransformers

# Type Alias: EventTransformers\<T, E, C\>

> **EventTransformers**\<`T`, `E`, `C`\> = `{ [K in keyof HTMLElementEventMap]?: EventTransformer<T, E, C, EventType<K>> }`

Defined in: [src/core/events.ts:41](https://github.com/zeixcom/ui-element/blob/1c318eb583bce4633e1df4a42dee77859303e28e/src/core/events.ts#L41)

## Type Parameters

### T

`T` *extends* `object`

### E

`E` *extends* `Element`

### C

`C` *extends* `HTMLElement`
