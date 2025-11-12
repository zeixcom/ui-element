[**@zeix/el-truco**](../README.md)

***

[@zeix/el-truco](../globals.md) / component

# Function: component()

> **component**\<`P`\>(`name`, `init`, `setup`): [`Component`](../type-aliases/Component.md)\<`P`\>

Defined in: [src/component.ts:153](https://github.com/zeixcom/ui-element/blob/8085b01c567eb5438a72e6d26eca9f9f0ad6e39f/src/component.ts#L153)

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

[`Component`](../type-aliases/Component.md)\<`P`\>

## Since

0.14.0

## Throws

If component name is invalid

## Throws

If property name is invalid
