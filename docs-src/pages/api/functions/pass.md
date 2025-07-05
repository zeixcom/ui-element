[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / pass

# Function: pass()

> **pass**\<`P`, `E`\>(`reactives`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:572](https://github.com/zeixcom/ui-element/blob/0678e2841dfcc123c324a841983e7a648bd2315e/src/lib/effects.ts#L572)

Pass reactives to a descendent element

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `Element`

## Parameters

### reactives

Reactives to be passed to descendent element

[`PassedReactives`](../type-aliases/PassedReactives.md)\<`P`, `E`\> | (`target`) => [`PassedReactives`](../type-aliases/PassedReactives.md)\<`P`, `E`\>

## Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

An effect function that passes the reactives to the descendent element

## Since

0.13.2

## Throws

If the provided signals are not an object or a provider function
