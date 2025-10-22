[**@zeix/le-truc**](../README.md)

---

[@zeix/le-truc](../globals.md) / ElementFromSelector

# Type Alias: ElementFromSelector\<S\>

> **ElementFromSelector**\<`S`\> = [`KnownTag`](KnownTag.md)\<`S`\> _extends_ `never` ? `HTMLElement` : [`KnownTag`](KnownTag.md)\<`S`\> _extends_ keyof `HTMLElementTagNameMap` ? `HTMLElementTagNameMap`\[[`KnownTag`](KnownTag.md)\<`S`\>\] : [`KnownTag`](KnownTag.md)\<`S`\> _extends_ keyof `SVGElementTagNameMap` ? `SVGElementTagNameMap`\[[`KnownTag`](KnownTag.md)\<`S`\>\] : [`KnownTag`](KnownTag.md)\<`S`\> _extends_ keyof `MathMLElementTagNameMap` ? `MathMLElementTagNameMap`\[[`KnownTag`](KnownTag.md)\<`S`\>\] : `HTMLElement`

Defined in: [src/core/dom.ts:40](https://github.com/zeixcom/le-truc/blob/a2e3a5bb1b7ab9e964c80c41c9edbb895cf2ce79/src/core/dom.ts#L40)

## Type Parameters

### S

`S` _extends_ `string`
