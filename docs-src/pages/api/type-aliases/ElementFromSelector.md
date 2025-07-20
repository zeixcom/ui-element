[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ElementFromSelector

# Type Alias: ElementFromSelector\<K, E\>

> **ElementFromSelector**\<`K`, `E`\> = `K` *extends* keyof `HTMLElementTagNameMap` ? `HTMLElementTagNameMap`\[`K`\] : `K` *extends* keyof `SVGElementTagNameMap` ? `SVGElementTagNameMap`\[`K`\] : `K` *extends* keyof `MathMLElementTagNameMap` ? `MathMLElementTagNameMap`\[`K`\] : `E`

Defined in: [src/core/dom.ts:21](https://github.com/zeixcom/ui-element/blob/1c318eb583bce4633e1df4a42dee77859303e28e/src/core/dom.ts#L21)

## Type Parameters

### K

`K` *extends* `string`

### E

`E` *extends* `Element` = `HTMLElement`
