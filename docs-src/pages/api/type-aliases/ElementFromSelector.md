[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / ElementFromSelector

# Type Alias: ElementFromSelector\<S\>

> **ElementFromSelector**\<`S`\> = [`KnownTag`](KnownTag.md)\<`S`\> *extends* `never` ? `HTMLElement` : [`KnownTag`](KnownTag.md)\<`S`\> *extends* keyof `HTMLElementTagNameMap` ? `HTMLElementTagNameMap`\[[`KnownTag`](KnownTag.md)\<`S`\>\] : [`KnownTag`](KnownTag.md)\<`S`\> *extends* keyof `SVGElementTagNameMap` ? `SVGElementTagNameMap`\[[`KnownTag`](KnownTag.md)\<`S`\>\] : [`KnownTag`](KnownTag.md)\<`S`\> *extends* keyof `MathMLElementTagNameMap` ? `MathMLElementTagNameMap`\[[`KnownTag`](KnownTag.md)\<`S`\>\] : `HTMLElement`

Defined in: [src/core/dom.ts:40](https://github.com/zeixcom/ui-element/blob/230cd6cc9b2252d1741350e7be8be3e04b6f2cf4/src/core/dom.ts#L40)

## Type Parameters

### S

`S` *extends* `string`
