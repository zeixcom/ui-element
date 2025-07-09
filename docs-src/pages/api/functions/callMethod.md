[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / callMethod

# Function: callMethod()

> **callMethod**\<`P`, `K`, `E`\>(`methodName`, `reactive`, `args?`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:446](https://github.com/zeixcom/ui-element/blob/e1c0693393151dbc67087d7dde9d2a2f9e7dd58b/src/lib/effects.ts#L446)

Effect for calling a method on an element.

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### K

`K` *extends* `string` \| `number` \| `symbol`

### E

`E` *extends* `HTMLElement` = `HTMLElement`

## Parameters

### methodName

`K`

Name of the method to call

### reactive

[`Reactive`](../type-aliases/Reactive.md)\<`boolean`, `P`, `E`\>

Reactive value bound to the method call

### args?

`unknown`[]

Arguments to pass to the method

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Effect function that calls the method on the element

## Since

0.13.3
