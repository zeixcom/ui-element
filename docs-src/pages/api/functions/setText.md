[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / setText

# Function: setText()

> **setText**\<`P`, `E`\>(`reactive`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:309](https://github.com/zeixcom/ui-element/blob/0e9cacf03a8f95418720628d5174fbb006152743/src/lib/effects.ts#L309)

Effect for setting the text content of an element.
Replaces all child nodes (except comments) with a single text node.

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### reactive

[`Reactive`](../type-aliases/Reactive.md)\<`string`, `P`, `E`\>

Reactive value bound to the text content

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Effect function that sets the text content of the element

## Since

0.8.0
