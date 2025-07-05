[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / insertOrRemoveElement

# Function: insertOrRemoveElement()

> **insertOrRemoveElement**\<`P`, `E`\>(`s`, `inserter?`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:207](https://github.com/zeixcom/ui-element/blob/0678e2841dfcc123c324a841983e7a648bd2315e/src/lib/effects.ts#L207)

Effect for inserting or removing elements according to a given Reactive

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### s

[`Reactive`](../type-aliases/Reactive.md)\<`number`, `P`, `E`\>

Reactive bound to the number of elements to insert (positive) or remove (negative)

### inserter?

[`ElementInserter`](../type-aliases/ElementInserter.md)\<`E`\>

Inserter object containing position, insert, and remove methods

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

- Effect function that inserts or removes elements

## Since

0.12.1
