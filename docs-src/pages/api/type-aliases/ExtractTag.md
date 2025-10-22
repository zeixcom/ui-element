[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / ExtractTag

# Type Alias: ExtractTag\<S\>

> **ExtractTag**\<`S`\> = `S` *extends* `` `${infer T}.${string}` `` ? `T` : `S` *extends* `` `${infer T}#${string}` `` ? `T` : `S` *extends* `` `${infer T}:${string}` `` ? `T` : `S` *extends* `` `${infer T}[${string}` `` ? `T` : `S`

Defined in: [src/core/dom.ts:20](https://github.com/zeixcom/ui-element/blob/230cd6cc9b2252d1741350e7be8be3e04b6f2cf4/src/core/dom.ts#L20)

## Type Parameters

### S

`S` *extends* `string`
