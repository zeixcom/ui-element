[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / sensor

# Function: sensor()

> **sensor**\<`T`, `E`, `K`, `C`\>(`host`, `source`, `type`, `transform`, `initialValue`, `options`): [`Computed`](../type-aliases/Computed.md)\<`T`\>

Defined in: [src/core/dom.ts:331](https://github.com/zeixcom/ui-element/blob/6285025fa3b3778fb2f356dae80a5fa6250ac264/src/core/dom.ts#L331)

Create a computed signal that listens to an event on an element

This function creates a reactive signal that updates when the specified event fires.
Event listeners are automatically managed - they are added when the signal has watchers
and removed when no watchers remain to prevent memory leaks.

## Type Parameters

### T

`T` *extends* `object`

### E

`E` *extends* `Element`

### K

`K` *extends* `string`

### C

`C` *extends* `HTMLElement` = `HTMLElement`

## Parameters

### host

`C`

host element (used as context in transform function)

### source

`E`

element to attach event listener to

### type

`K`

event type to listen for (type-safe based on element type)

### transform

(`host`, `source`, `event`, `oldValue`) => `T`

transformation function in event listener

### initialValue

`T`

initial value of the signal

### options

event listener options

`boolean` | `AddEventListenerOptions`

## Returns

[`Computed`](../type-aliases/Computed.md)\<`T`\>

computed signal that automatically manages event listener lifecycle

## Since

0.13.1
