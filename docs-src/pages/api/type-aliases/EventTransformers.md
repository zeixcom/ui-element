[**@zeix/el-truco**](../README.md)

***

[@zeix/el-truco](../globals.md) / EventTransformers

# Type Alias: EventTransformers\<T, E, C\>

> **EventTransformers**\<`T`, `E`, `C`\> = `{ [K in keyof HTMLElementEventMap]?: EventTransformer<T, E, C, EventType<K>> }`

Defined in: [src/core/events.ts:41](https://github.com/zeixcom/ui-element/blob/975417e4fd6cf23617fcf9b7b600f45b8f632860/src/core/events.ts#L41)

## Type Parameters

### T

`T` *extends* `object`

### E

`E` *extends* `Element`

### C

`C` *extends* `HTMLElement`
