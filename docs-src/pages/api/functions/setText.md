[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / setText

# Function: setText()

> **setText**\<`P`, `E`\>(`s`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:301](https://github.com/zeixcom/ui-element/blob/0678e2841dfcc123c324a841983e7a648bd2315e/src/lib/effects.ts#L301)

Set text content of an element

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### s

[`Reactive`](../type-aliases/Reactive.md)\<`string`, `P`, `E`\>

Reactive bound to the text content

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

An effect function that sets the text content of the element

## Since

0.8.0
