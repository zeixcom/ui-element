[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / updateElement

# Function: updateElement()

> **updateElement**\<`P`, `T`, `E`\>(`s`, `updater`): [`FxFunction`](../type-aliases/FxFunction.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:111](https://github.com/zeixcom/ui-element/blob/a6fb4a88fd37bb5ca41823947687e8a37d5f2e08/src/lib/effects.ts#L111)

Effect for setting properties of a target element according to a given SignalLike

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### T

`T` *extends* `object`

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### s

[`SignalLike`](../type-aliases/SignalLike.md)\<`P`, `T`, `E`\>

state bound to the element property

### updater

[`ElementUpdater`](../type-aliases/ElementUpdater.md)\<`E`, `T`\>

updater object containing key, read, update, and delete methods

## Returns

[`FxFunction`](../type-aliases/FxFunction.md)\<`P`, `E`\>

## Since

0.9.0
