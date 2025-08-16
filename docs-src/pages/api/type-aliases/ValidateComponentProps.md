[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ValidateComponentProps

# Type Alias: ValidateComponentProps\<P\>

> **ValidateComponentProps**\<`P`\> = `{ [K in keyof P]: ValidPropertyKey<K> extends never ? never : P[K] }`

Defined in: [src/component.ts:53](https://github.com/zeixcom/ui-element/blob/3ce60a1d02c8c6608b1b8d191cd2a6123bdc0b3a/src/component.ts#L53)

## Type Parameters

### P

`P`
