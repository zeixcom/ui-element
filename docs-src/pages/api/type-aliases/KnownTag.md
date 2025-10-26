[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / KnownTag

# Type Alias: KnownTag\<S\>

> **KnownTag**\<`S`\> = `Lowercase`\<[`ExtractTag`](ExtractTag.md)\<`S`\>\> *extends* keyof `HTMLElementTagNameMap` \| keyof `SVGElementTagNameMap` \| keyof `MathMLElementTagNameMap` ? `Lowercase`\<[`ExtractTag`](ExtractTag.md)\<`S`\>\> : `never`

Defined in: [src/core/dom.ts:31](https://github.com/zeixcom/ui-element/blob/6f2dec0b8de4a8a6010a0f1311d8457054510e5b/src/core/dom.ts#L31)

## Type Parameters

### S

`S` *extends* `string`
