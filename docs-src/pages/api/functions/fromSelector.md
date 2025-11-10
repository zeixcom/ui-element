[**@zeix/el-truco**](../README.md)

***

[@zeix/el-truco](../globals.md) / fromSelector

# Function: fromSelector()

## Call Signature

> **fromSelector**\<`S`, `C`\>(`selector`): [`Extractor`](../type-aliases/Extractor.md)\<[`Computed`](../type-aliases/Computed.md)\<[`ElementFromSelector`](../type-aliases/ElementFromSelector.md)\<`S`\>[]\>, `C`\>

Defined in: [src/core/dom.ts:444](https://github.com/zeixcom/ui-element/blob/a49c7d7fbed01d04dd21940c975f1839fc83bb07/src/core/dom.ts#L444)

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

Defined in: [src/core/dom.ts:447](https://github.com/zeixcom/ui-element/blob/a49c7d7fbed01d04dd21940c975f1839fc83bb07/src/core/dom.ts#L447)

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
