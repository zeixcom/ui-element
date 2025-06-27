[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / setProperty

# Function: setProperty()

> **setProperty**\<`P`, `K`, `E`\>(`key`, `s`): [`FxFunction`](../type-aliases/FxFunction.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:311](https://github.com/zeixcom/ui-element/blob/fbfc14f2b364007b204dfef842cb4c272bdfad41/src/lib/effects.ts#L311)

Set property of an element

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### K

`K` *extends* `string` \| `number` \| `symbol`

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### key

`K`

name of property to be set

### s

[`SignalLike`](../type-aliases/SignalLike.md)\<`P`, `E`\[`K`\], `E`\> = `...`

state bound to the property value

## Returns

[`FxFunction`](../type-aliases/FxFunction.md)\<`P`, `E`\>

## Since

0.8.0
