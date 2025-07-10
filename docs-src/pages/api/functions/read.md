[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / read

# Function: read()

> **read**\<`T`, `E`, `C`, `S`\>(`host`, `selector`, `map`): `T`

Defined in: [src/core/dom.ts:336](https://github.com/zeixcom/ui-element/blob/f80be4b02c5d1c80817271ddf0fad982e43ad03e/src/core/dom.ts#L336)

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
