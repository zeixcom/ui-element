[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / dangerouslySetInnerHTML

# Function: dangerouslySetInnerHTML()

> **dangerouslySetInnerHTML**\<`P`, `E`\>(`s`, `options`): [`FxFunction`](../type-aliases/FxFunction.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:448](https://github.com/zeixcom/ui-element/blob/6285025fa3b3778fb2f356dae80a5fa6250ac264/src/lib/effects.ts#L448)

Set inner HTML of an element

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### s

[`SignalLike`](../type-aliases/SignalLike.md)\<`P`, `string`, `E`\>

state bound to the inner HTML

### options

[`DangerouslySetInnerHTMLOptions`](../type-aliases/DangerouslySetInnerHTMLOptions.md) = `{}`

options for setting inner HTML: shadowRootMode, allowScripts

## Returns

[`FxFunction`](../type-aliases/FxFunction.md)\<`P`, `E`\>

## Since

0.11.0
