[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / pass

# Function: pass()

> **pass**\<`P`, `E`\>(`reactives`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:648](https://github.com/zeixcom/ui-element/blob/d13febaf363936558771161c1c4f66e2034f5ec3/src/lib/effects.ts#L648)

Effect for passing reactive values to descendant elements.
Supports both direct property setting and signal passing for custom elements.

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `Element`

## Parameters

### reactives

Reactive values to pass or function that returns them

[`PassedReactives`](../type-aliases/PassedReactives.md)\<`P`, `E`\> | (`target`) => [`PassedReactives`](../type-aliases/PassedReactives.md)\<`P`, `E`\>

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Effect function that passes reactive values to descendant elements

## Since

0.13.2

## Throws

When the provided reactives are not an object or provider function
