[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / updateElement

# Function: updateElement()

> **updateElement**\<`P`, `T`, `E`\>(`s`, `updater`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:121](https://github.com/zeixcom/ui-element/blob/0678e2841dfcc123c324a841983e7a648bd2315e/src/lib/effects.ts#L121)

Effect for setting properties of a target element according to a given Reactive

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### T

`T` *extends* `object`

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### s

[`Reactive`](../type-aliases/Reactive.md)\<`T`, `P`, `E`\>

Reactive bound to the element property

### updater

[`ElementUpdater`](../type-aliases/ElementUpdater.md)\<`E`, `T`\>

Updater object containing key, read, update, and delete methods

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Effect function that updates the element properties

## Since

0.9.0
