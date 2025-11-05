[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / toSignal

# Function: toSignal()

## Name

Le Truc

## Version

0.14.0

## Author

Esther Brunner

## Call Signature

> **toSignal**\<`T`\>(`value`): `Store`\<`Record`\<`string`, `T`\>\>

Defined in: node\_modules/@zeix/cause-effect/types/src/signal.d.ts:28

Convert a value to a Signal if it's not already a Signal

### Type Parameters

#### T

`T` *extends* `object`

### Parameters

#### value

`T`[]

value to convert

### Returns

`Store`\<`Record`\<`string`, `T`\>\>

- Signal instance

### Since

0.9.6

## Call Signature

> **toSignal**\<`T`\>(`value`): [`Computed`](../type-aliases/Computed.md)\<`T`\>

Defined in: node\_modules/@zeix/cause-effect/types/src/signal.d.ts:29

Convert a value to a Signal if it's not already a Signal

### Type Parameters

#### T

`T` *extends* `object`

### Parameters

#### value

value to convert

() => `T` | (`abort`) => `Promise`\<`T`\>

### Returns

[`Computed`](../type-aliases/Computed.md)\<`T`\>

- Signal instance

### Since

0.9.6

## Call Signature

> **toSignal**\<`T`\>(`value`): `T` *extends* `Store`\<`U`\> ? `Store`\<`U`\> : `T` *extends* [`State`](../type-aliases/State.md)\<`U`\> ? [`State`](../type-aliases/State.md)\<`U`\> : `T` *extends* [`Computed`](../type-aliases/Computed.md)\<`U`\> ? [`Computed`](../type-aliases/Computed.md)\<`U`\> : `T` *extends* [`Signal`](../type-aliases/Signal.md)\<`U`\> ? [`Signal`](../type-aliases/Signal.md)\<`U`\> : `T` *extends* `Record`\<`string`, \{ \}\> ? `Store`\<\{ \[K in string \| number \| symbol\]: T\<T\>\[K\] \}\> : [`State`](../type-aliases/State.md)\<`T`\>

Defined in: node\_modules/@zeix/cause-effect/types/src/signal.d.ts:30

Convert a value to a Signal if it's not already a Signal

### Type Parameters

#### T

`T` *extends* `object`

### Parameters

#### value

`T`

value to convert

### Returns

`T` *extends* `Store`\<`U`\> ? `Store`\<`U`\> : `T` *extends* [`State`](../type-aliases/State.md)\<`U`\> ? [`State`](../type-aliases/State.md)\<`U`\> : `T` *extends* [`Computed`](../type-aliases/Computed.md)\<`U`\> ? [`Computed`](../type-aliases/Computed.md)\<`U`\> : `T` *extends* [`Signal`](../type-aliases/Signal.md)\<`U`\> ? [`Signal`](../type-aliases/Signal.md)\<`U`\> : `T` *extends* `Record`\<`string`, \{ \}\> ? `Store`\<\{ \[K in string \| number \| symbol\]: T\<T\>\[K\] \}\> : [`State`](../type-aliases/State.md)\<`T`\>

- Signal instance

### Since

0.9.6
