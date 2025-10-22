[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / Reactive

# Type Alias: Reactive\<T, P, E\>

> **Reactive**\<`T`, `P`, `E`\> = keyof `P` \| [`Signal`](Signal.md)\<`NonNullable`\<`T`\>\> \| [`LooseExtractor`](LooseExtractor.md)\<`T` \| `null` \| `undefined`, `E`\>

Defined in: [src/core/reactive.ts:26](https://github.com/zeixcom/ui-element/blob/b9ddf83c928c93d84a49a796a2342da755e4896e/src/core/reactive.ts#L26)

## Type Parameters

### T

`T`

### P

`P` *extends* [`ComponentProps`](ComponentProps.md)

### E

`E` *extends* `Element` = `HTMLElement`
