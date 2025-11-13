[**@zeix/el-truco**](../README.md)

***

[@zeix/el-truco](../globals.md) / pass

# Function: pass()

> **pass**\<`P`, `Q`\>(`props`): [`Effect`](../type-aliases/Effect.md)\<`P`, [`Component`](../type-aliases/Component.md)\<`Q`\>\>

Defined in: [src/core/reactive.ts:148](https://github.com/zeixcom/ui-element/blob/975417e4fd6cf23617fcf9b7b600f45b8f632860/src/core/reactive.ts#L148)

Effect for passing reactive values to a descendant El Truco component.

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### Q

`Q` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

## Parameters

### props

Reactive values to pass

[`PassedProps`](../type-aliases/PassedProps.md)\<`P`, `Q`\> | (`target`) => [`PassedProps`](../type-aliases/PassedProps.md)\<`P`, `Q`\>

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, [`Component`](../type-aliases/Component.md)\<`Q`\>\>

Effect function that passes reactive values to the descendant component

## Since

0.15.0

## Throws

When the target element is not a valid custom element

## Throws

When the provided reactives is not a record of signals, reactive property names or functions

## Throws

When passing signals failed for some other reason
