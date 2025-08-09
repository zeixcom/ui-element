[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ElementFromSelector

# Type Alias: ElementFromSelector\<K\>

> **ElementFromSelector**\<`K`\> = `K` *extends* keyof `HTMLElementTagNameMap` ? `HTMLElementTagNameMap`\[`K`\] : `K` *extends* keyof `SVGElementTagNameMap` ? `SVGElementTagNameMap`\[`K`\] : `K` *extends* keyof `MathMLElementTagNameMap` ? `MathMLElementTagNameMap`\[`K`\] : `HTMLElement`

Defined in: [src/core/dom.ts:19](https://github.com/zeixcom/ui-element/blob/8864649de9d6985ed1a958dac8b1b4b7b4877403/src/core/dom.ts#L19)

## Type Parameters

### K

`K` *extends* `string`
