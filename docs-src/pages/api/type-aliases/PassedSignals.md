[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / PassedSignals

# Type Alias: PassedSignals\<P, Q\>

> **PassedSignals**\<`P`, `Q`\> = \{ \[K in keyof Q\]?: Signal\<Q\[K\]\> \| ((element: Component\<Q\>) =\> Q\[K\]) \| keyof P \}

Defined in: [src/core/dom.ts:85](https://github.com/zeixcom/ui-element/blob/8a5f554f7f150bc30f3cc67f612a4c3067704cb6/src/core/dom.ts#L85)

## Type Parameters

### P

`P` *extends* [`ComponentProps`](ComponentProps.md)

### Q

`Q` *extends* [`ComponentProps`](ComponentProps.md)
