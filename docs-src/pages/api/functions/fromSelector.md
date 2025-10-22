[**@zeix/le-truc**](../README.md)

---

[@zeix/le-truc](../globals.md) / fromSelector

# Function: fromSelector()

## Call Signature

> **fromSelector**\<`S`, `C`\>(`selector`): [`Extractor`](../type-aliases/Extractor.md)\<[`Computed`](../type-aliases/Computed.md)\<[`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`\>[]\>, `C`\>

Defined in: [src/core/dom.ts:442](https://github.com/zeixcom/le-truc/blob/a2e3a5bb1b7ab9e964c80c41c9edbb895cf2ce79/src/core/dom.ts#L442)

Produce a computed signal of an array of elements matching a selector

### Type Parameters

#### S

`S` _extends_ `string`

#### C

`C` _extends_ `HTMLElement` = `HTMLElement`

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

Defined in: [src/core/dom.ts:445](https://github.com/zeixcom/le-truc/blob/a2e3a5bb1b7ab9e964c80c41c9edbb895cf2ce79/src/core/dom.ts#L445)

Produce a computed signal of an array of elements matching a selector

### Type Parameters

#### E

`E` _extends_ `Element`

#### C

`C` _extends_ `HTMLElement` = `HTMLElement`

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
