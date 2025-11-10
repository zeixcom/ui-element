[**@zeix/el-truco**](../README.md)

***

[@zeix/el-truco](../globals.md) / Reactives

# Type Alias: Reactives\<E, P\>

> **Reactives**\<`E`, `P`\> = `{ [K in keyof E & string]?: Reactive<E[K], P, E> }`

Defined in: [src/lib/effects.ts:37](https://github.com/zeixcom/ui-element/blob/a49c7d7fbed01d04dd21940c975f1839fc83bb07/src/lib/effects.ts#L37)

## Type Parameters

### E

`E` *extends* `Element`

### P

`P` *extends* [`ComponentProps`](ComponentProps.md)
