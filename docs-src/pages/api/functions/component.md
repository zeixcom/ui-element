[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / component

# Function: component()

> **component**\<`P`\>(`name`, `init`, `setup`, `dependencies?`): `void`

Defined in: [src/component.ts:310](https://github.com/zeixcom/ui-element/blob/e3fa79e199a97014fba6af2a6cf8cb55be8076c3/src/component.ts#L310)

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

### dependencies?

`string`[]

Array of custom element names the component depends on

## Returns

`void`

## Since

0.14.0

## Throws

If component name is invalid

## Throws

If property name is invalid
