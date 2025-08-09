[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / dangerouslySetInnerHTML

# Function: dangerouslySetInnerHTML()

> **dangerouslySetInnerHTML**\<`P`, `E`\>(`reactive`, `options`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:531](https://github.com/zeixcom/ui-element/blob/9f9c8943091140c68eaabf44011b82d99588c469/src/lib/effects.ts#L531)

Effect for setting the inner HTML of an element with optional Shadow DOM support.
Provides security options for script execution and shadow root creation.

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### reactive

[`Reactive`](../type-aliases/Reactive.md)\<`string`, `P`, `E`\>

Reactive value bound to the inner HTML content

### options

[`DangerouslySetInnerHTMLOptions`](../type-aliases/DangerouslySetInnerHTMLOptions.md) = `{}`

Configuration options: shadowRootMode, allowScripts

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Effect function that sets the inner HTML of the element

## Since

0.11.0
