[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / Context

# Type Alias: Context\<K, V\>

> **Context**\<`K`, `V`\> = `K` & `object`

Defined in: [src/core/context.ts:22](https://github.com/zeixcom/ui-element/blob/c6a12f92c4afb67974fd3ace835c4c69a149176a/src/core/context.ts#L22)

A context key.

A context key can be any type of object, including strings and symbols. The
 Context type brands the key type with the `__context__` property that
carries the type of the value the context references.

## Type declaration

### \_\_context\_\_

> **\_\_context\_\_**: `V`

## Type Parameters

### K

`K`

### V

`V`
