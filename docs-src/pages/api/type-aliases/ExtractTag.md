[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ExtractTag

# Type Alias: ExtractTag\<S\>

> **ExtractTag**\<`S`\> = `S` *extends* `` `${infer T}.${string}` `` ? `T` : `S` *extends* `` `${infer T}#${string}` `` ? `T` : `S` *extends* `` `${infer T}:${string}` `` ? `T` : `S` *extends* `` `${infer T}[${string}` `` ? `T` : `S`

Defined in: [src/core/dom.ts:20](https://github.com/zeixcom/ui-element/blob/a2e3a5bb1b7ab9e964c80c41c9edbb895cf2ce79/src/core/dom.ts#L20)

## Type Parameters

### S

`S` *extends* `string`
