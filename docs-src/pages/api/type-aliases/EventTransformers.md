[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / EventTransformers

# Type Alias: EventTransformers\<T, E, C\>

> **EventTransformers**\<`T`, `E`, `C`\> = `{ [K in keyof HTMLElementEventMap]?: EventTransformer<T, E, C, EventType<K>> }`

Defined in: [src/core/events.ts:36](https://github.com/zeixcom/ui-element/blob/a3d8c74b49b5869fe7d19ae9f979ed1d37f1f695/src/core/events.ts#L36)

## Type Parameters

### T

`T` *extends* `object`

### E

`E` *extends* `Element`

### C

`C` *extends* `HTMLElement`
