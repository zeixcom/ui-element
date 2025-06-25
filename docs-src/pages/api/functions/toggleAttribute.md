[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / toggleAttribute

# Function: toggleAttribute()

> **toggleAttribute**\<`P`, `E`\>(`name`, `s`): [`FxFunction`](../type-aliases/FxFunction.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:379](https://github.com/zeixcom/ui-element/blob/a6fb4a88fd37bb5ca41823947687e8a37d5f2e08/src/lib/effects.ts#L379)

Toggle a boolan attribute of an element

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### name

`string`

name of attribute to be toggled

### s

[`SignalLike`](../type-aliases/SignalLike.md)\<`P`, `boolean`, `E`\> = `name`

state bound to the attribute existence

## Returns

[`FxFunction`](../type-aliases/FxFunction.md)\<`P`, `E`\>

## Since

0.8.0
