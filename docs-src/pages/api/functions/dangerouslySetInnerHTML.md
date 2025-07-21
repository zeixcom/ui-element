[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / dangerouslySetInnerHTML

# Function: dangerouslySetInnerHTML()

> **dangerouslySetInnerHTML**\<`P`, `E`\>(`reactive`, `options`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:600](https://github.com/efflore/ui-element/blob/6f13c4cee43b2a37b146c096e1a255409b73e79b/src/lib/effects.ts#L600)

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
