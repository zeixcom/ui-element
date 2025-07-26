[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / component

# Function: component()

> **component**\<`P`\>(`name`, `init`, `setup`): `void`

Defined in: [src/component.ts:301](https://github.com/zeixcom/ui-element/blob/1e2981711e0b3b45697eacbe8601e2ce3440aa11/src/component.ts#L301)

Define a component with its states and setup function (connectedCallback)

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

(`host`, `select`) => [`Effects`](../type-aliases/Effects.md)\<`P`, [`Component`](../type-aliases/Component.md)\<`P`\>\>

Setup function to be called in connectedCallback(), may return cleanup function to be called in disconnectedCallback()

## Returns

`void`

## Since

0.12.0

## Throws

If component name is invalid

## Throws

If property name is invalid

## Throws

If setup function is invalid
