[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / fromSelector

# Function: fromSelector()

> **fromSelector**\<`E`, `C`, `S`\>(`selector`): [`Extractor`](../type-aliases/Extractor.md)\<[`Computed`](../type-aliases/Computed.md)\<[`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`, `E`\>[]\>, `C`\>

Defined in: [src/core/dom.ts:220](https://github.com/zeixcom/ui-element/blob/1c318eb583bce4633e1df4a42dee77859303e28e/src/core/dom.ts#L220)

Produce a computed signal of an array of elements matching a selector

## Type Parameters

### E

`E` *extends* `Element` = `HTMLElement`

### C

`C` *extends* `HTMLElement` = `HTMLElement`

### S

`S` *extends* `string` = `string`

## Parameters

### selector

`S`

CSS selector for descendant elements

## Returns

[`Extractor`](../type-aliases/Extractor.md)\<[`Computed`](../type-aliases/Computed.md)\<[`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`, `E`\>[]\>, `C`\>

Signal producer for descendant element collection from a selector

## Since

0.13.1

## Throws

If observed mutations would trigger infinite mutation cycles
