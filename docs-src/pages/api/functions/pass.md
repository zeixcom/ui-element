[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / pass

# Function: pass()

> **pass**\<`P`, `Q`\>(`reactives`): [`Effect`](../type-aliases/Effect.md)\<`P`, [`Component`](../type-aliases/Component.md)\<`Q`\>\>

Defined in: [src/lib/effects.ts:540](https://github.com/zeixcom/ui-element/blob/0d1d8bcd09361c4e51ed49d4aa52794efffd13c3/src/lib/effects.ts#L540)

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
