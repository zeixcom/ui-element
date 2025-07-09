[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / pass

# Function: pass()

> **pass**\<`P`, `E`\>(`reactives`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:704](https://github.com/zeixcom/ui-element/blob/e1c0693393151dbc67087d7dde9d2a2f9e7dd58b/src/lib/effects.ts#L704)

Effect for passing reactive values to descendant elements.
Supports both direct property setting and signal passing for custom elements.

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `Element`

## Parameters

### reactives

[`Reactives`](../type-aliases/Reactives.md)\<`P`, `E`\>

Reactive values to pass or function that returns them

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Effect function that passes reactive values to descendant elements

## Since

0.13.2

## Throws

When the provided reactives are not an object or provider function
