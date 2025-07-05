[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromDescendant

# Function: fromDescendant()

> **fromDescendant**\<`E`, `S`, `K`\>(`selector`, `prop`, `fallback`): (`host`) => () => `NonNullable`\<[`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`, `E`\>\[`K`\]\>

Defined in: [src/core/dom.ts:411](https://github.com/zeixcom/ui-element/blob/d13febaf363936558771161c1c4f66e2034f5ec3/src/core/dom.ts#L411)

## Type Parameters

### E

`E` *extends* `Element` = `HTMLElement`

### S

`S` *extends* `string` = `string`

### K

`K` *extends* `string` \| `number` \| `symbol` = keyof [`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`, `E`\>

## Parameters

### selector

`S`

### prop

`K`

### fallback

`NonNullable`\<[`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`, `E`\>\[`K`\]\>

## Returns

> (`host`): () => `NonNullable`\<[`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`, `E`\>\[`K`\]\>

### Parameters

#### host

`HTMLElement`

### Returns

> (): `NonNullable`\<[`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`, `E`\>\[`K`\]\>

#### Returns

`NonNullable`\<[`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`, `E`\>\[`K`\]\>
