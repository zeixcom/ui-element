[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ValidateComponentProps

# Type Alias: ValidateComponentProps\<P\>

> **ValidateComponentProps**\<`P`\> = `{ [K in keyof P]: ValidPropertyKey<K> extends never ? never : P[K] }`

Defined in: [src/component.ts:55](https://github.com/zeixcom/ui-element/blob/e3fa79e199a97014fba6af2a6cf8cb55be8076c3/src/component.ts#L55)

## Type Parameters

### P

`P`
