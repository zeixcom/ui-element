[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / dangerouslySetInnerHTML

# Function: dangerouslySetInnerHTML()

> **dangerouslySetInnerHTML**\<`P`, `E`\>(`s`, `options`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:466](https://github.com/zeixcom/ui-element/blob/0678e2841dfcc123c324a841983e7a648bd2315e/src/lib/effects.ts#L466)

Set inner HTML of an element

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### s

[`Reactive`](../type-aliases/Reactive.md)\<`string`, `P`, `E`\>

Reactive bound to the inner HTML

### options

[`DangerouslySetInnerHTMLOptions`](../type-aliases/DangerouslySetInnerHTMLOptions.md) = `{}`

Options for setting inner HTML: shadowRootMode, allowScripts

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

An effect function that sets the inner HTML of the element

## Since

0.11.0
