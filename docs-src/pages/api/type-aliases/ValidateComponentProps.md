[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / ValidateComponentProps

# Type Alias: ValidateComponentProps\<P\>

> **ValidateComponentProps**\<`P`\> = `{ [K in keyof P]: ValidPropertyKey<K> extends never ? never : P[K] }`

Defined in: [src/component.ts:53](https://github.com/zeixcom/ui-element/blob/824b5fcbd5a33ce95b6c2a43bfe0cce0fd18afb8/src/component.ts#L53)

## Type Parameters

### P

`P`
