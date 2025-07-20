[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ValidateComponentProps

# Type Alias: ValidateComponentProps\<P\>

> **ValidateComponentProps**\<`P`\> = `{ [K in keyof P]: ValidPropertyKey<K> extends never ? never : P[K] }`

Defined in: [src/component.ts:54](https://github.com/zeixcom/ui-element/blob/1c318eb583bce4633e1df4a42dee77859303e28e/src/component.ts#L54)

## Type Parameters

### P

`P`
