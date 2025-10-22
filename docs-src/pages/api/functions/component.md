[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / component

# Function: component()

> **component**\<`P`\>(`name`, `init`, `setup`): `void`

Defined in: [src/component.ts:157](https://github.com/zeixcom/ui-element/blob/b9ddf83c928c93d84a49a796a2342da755e4896e/src/component.ts#L157)

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
