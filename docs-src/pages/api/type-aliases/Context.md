[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / Context

# Type Alias: Context\<K, V\>

> **Context**\<`K`, `V`\> = `K` & `object`

Defined in: [src/core/context.ts:22](https://github.com/zeixcom/ui-element/blob/1c934178f8926c03a10af2b29ad6cc201eead501/src/core/context.ts#L22)

A context key.

A context key can be any type of object, including strings and symbols. The
 Context type brands the key type with the `__context__` property that
carries the type of the value the context references.

## Type Declaration

### \_\_context\_\_

> **\_\_context\_\_**: `V`

## Type Parameters

### K

`K`

### V

`V`
