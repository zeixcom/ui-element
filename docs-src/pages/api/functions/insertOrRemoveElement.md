[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / insertOrRemoveElement

# Function: insertOrRemoveElement()

> **insertOrRemoveElement**\<`P`, `E`\>(`reactive`, `inserter?`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:184](https://github.com/zeixcom/ui-element/blob/1c934178f8926c03a10af2b29ad6cc201eead501/src/lib/effects.ts#L184)

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
