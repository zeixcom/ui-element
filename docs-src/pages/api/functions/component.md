[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / component

# Function: component()

> **component**\<`P`\>(`name`, `init`, `setup`): `void`

Defined in: [src/component.ts:289](https://github.com/zeixcom/ui-element/blob/0e9cacf03a8f95418720628d5174fbb006152743/src/component.ts#L289)

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
