[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ElementFromSelector

# Type Alias: ElementFromSelector\<S\>

> **ElementFromSelector**\<`S`\> = `KnownTag`\<`S`\> *extends* `never` ? `HTMLElement` : `KnownTag`\<`S`\> *extends* keyof `HTMLElementTagNameMap` ? `HTMLElementTagNameMap`\[`KnownTag`\<`S`\>\] : `KnownTag`\<`S`\> *extends* keyof `SVGElementTagNameMap` ? `SVGElementTagNameMap`\[`KnownTag`\<`S`\>\] : `KnownTag`\<`S`\> *extends* keyof `MathMLElementTagNameMap` ? `MathMLElementTagNameMap`\[`KnownTag`\<`S`\>\] : `HTMLElement`

Defined in: [src/core/dom.ts:40](https://github.com/zeixcom/ui-element/blob/0e9d08172859c87c6105be70cfb907fbb6767271/src/core/dom.ts#L40)

## Type Parameters

### S

`S` *extends* `string`
