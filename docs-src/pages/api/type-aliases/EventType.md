[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / EventType

# Type Alias: EventType\<K\>

> **EventType**\<`K`\> = `K` *extends* keyof `HTMLElementEventMap` ? `HTMLElementEventMap`\[`K`\] : `K` *extends* keyof `SVGElementEventMap` ? `SVGElementEventMap`\[`K`\] : `Event`

Defined in: [src/core/dom.ts:19](https://github.com/zeixcom/ui-element/blob/e1c0693393151dbc67087d7dde9d2a2f9e7dd58b/src/core/dom.ts#L19)

## Type Parameters

### K

`K` *extends* `string`
