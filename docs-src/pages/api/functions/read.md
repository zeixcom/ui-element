[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / read

# Function: read()

> **read**\<`T`, `E`, `C`, `S`\>(`host`, `selector`, `map`): `T`

Defined in: [src/core/dom.ts:327](https://github.com/zeixcom/ui-element/blob/1c318eb583bce4633e1df4a42dee77859303e28e/src/core/dom.ts#L327)

Read from a descendant element and map the result

## Type Parameters

### T

`T` *extends* `object`

### E

`E` *extends* `Element` = `HTMLElement`

### C

`C` *extends* `HTMLElement` = `HTMLElement`

### S

`S` *extends* `string` = `string`

## Parameters

### host

`C`

Host element

### selector

`S`

CSS selector for descendant element

### map

(`element`, `isUpgraded`) => `T`

Function to map over the element

## Returns

`T`

The mapped result from the descendant element

## Since

0.13.3
