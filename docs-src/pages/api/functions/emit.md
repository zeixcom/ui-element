[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / emit

# Function: emit()

> **emit**\<`T`, `P`, `E`\>(`type`, `s`): (`host`, `target`) => [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

Defined in: [src/lib/effects.ts:491](https://github.com/zeixcom/ui-element/blob/1b1fdfb1fc30e6d828e5489798acad1c8a45a5b4/src/lib/effects.ts#L491)

Emit a custom event with the given detail

## Type Parameters

### T

`T`

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### E

`E` *extends* `Element` = `HTMLElement`

## Parameters

### type

`string`

event type to emit

### s

[`Reactive`](../type-aliases/Reactive.md)\<`T`, `P`, `E`\>

state bound to event detail

## Returns

> (`host`, `target`): [`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

### Parameters

#### host

[`Component`](../type-aliases/Component.md)\<`P`\>

#### target

`E` = `...`

### Returns

[`Effect`](../type-aliases/Effect.md)\<`P`, `E`\>

## Since

0.13.2
