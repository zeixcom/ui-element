[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / insertOrRemoveElement

# Function: insertOrRemoveElement()

> **insertOrRemoveElement**\<`P`, `E`\>(`s`, `inserter?`): [`FxFunction`](../type-aliases/FxFunction.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:197](https://github.com/zeixcom/ui-element/blob/051e9e1bc23b455abad71bf33880530a33e32030/src/lib/effects.ts#L197)

Effect for inserting or removing elements according to a given SignalLike

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### s

[`SignalLike`](../type-aliases/SignalLike.md)\<`P`, `number`, `E`\>

state bound to the number of elements to insert (positive) or remove (negative)

### inserter?

[`ElementInserter`](../type-aliases/ElementInserter.md)\<`E`\>

inserter object containing position, insert, and remove methods

## Returns

[`FxFunction`](../type-aliases/FxFunction.md)\<`P`, `E`\>

## Since

0.12.1
