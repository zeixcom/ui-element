[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / focus

# Function: focus()

> **focus**\<`P`, `E`\>(`reactive`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:476](https://github.com/zeixcom/ui-element/blob/29b42270573af1b19b68f0383c60c6f1221e3f0d/src/lib/effects.ts#L476)

Effect for controlling element focus by calling the 'focus()' method.
If the reactive value is true, element will be focussed; when false, nothing happens.

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `HTMLElement` = `HTMLElement`

## Parameters

### reactive

[`Reactive`](../type-aliases/Reactive.md)\<`boolean`, `P`, `E`\>

Reactive value bound to the focus state

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Effect function that sets element focus

## Since

0.13.3
