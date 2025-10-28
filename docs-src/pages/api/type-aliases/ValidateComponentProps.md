[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / ValidateComponentProps

# Type Alias: ValidateComponentProps\<P\>

> **ValidateComponentProps**\<`P`\> = `{ [K in keyof P]: ValidPropertyKey<K> extends never ? never : P[K] }`

Defined in: [src/component.ts:53](https://github.com/zeixcom/ui-element/blob/1c934178f8926c03a10af2b29ad6cc201eead501/src/component.ts#L53)

## Type Parameters

### P

`P`
