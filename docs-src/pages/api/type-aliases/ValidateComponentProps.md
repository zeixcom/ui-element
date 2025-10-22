[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / ValidateComponentProps

# Type Alias: ValidateComponentProps\<P\>

> **ValidateComponentProps**\<`P`\> = `{ [K in keyof P]: ValidPropertyKey<K> extends never ? never : P[K] }`

Defined in: [src/component.ts:53](https://github.com/zeixcom/ui-element/blob/230cd6cc9b2252d1741350e7be8be3e04b6f2cf4/src/component.ts#L53)

## Type Parameters

### P

`P`
