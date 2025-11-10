[**@zeix/el-truco**](../README.md)

***

[@zeix/el-truco](../globals.md) / component

# Function: component()

> **component**\<`P`\>(`name`, `init`, `setup`): [`Component`](../type-aliases/Component.md)\<`P`\>

Defined in: [src/component.ts:154](https://github.com/zeixcom/ui-element/blob/a49c7d7fbed01d04dd21940c975f1839fc83bb07/src/component.ts#L154)

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
