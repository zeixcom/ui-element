[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / component

# Function: component()

> **component**\<`P`\>(`name`, `init`, `setup`): `void`

Defined in: [src/component.ts:285](https://github.com/efflore/ui-element/blob/6f13c4cee43b2a37b146c096e1a255409b73e79b/src/component.ts#L285)

Define a component with its states and setup function (connectedCallback)

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

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
