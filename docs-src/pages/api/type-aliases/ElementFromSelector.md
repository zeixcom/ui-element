[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ElementFromSelector

# Type Alias: ElementFromSelector\<K, E\>

> **ElementFromSelector**\<`K`, `E`\> = `K` *extends* keyof `HTMLElementTagNameMap` ? `HTMLElementTagNameMap`\[`K`\] : `K` *extends* keyof `SVGElementTagNameMap` ? `SVGElementTagNameMap`\[`K`\] : `K` *extends* keyof `MathMLElementTagNameMap` ? `MathMLElementTagNameMap`\[`K`\] : `E`

Defined in: [src/component.ts:86](https://github.com/zeixcom/ui-element/blob/09c98ef25d6964a68bdac33e61f389dd027c5b92/src/component.ts#L86)

## Type Parameters

### K

`K` *extends* `string`

### E

`E` *extends* `Element` = `HTMLElement`
