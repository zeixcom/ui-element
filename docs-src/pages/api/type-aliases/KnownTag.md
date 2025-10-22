[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / KnownTag

# Type Alias: KnownTag\<S\>

> **KnownTag**\<`S`\> = `Lowercase`\<[`ExtractTag`](ExtractTag.md)\<`S`\>\> *extends* keyof `HTMLElementTagNameMap` \| keyof `SVGElementTagNameMap` \| keyof `MathMLElementTagNameMap` ? `Lowercase`\<[`ExtractTag`](ExtractTag.md)\<`S`\>\> : `never`

Defined in: [src/core/dom.ts:31](https://github.com/zeixcom/ui-element/blob/b9ddf83c928c93d84a49a796a2342da755e4896e/src/core/dom.ts#L31)

## Type Parameters

### S

`S` *extends* `string`
