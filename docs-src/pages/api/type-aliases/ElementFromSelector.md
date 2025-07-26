[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ElementFromSelector

# Type Alias: ElementFromSelector\<K\>

> **ElementFromSelector**\<`K`\> = `K` *extends* keyof `HTMLElementTagNameMap` ? `HTMLElementTagNameMap`\[`K`\] : `K` *extends* keyof `SVGElementTagNameMap` ? `SVGElementTagNameMap`\[`K`\] : `K` *extends* keyof `MathMLElementTagNameMap` ? `MathMLElementTagNameMap`\[`K`\] : `HTMLElement`

Defined in: [src/core/dom.ts:22](https://github.com/zeixcom/ui-element/blob/e3fa79e199a97014fba6af2a6cf8cb55be8076c3/src/core/dom.ts#L22)

## Type Parameters

### K

`K` *extends* `string`
