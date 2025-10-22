[**@zeix/le-truc**](../README.md)

---

[@zeix/le-truc](../globals.md) / EventTransformers

# Type Alias: EventTransformers\<T, E, C\>

> **EventTransformers**\<`T`, `E`, `C`\> = `{ [K in keyof HTMLElementEventMap]?: EventTransformer<T, E, C, EventType<K>> }`

Defined in: [src/core/events.ts:36](https://github.com/zeixcom/le-truc/blob/a2e3a5bb1b7ab9e964c80c41c9edbb895cf2ce79/src/core/events.ts#L36)

## Type Parameters

### T

`T` _extends_ `object`

### E

`E` _extends_ `Element`

### C

`C` _extends_ `HTMLElement`
