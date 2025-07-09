[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / setProperty

# Function: setProperty()

> **setProperty**\<`P`, `K`, `E`\>(`key`, `reactive`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:400](https://github.com/zeixcom/ui-element/blob/e1c0693393151dbc67087d7dde9d2a2f9e7dd58b/src/lib/effects.ts#L400)

Effect for setting a property on an element.
Sets the specified property directly on the element object.

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

Name of the property to set

### reactive

[`Reactive`](../type-aliases/Reactive.md)\<`E`\[`K`\], `P`, `E`\> = `...`

Reactive value bound to the property value (defaults to property name)

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Effect function that sets the property on the element

## Since

0.8.0
