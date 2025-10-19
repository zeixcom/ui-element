[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ExtractTag

# Type Alias: ExtractTag\<S\>

> **ExtractTag**\<`S`\> = `S` *extends* `` `${infer T}.${string}` `` ? `T` : `S` *extends* `` `${infer T}#${string}` `` ? `T` : `S` *extends* `` `${infer T}:${string}` `` ? `T` : `S` *extends* `` `${infer T}[${string}` `` ? `T` : `S`

Defined in: [src/core/dom.ts:20](https://github.com/zeixcom/ui-element/blob/0bdd451e0266b456b3ed7c56ab9ac6ad476a6f80/src/core/dom.ts#L20)

## Type Parameters

### S

`S` *extends* `string`
