[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / PassedSignals

# Type Alias: PassedSignals\<P, Q\>

> **PassedSignals**\<`P`, `Q`\> = \{ \[K in keyof Q\]?: Signal\<Q\[K\]\> \| ((element: Component\<Q\>) =\> Q\[K\]) \| keyof P \}

Defined in: [src/core/dom.ts:85](https://github.com/zeixcom/ui-element/blob/6285025fa3b3778fb2f356dae80a5fa6250ac264/src/core/dom.ts#L85)

## Type Parameters

### P

`P` *extends* [`ComponentProps`](ComponentProps.md)

### Q

`Q` *extends* [`ComponentProps`](ComponentProps.md)
