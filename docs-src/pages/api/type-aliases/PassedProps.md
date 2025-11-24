[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / PassedProps

# Type Alias: PassedProps\<P, Q\>

> **PassedProps**\<`P`, `Q`\> = `{ [K in keyof Q & string]?: PassedProp<Q[K], P, Component<Q>> }`

Defined in: [src/core/reactive.ts:53](https://github.com/zeixcom/ui-element/blob/95bb6f2fa5df3c16f08fcbbecd9622c693742c39/src/core/reactive.ts#L53)

## Type Parameters

### P

`P` *extends* [`ComponentProps`](ComponentProps.md)

### Q

`Q` *extends* [`ComponentProps`](ComponentProps.md)
