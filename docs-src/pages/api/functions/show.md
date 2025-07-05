[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / show

# Function: show()

> **show**\<`P`, `E`\>(`s`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:347](https://github.com/zeixcom/ui-element/blob/0678e2841dfcc123c324a841983e7a648bd2315e/src/lib/effects.ts#L347)

Set 'hidden' property of an element

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `HTMLElement` = `HTMLElement`

## Parameters

### s

[`Reactive`](../type-aliases/Reactive.md)\<`boolean`, `P`, `E`\>

Reactive bound to the 'hidden' property value

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

An effect function that sets the 'hidden' property of the element

## Since

0.13.1
