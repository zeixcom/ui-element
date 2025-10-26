[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / ValidateComponentProps

# Type Alias: ValidateComponentProps\<P\>

> **ValidateComponentProps**\<`P`\> = `{ [K in keyof P]: ValidPropertyKey<K> extends never ? never : P[K] }`

Defined in: [src/component.ts:53](https://github.com/zeixcom/ui-element/blob/6f2dec0b8de4a8a6010a0f1311d8457054510e5b/src/component.ts#L53)

## Type Parameters

### P

`P`
