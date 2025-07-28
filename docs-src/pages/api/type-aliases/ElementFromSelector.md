[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ElementFromSelector

# Type Alias: ElementFromSelector\<K\>

> **ElementFromSelector**\<`K`\> = `K` *extends* keyof `HTMLElementTagNameMap` ? `HTMLElementTagNameMap`\[`K`\] : `K` *extends* keyof `SVGElementTagNameMap` ? `SVGElementTagNameMap`\[`K`\] : `K` *extends* keyof `MathMLElementTagNameMap` ? `MathMLElementTagNameMap`\[`K`\] : `HTMLElement`

Defined in: [src/core/dom.ts:19](https://github.com/zeixcom/ui-element/blob/333374b65ccc17c36a30cb41ca66f6ca0a5c37d0/src/core/dom.ts#L19)

## Type Parameters

### K

`K` *extends* `string`
