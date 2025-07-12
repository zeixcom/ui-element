[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / component

# Function: component()

> **component**\<`P`\>(`name`, `init`, `setup`): `void`

Defined in: [src/component.ts:285](https://github.com/zeixcom/ui-element/blob/29b42270573af1b19b68f0383c60c6f1221e3f0d/src/component.ts#L285)

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
