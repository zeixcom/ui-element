[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ValidateComponentProps

# Type Alias: ValidateComponentProps\<P\>

> **ValidateComponentProps**\<`P`\> = `{ [K in keyof P]: ValidPropertyKey<K> extends never ? never : P[K] }`

Defined in: [src/component.ts:54](https://github.com/zeixcom/ui-element/blob/0e9cacf03a8f95418720628d5174fbb006152743/src/component.ts#L54)

## Type Parameters

### P

`P`
