[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / ExtractTag

# Type Alias: ExtractTag\<S\>

> **ExtractTag**\<`S`\> = `S` *extends* `` `${infer T}.${string}` `` ? `T` : `S` *extends* `` `${infer T}#${string}` `` ? `T` : `S` *extends* `` `${infer T}:${string}` `` ? `T` : `S` *extends* `` `${infer T}[${string}` `` ? `T` : `S`

Defined in: [src/core/dom.ts:20](https://github.com/zeixcom/ui-element/blob/e2d0534c92417874d64304e2f9afb7062e5cf6fa/src/core/dom.ts#L20)

## Type Parameters

### S

`S` *extends* `string`
