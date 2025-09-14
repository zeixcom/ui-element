[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / setText

# Function: setText()

> **setText**\<`P`, `E`\>(`reactive`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:273](https://github.com/zeixcom/ui-element/blob/c6a12f92c4afb67974fd3ace835c4c69a149176a/src/lib/effects.ts#L273)

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
