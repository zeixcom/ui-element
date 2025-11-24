[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / Context

# Type Alias: Context\<K, V\>

> **Context**\<`K`, `V`\> = `K` & `object`

Defined in: [src/core/context.ts:17](https://github.com/zeixcom/ui-element/blob/95bb6f2fa5df3c16f08fcbbecd9622c693742c39/src/core/context.ts#L17)

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
