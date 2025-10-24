[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / Reactive

# Type Alias: Reactive\<T, P, E\>

> **Reactive**\<`T`, `P`, `E`\> = keyof `P` \| [`Signal`](Signal.md)\<`NonNullable`\<`T`\>\> \| [`LooseExtractor`](LooseExtractor.md)\<`T` \| `null` \| `undefined`, `E`\>

Defined in: [src/core/reactive.ts:26](https://github.com/zeixcom/ui-element/blob/824b5fcbd5a33ce95b6c2a43bfe0cce0fd18afb8/src/core/reactive.ts#L26)

## Type Parameters

### T

`T`

### P

`P` *extends* [`ComponentProps`](ComponentProps.md)

### E

`E` *extends* `Element` = `HTMLElement`
