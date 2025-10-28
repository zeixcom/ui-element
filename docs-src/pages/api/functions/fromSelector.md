[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / fromSelector

# Function: fromSelector()

## Call Signature

> **fromSelector**\<`S`, `C`\>(`selector`): [`Extractor`](../type-aliases/Extractor.md)\<[`Computed`](../type-aliases/Computed.md)\<[`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`\>[]\>, `C`\>

Defined in: [src/core/dom.ts:442](https://github.com/zeixcom/ui-element/blob/1c934178f8926c03a10af2b29ad6cc201eead501/src/core/dom.ts#L442)

Produce a computed signal of an array of elements matching a selector

### Type Parameters

#### S

`S` *extends* `string`

#### C

`C` *extends* `HTMLElement` = `HTMLElement`

### Parameters

#### selector

`S`

CSS selector for descendant elements

### Returns

[`Extractor`](../type-aliases/Extractor.md)\<[`Computed`](../type-aliases/Computed.md)\<[`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`\>[]\>, `C`\>

Signal producer for descendant element collection from a selector

### Since

0.13.1

### Throws

If observed mutations would trigger infinite mutation cycles

## Call Signature

> **fromSelector**\<`E`, `C`\>(`selector`): [`Extractor`](../type-aliases/Extractor.md)\<[`Computed`](../type-aliases/Computed.md)\<`E`[]\>, `C`\>

Defined in: [src/core/dom.ts:445](https://github.com/zeixcom/ui-element/blob/1c934178f8926c03a10af2b29ad6cc201eead501/src/core/dom.ts#L445)

Produce a computed signal of an array of elements matching a selector

### Type Parameters

#### E

`E` *extends* `Element`

#### C

`C` *extends* `HTMLElement` = `HTMLElement`

### Parameters

#### selector

`string`

CSS selector for descendant elements

### Returns

[`Extractor`](../type-aliases/Extractor.md)\<[`Computed`](../type-aliases/Computed.md)\<`E`[]\>, `C`\>

Signal producer for descendant element collection from a selector

### Since

0.13.1

### Throws

If observed mutations would trigger infinite mutation cycles
