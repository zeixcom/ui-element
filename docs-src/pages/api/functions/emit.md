[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / emit

# Function: emit()

> **emit**\<`T`\>(`type`, `detail`): \<`P`\>(`host`, `target`) => `void`

Defined in: [src/core/dom.ts:439](https://github.com/zeixcom/ui-element/blob/a6fb4a88fd37bb5ca41823947687e8a37d5f2e08/src/core/dom.ts#L439)

Emit a custom event with the given detail

## Type Parameters

### T

`T`

## Parameters

### type

`string`

event type to emit

### detail

event detail or provider function

`T` | (`element`) => `T`

## Returns

> \<`P`\>(`host`, `target`): `void`

### Type Parameters

#### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### Parameters

#### host

[`Component`](../type-aliases/Component.md)\<`P`\>

#### target

`Element` = `host`

### Returns

`void`

## Since

0.12.0
