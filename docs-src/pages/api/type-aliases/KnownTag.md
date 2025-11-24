[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / KnownTag

# Type Alias: KnownTag\<S\>

> **KnownTag**\<`S`\> = `Lowercase`\<[`ExtractTag`](ExtractTag.md)\<`S`\>\> *extends* keyof `HTMLElementTagNameMap` \| keyof `SVGElementTagNameMap` \| keyof `MathMLElementTagNameMap` ? `Lowercase`\<[`ExtractTag`](ExtractTag.md)\<`S`\>\> : `never`

Defined in: [src/core/dom.ts:33](https://github.com/zeixcom/ui-element/blob/95bb6f2fa5df3c16f08fcbbecd9622c693742c39/src/core/dom.ts#L33)

## Type Parameters

### S

`S` *extends* `string`
