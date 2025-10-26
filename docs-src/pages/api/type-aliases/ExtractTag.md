[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / ExtractTag

# Type Alias: ExtractTag\<S\>

> **ExtractTag**\<`S`\> = `S` *extends* `` `${infer T}.${string}` `` ? `T` : `S` *extends* `` `${infer T}#${string}` `` ? `T` : `S` *extends* `` `${infer T}:${string}` `` ? `T` : `S` *extends* `` `${infer T}[${string}` `` ? `T` : `S`

Defined in: [src/core/dom.ts:20](https://github.com/zeixcom/ui-element/blob/6f2dec0b8de4a8a6010a0f1311d8457054510e5b/src/core/dom.ts#L20)

## Type Parameters

### S

`S` *extends* `string`
