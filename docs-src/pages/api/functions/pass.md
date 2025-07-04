[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / pass

# Function: pass()

> **pass**\<`P`, `Q`\>(`signals`): [`Effect`](../type-aliases/Effect.md)\<`P`, [`Component`](../type-aliases/Component.md)\<`Q`\>\>

Defined in: [src/core/dom.ts:445](https://github.com/zeixcom/ui-element/blob/1b1fdfb1fc30e6d828e5489798acad1c8a45a5b4/src/core/dom.ts#L445)

Pass signals to a UIElement component

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### Q

`Q` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

## Parameters

### signals

Signals to be passed to descendent components

[`PassedSignals`](../type-aliases/PassedSignals.md)\<`P`, `Q`\> | (`target`) => [`PassedSignals`](../type-aliases/PassedSignals.md)\<`P`, `Q`\>

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, [`Component`](../type-aliases/Component.md)\<`Q`\>\>

- Effect to be used in ancestor component

## Since

0.13.2

## Throws

if the provided signals are not an object or a provider function

## Throws

if the target component is not a UIElement component
