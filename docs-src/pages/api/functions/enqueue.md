[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / enqueue

# Function: enqueue()

> **enqueue**\<`T`\>(`fn`, `dedupe?`): `Promise`\<`boolean` \| `T` \| `undefined`\>

Defined in: node\_modules/@zeix/cause-effect/src/scheduler.ts:147

Enqueue a function to be executed on the next animation frame

If the same Symbol is provided for multiple calls before the next animation frame,
only the latest call will be executed (deduplication).

## Type Parameters

### T

`T`

## Parameters

### fn

`Updater`

function to be executed on the next animation frame; can return updated value <T>, success <boolean> or void

### dedupe?

`symbol`

Symbol for deduplication; if not provided, a unique Symbol is created ensuring the update is always executed

## Returns

`Promise`\<`boolean` \| `T` \| `undefined`\>
