[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / setProperty

# Function: setProperty()

> **setProperty**\<`P`, `K`, `E`\>(`key`, `s`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:323](https://github.com/zeixcom/ui-element/blob/0678e2841dfcc123c324a841983e7a648bd2315e/src/lib/effects.ts#L323)

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

Name of property to be set

### s

[`Reactive`](../type-aliases/Reactive.md)\<`E`\[`K`\], `P`, `E`\> = `...`

Reactive bound to the property value

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

An effect function that sets the property of the element

## Since

0.8.0
