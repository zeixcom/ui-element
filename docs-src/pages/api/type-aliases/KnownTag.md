[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / KnownTag

# Type Alias: KnownTag\<S\>

> **KnownTag**\<`S`\> = `Lowercase`\<[`ExtractTag`](ExtractTag.md)\<`S`\>\> *extends* keyof `HTMLElementTagNameMap` \| keyof `SVGElementTagNameMap` \| keyof `MathMLElementTagNameMap` ? `Lowercase`\<[`ExtractTag`](ExtractTag.md)\<`S`\>\> : `never`

Defined in: [src/core/dom.ts:31](https://github.com/zeixcom/ui-element/blob/e2d0534c92417874d64304e2f9afb7062e5cf6fa/src/core/dom.ts#L31)

## Type Parameters

### S

`S` *extends* `string`
