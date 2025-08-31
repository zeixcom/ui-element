[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ExtractTag

# Type Alias: ExtractTag\<S\>

> **ExtractTag**\<`S`\> = `S` *extends* `` `${infer T}.${string}` `` ? `T` : `S` *extends* `` `${infer T}#${string}` `` ? `T` : `S` *extends* `` `${infer T}:${string}` `` ? `T` : `S` *extends* `` `${infer T}[${string}` `` ? `T` : `S`

Defined in: [src/core/dom.ts:20](https://github.com/zeixcom/ui-element/blob/e094bd31ef74080268e6d1b7a25d938efebeb3ee/src/core/dom.ts#L20)

## Type Parameters

### S

`S` *extends* `string`
