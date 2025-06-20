[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / emit

# Function: emit()

> **emit**\<`T`\>(`type`, `detail`): \<`P`\>(`host`, `target`) => `void`

Defined in: [src/core/dom.ts:439](https://github.com/zeixcom/ui-element/blob/019cf77c80beb600bfb17e452913f013b9d638c1/src/core/dom.ts#L439)

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
