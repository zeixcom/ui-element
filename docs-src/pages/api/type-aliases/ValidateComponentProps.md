[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / ValidateComponentProps

# Type Alias: ValidateComponentProps\<P\>

> **ValidateComponentProps**\<`P`\> = `{ [K in keyof P]: ValidPropertyKey<K> extends never ? never : P[K] }`

Defined in: [src/component.ts:54](https://github.com/zeixcom/ui-element/blob/d3571cdc68e3e4116ef066c6fac00c4d1c8957d3/src/component.ts#L54)

## Type Parameters

### P

`P`
