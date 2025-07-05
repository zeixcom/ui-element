[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / updateElement

# Function: updateElement()

> **updateElement**\<`P`, `T`, `E`\>(`reactive`, `updater`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:202](https://github.com/zeixcom/ui-element/blob/d13febaf363936558771161c1c4f66e2034f5ec3/src/lib/effects.ts#L202)

Core effect function for updating element properties based on reactive values.
This function handles the lifecycle of reading, updating, and deleting element properties
while providing proper error handling and debugging support.

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### T

`T` *extends* `object`

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### reactive

[`Reactive`](../type-aliases/Reactive.md)\<`T`, `P`, `E`\>

The reactive value that drives the element updates

### updater

[`ElementUpdater`](../type-aliases/ElementUpdater.md)\<`E`, `T`\>

Configuration object defining how to read, update, and delete the element property

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Effect function that manages the element property updates

## Since

0.9.0
