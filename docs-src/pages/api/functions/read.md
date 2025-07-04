[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / read

# Function: read()

> **read**\<`E`, `K`\>(`source`, `prop`, `fallback`): () => `NonNullable`\<`E`\[`K`\]\>

Defined in: [src/core/dom.ts:489](https://github.com/zeixcom/ui-element/blob/1b1fdfb1fc30e6d828e5489798acad1c8a45a5b4/src/core/dom.ts#L489)

Read a signal property from a custom element safely after it's defined
Returns a function that provides the signal value with fallback until component is ready

## Type Parameters

### E

`E` *extends* `Element`

### K

`K` *extends* `string` \| `number` \| `symbol`

## Parameters

### source

Source custom element to read reactive property from

`null` | `E`

### prop

`K`

Property name to get

### fallback

`NonNullable`\<`E`\[`K`\]\>

Fallback value to use until component is upgraded

## Returns

Function that returns current value or fallback

> (): `NonNullable`\<`E`\[`K`\]\>

### Returns

`NonNullable`\<`E`\[`K`\]\>

## Since

0.13.1
