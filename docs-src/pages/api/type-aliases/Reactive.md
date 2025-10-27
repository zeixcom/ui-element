[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / Reactive

# Type Alias: Reactive\<T, P, E\>

> **Reactive**\<`T`, `P`, `E`\> = keyof `P` \| [`Signal`](Signal.md)\<`NonNullable`\<`T`\>\> \| [`LooseExtractor`](LooseExtractor.md)\<`T` \| `null` \| `undefined`, `E`\>

Defined in: [src/core/reactive.ts:26](https://github.com/zeixcom/ui-element/blob/e2d0534c92417874d64304e2f9afb7062e5cf6fa/src/core/reactive.ts#L26)

## Type Parameters

### T

`T`

### P

`P` *extends* [`ComponentProps`](ComponentProps.md)

### E

`E` *extends* `Element` = `HTMLElement`
