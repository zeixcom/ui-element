[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ElementFromSelector

# Type Alias: ElementFromSelector\<K, E\>

> **ElementFromSelector**\<`K`, `E`\> = `K` *extends* keyof `HTMLElementTagNameMap` ? `HTMLElementTagNameMap`\[`K`\] : `K` *extends* keyof `SVGElementTagNameMap` ? `SVGElementTagNameMap`\[`K`\] : `K` *extends* keyof `MathMLElementTagNameMap` ? `MathMLElementTagNameMap`\[`K`\] : `E`

Defined in: [src/component.ts:86](https://github.com/efflore/ui-element/blob/6f13c4cee43b2a37b146c096e1a255409b73e79b/src/component.ts#L86)

## Type Parameters

### K

`K` *extends* `string`

### E

`E` *extends* `Element` = `HTMLElement`
