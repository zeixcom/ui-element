[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / component

# Function: component()

> **component**\<`P`\>(`name`, `init`, `setup`): [`Component`](../type-aliases/Component.md)\<`P`\>

Defined in: [src/component.ts:279](https://github.com/zeixcom/ui-element/blob/fdee81c49c23952a5a7a3dbafc3562620a973123/src/component.ts#L279)

Define a component with its states and setup function (connectedCallback)

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

## Parameters

### name

`string`

name of the custom element

### init

\{ \[K in string \| number \| symbol\]: Initializer\<P\[K\], Component\<P\>\> \} = `...`

signals of the component

### setup

(`host`, `select`) => [`FxFunction`](../type-aliases/FxFunction.md)\<`P`, [`Component`](../type-aliases/Component.md)\<`P`\>\>[]

setup function to be called in connectedCallback(), may return cleanup function to be called in disconnectedCallback()

## Returns

[`Component`](../type-aliases/Component.md)\<`P`\>

- constructor function for the custom element

## Since

0.12.0
