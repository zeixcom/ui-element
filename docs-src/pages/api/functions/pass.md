[**@zeix/el-truco**](../README.md)

***

[@zeix/el-truco](../globals.md) / pass

# Function: pass()

> **pass**\<`P`, `Q`\>(`reactives`): [`Effect`](../type-aliases/Effect.md)\<`P`, [`Component`](../type-aliases/Component.md)\<`Q`\>\>

Defined in: [src/lib/effects.ts:548](https://github.com/zeixcom/ui-element/blob/a49c7d7fbed01d04dd21940c975f1839fc83bb07/src/lib/effects.ts#L548)

Effect for passing reactive values to a descendant El Truco component.

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

0.15.0

## Throws

When the target element is not a valid custom element

## Throws

When the target element is not a valid El Truco component

## Throws

When the provided reactives is not a record of signals, reactive property names or functions

## Throws

When passing signals failed for some other reason
