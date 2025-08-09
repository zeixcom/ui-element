[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / pass

# Function: pass()

> **pass**\<`P`, `Q`\>(`reactives`): [`Effect`](../type-aliases/Effect.md)\<`P`, [`Component`](../type-aliases/Component.md)\<`Q`\>\>

Defined in: [src/lib/effects.ts:576](https://github.com/zeixcom/ui-element/blob/9f9c8943091140c68eaabf44011b82d99588c469/src/lib/effects.ts#L576)

Effect for passing reactive values to a descendant UIElement component.

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### Q

`Q` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

## Parameters

### reactives

[`Reactives`](../type-aliases/Reactives.md)\<[`Component`](../type-aliases/Component.md)\<`Q`\>, `P`\>

Reactive values to pass

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, [`Component`](../type-aliases/Component.md)\<`Q`\>\>

Effect function that passes reactive values to the descendant component

## Since

0.13.3

## Throws

When the provided reactives are not an object or the target is not a UIElement component

## Throws

When passing signals failed for some other reason
