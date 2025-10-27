[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / ElementFromSelector

# Type Alias: ElementFromSelector\<S\>

> **ElementFromSelector**\<`S`\> = [`KnownTag`](KnownTag.md)\<`S`\> *extends* `never` ? `HTMLElement` : [`KnownTag`](KnownTag.md)\<`S`\> *extends* keyof `HTMLElementTagNameMap` ? `HTMLElementTagNameMap`\[[`KnownTag`](KnownTag.md)\<`S`\>\] : [`KnownTag`](KnownTag.md)\<`S`\> *extends* keyof `SVGElementTagNameMap` ? `SVGElementTagNameMap`\[[`KnownTag`](KnownTag.md)\<`S`\>\] : [`KnownTag`](KnownTag.md)\<`S`\> *extends* keyof `MathMLElementTagNameMap` ? `MathMLElementTagNameMap`\[[`KnownTag`](KnownTag.md)\<`S`\>\] : `HTMLElement`

Defined in: [src/core/dom.ts:40](https://github.com/zeixcom/ui-element/blob/e2d0534c92417874d64304e2f9afb7062e5cf6fa/src/core/dom.ts#L40)

## Type Parameters

### S

`S` *extends* `string`
