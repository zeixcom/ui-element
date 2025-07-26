[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ValidateComponentProps

# Type Alias: ValidateComponentProps\<P\>

> **ValidateComponentProps**\<`P`\> = `{ [K in keyof P]: ValidPropertyKey<K> extends never ? never : P[K] }`

Defined in: [src/component.ts:54](https://github.com/zeixcom/ui-element/blob/1e2981711e0b3b45697eacbe8601e2ce3440aa11/src/component.ts#L54)

## Type Parameters

### P

`P`
