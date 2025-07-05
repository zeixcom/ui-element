[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / setAttribute

# Function: setAttribute()

> **setAttribute**\<`P`, `E`\>(`name`, `s`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:367](https://github.com/zeixcom/ui-element/blob/0678e2841dfcc123c324a841983e7a648bd2315e/src/lib/effects.ts#L367)

Set attribute of an element

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### name

`string`

Name of attribute to be set

### s

[`Reactive`](../type-aliases/Reactive.md)\<`string`, `P`, `E`\> = `name`

Reactive bound to the attribute value

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

An effect function that sets the attribute of the element

## Since

0.8.0
