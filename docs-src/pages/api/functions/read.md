[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / read

# Function: read()

> **read**\<`Q`, `K`\>(`source`, `prop`, `fallback`): () => `Q`\[`K`\]

Defined in: [src/core/dom.ts:503](https://github.com/zeixcom/ui-element/blob/ef7525ef4fcd5329d68c2b65cc085220a29b7a4f/src/core/dom.ts#L503)

Read a signal property from a custom element safely after it's defined
Returns a function that provides the signal value with fallback until component is ready

## Type Parameters

### Q

`Q` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### K

`K` *extends* `string` \| `number` \| `symbol`

## Parameters

### source

source custom element to read signal from

`null` | [`Component`](../type-aliases/Component.md)\<`Q`\>

### prop

`K`

property name to get signal for

### fallback

`Q`\[`K`\]

fallback value to use until component is ready

## Returns

function that returns signal value or fallback

> (): `Q`\[`K`\]

### Returns

`Q`\[`K`\]

## Since

0.13.1
