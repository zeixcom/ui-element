[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ExtractTag

# Type Alias: ExtractTag\<S\>

> **ExtractTag**\<`S`\> = `S` *extends* `` `${infer T}.${string}` `` ? `T` : `S` *extends* `` `${infer T}#${string}` `` ? `T` : `S` *extends* `` `${infer T}:${string}` `` ? `T` : `S` *extends* `` `${infer T}[${string}` `` ? `T` : `S`

Defined in: [src/core/dom.ts:20](https://github.com/zeixcom/ui-element/blob/a146453261eafa2845c03f05c1529bc1192370e6/src/core/dom.ts#L20)

## Type Parameters

### S

`S` *extends* `string`
