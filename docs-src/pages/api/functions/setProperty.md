[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / setProperty

# Function: setProperty()

> **setProperty**\<`P`, `K`, `E`\>(`key`, `reactive`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:332](https://github.com/zeixcom/ui-element/blob/6eb916701d8e6ad874e5c8ced8c7ac11007d19ad/src/lib/effects.ts#L332)

Effect for setting a property on an element.
Sets the specified property directly on the element object.

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### K

`K` *extends* `string`

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
