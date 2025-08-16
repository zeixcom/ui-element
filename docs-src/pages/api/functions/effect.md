[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / effect

# Function: effect()

> **effect**\<`S`\>(`matcher`): [`Cleanup`](../type-aliases/Cleanup.md)

Defined in: node\_modules/@zeix/cause-effect/src/effect.ts:23

Define what happens when a reactive state changes

## Type Parameters

### S

`S` *extends* [`Signal`](../type-aliases/Signal.md)\<\{ \}\>[]

## Parameters

### matcher

effect matcher or callback

[`EffectMatcher`](../type-aliases/EffectMatcher.md)\<`S`\> | () => `undefined` \| [`Cleanup`](../type-aliases/Cleanup.md)

## Returns

[`Cleanup`](../type-aliases/Cleanup.md)

- cleanup function for the effect

## Since

0.1.0
