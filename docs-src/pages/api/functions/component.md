[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / component

# Function: component()

> **component**\<`P`\>(`name`, `init`, `setup`): `void`

Defined in: [src/component.ts:263](https://github.com/zeixcom/ui-element/blob/f5c20c5e6da1a988462bc7f68d75f2a4c0200046/src/component.ts#L263)

Define a component with its states and setup function (connectedCallback)

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md) & `ValidateComponentProps`\<`P`\>

## Parameters

### name

`string`

Name of the custom element

### init

\{ \[K in string \| number \| symbol\]: Initializer\<P\[K\], Component\<P\>\> \} = `...`

Signals of the component

### setup

(`host`, `select`) => [`Effect`](../type-aliases/Effect.md)\<`P`, [`Component`](../type-aliases/Component.md)\<`P`\>\>[]

Setup function to be called in connectedCallback(), may return cleanup function to be called in disconnectedCallback()
@returns: void

## Returns

`void`

## Since

0.12.0
