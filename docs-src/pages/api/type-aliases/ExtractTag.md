[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ExtractTag

# Type Alias: ExtractTag\<S\>

> **ExtractTag**\<`S`\> = `S` *extends* `` `${infer T}.${string}` `` ? `T` : `S` *extends* `` `${infer T}#${string}` `` ? `T` : `S` *extends* `` `${infer T}:${string}` `` ? `T` : `S` *extends* `` `${infer T}[${string}` `` ? `T` : `S`

Defined in: [src/core/dom.ts:20](https://github.com/zeixcom/ui-element/blob/bc5efd047a1ae7f13c4c9861e40f8a1b07b7e003/src/core/dom.ts#L20)

## Type Parameters

### S

`S` *extends* `string`
