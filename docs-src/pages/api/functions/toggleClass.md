[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / toggleClass

# Function: toggleClass()

> **toggleClass**\<`P`, `E`\>(`token`, `s`): [`FxFunction`](../type-aliases/FxFunction.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:402](https://github.com/zeixcom/ui-element/blob/fbfc14f2b364007b204dfef842cb4c272bdfad41/src/lib/effects.ts#L402)

Toggle a classList token of an element

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### token

`string`

class token to be toggled

### s

[`SignalLike`](../type-aliases/SignalLike.md)\<`P`, `boolean`, `E`\> = `token`

state bound to the class existence

## Returns

[`FxFunction`](../type-aliases/FxFunction.md)\<`P`, `E`\>

## Since

0.8.0
