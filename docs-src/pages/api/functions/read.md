[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / read

# Function: read()

> **read**\<`Q`, `K`\>(`target`, `prop`, `fallback`): () => `Q`\[`K`\]

Defined in: [src/core/dom.ts:328](https://github.com/zeixcom/ui-element/blob/0e9cacf03a8f95418720628d5174fbb006152743/src/core/dom.ts#L328)

Read a signal property from a custom element safely after it's defined

## Type Parameters

### Q

`Q` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### K

`K` *extends* `string`

## Parameters

### target

Taget descendant element

`null` | [`Component`](../type-aliases/Component.md)\<`Q`\>

### prop

`K`

Property name to get signal for

### fallback

`Q`\[`K`\]

Fallback value to use until component is ready

## Returns

Function that returns signal value or fallback

> (): `Q`\[`K`\]

### Returns

`Q`\[`K`\]

## Since

0.13.1
