[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / ExtractTag

# Type Alias: ExtractTag\<S\>

> **ExtractTag**\<`S`\> = `S` *extends* `` `${infer T}.${string}` `` ? `T` : `S` *extends* `` `${infer T}#${string}` `` ? `T` : `S` *extends* `` `${infer T}:${string}` `` ? `T` : `S` *extends* `` `${infer T}[${string}` `` ? `T` : `S`

Defined in: [src/core/dom.ts:20](https://github.com/zeixcom/ui-element/blob/b9ddf83c928c93d84a49a796a2342da755e4896e/src/core/dom.ts#L20)

## Type Parameters

### S

`S` *extends* `string`
