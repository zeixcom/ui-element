[**@zeix/el-truco**](../README.md)

***

[@zeix/el-truco](../globals.md) / ElementFromSelector

# Type Alias: ElementFromSelector\<S\>

> **ElementFromSelector**\<`S`\> = [`KnownTag`](KnownTag.md)\<`S`\> *extends* `never` ? `HTMLElement` : [`KnownTag`](KnownTag.md)\<`S`\> *extends* keyof `HTMLElementTagNameMap` ? `HTMLElementTagNameMap`\[[`KnownTag`](KnownTag.md)\<`S`\>\] : [`KnownTag`](KnownTag.md)\<`S`\> *extends* keyof `SVGElementTagNameMap` ? `SVGElementTagNameMap`\[[`KnownTag`](KnownTag.md)\<`S`\>\] : [`KnownTag`](KnownTag.md)\<`S`\> *extends* keyof `MathMLElementTagNameMap` ? `MathMLElementTagNameMap`\[[`KnownTag`](KnownTag.md)\<`S`\>\] : `HTMLElement`

Defined in: [src/core/dom.ts:42](https://github.com/zeixcom/ui-element/blob/a49c7d7fbed01d04dd21940c975f1839fc83bb07/src/core/dom.ts#L42)

## Type Parameters

### S

`S` *extends* `string`
