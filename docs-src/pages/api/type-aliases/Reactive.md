[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / Reactive

# Type Alias: Reactive\<T, P, E\>

> **Reactive**\<`T`, `P`, `E`\> = keyof `P` \| [`Signal`](Signal.md)\<`NonNullable`\<`T`\>\> \| [`LooseExtractor`](LooseExtractor.md)\<`T` \| `null` \| `undefined`, `E`\>

Defined in: [src/core/reactive.ts:26](https://github.com/zeixcom/ui-element/blob/d3571cdc68e3e4116ef066c6fac00c4d1c8957d3/src/core/reactive.ts#L26)

## Type Parameters

### T

`T`

### P

`P` *extends* [`ComponentProps`](ComponentProps.md)

### E

`E` *extends* `Element` = `HTMLElement`
