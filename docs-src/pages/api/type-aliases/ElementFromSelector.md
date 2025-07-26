[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ElementFromSelector

# Type Alias: ElementFromSelector\<K\>

> **ElementFromSelector**\<`K`\> = `K` *extends* keyof `HTMLElementTagNameMap` ? `HTMLElementTagNameMap`\[`K`\] : `K` *extends* keyof `SVGElementTagNameMap` ? `SVGElementTagNameMap`\[`K`\] : `K` *extends* keyof `MathMLElementTagNameMap` ? `MathMLElementTagNameMap`\[`K`\] : `HTMLElement`

Defined in: [src/core/dom.ts:22](https://github.com/zeixcom/ui-element/blob/1e2981711e0b3b45697eacbe8601e2ce3440aa11/src/core/dom.ts#L22)

## Type Parameters

### K

`K` *extends* `string`
