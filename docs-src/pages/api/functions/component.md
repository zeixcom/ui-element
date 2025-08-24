[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / component

# Function: component()

> **component**\<`P`\>(`name`, `init`, `setup`): `void`

Defined in: [src/component.ts:157](https://github.com/zeixcom/ui-element/blob/be16cef9b9f750168be795bfcb3a37afa34e2af7/src/component.ts#L157)

Define a component with dependency resolution and setup function (connectedCallback)

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md) & [`ValidateComponentProps`](../type-aliases/ValidateComponentProps.md)\<`P`\>

## Parameters

### name

`string`

Name of the custom element

### init

\{ \[K in string \| number \| symbol\]: Initializer\<P\[K\], Component\<P\>\> \} = `...`

Signals of the component

### setup

[`Setup`](../type-aliases/Setup.md)\<`P`\>

Setup function to be called after dependencies are resolved

## Returns

`void`

## Since

0.14.0

## Throws

If component name is invalid

## Throws

If property name is invalid
