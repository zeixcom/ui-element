[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / insertOrRemoveElement

# Function: insertOrRemoveElement()

> **insertOrRemoveElement**\<`P`, `E`\>(`reactive`, `inserter?`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:282](https://github.com/efflore/ui-element/blob/6f13c4cee43b2a37b146c096e1a255409b73e79b/src/lib/effects.ts#L282)

Effect for dynamically inserting or removing elements based on a reactive numeric value.
Positive values insert elements, negative values remove them.

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### reactive

[`Reactive`](../type-aliases/Reactive.md)\<`number`, `P`, `E`\>

Reactive value determining number of elements to insert (positive) or remove (negative)

### inserter?

[`ElementInserter`](../type-aliases/ElementInserter.md)\<`E`\>

Configuration object defining how to create and position elements

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Effect function that manages element insertion and removal

## Since

0.12.1
