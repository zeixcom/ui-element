[**@zeix/le-truc**](../README.md)

***

[@zeix/le-truc](../globals.md) / component

# Function: component()

> **component**\<`P`\>(`name`, `init`, `setup`): [`Component`](../type-aliases/Component.md)\<`P`\>

Defined in: [src/component.ts:137](https://github.com/zeixcom/ui-element/blob/95bb6f2fa5df3c16f08fcbbecd9622c693742c39/src/component.ts#L137)

Define a component with dependency resolution and setup function (connectedCallback)

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

## Parameters

### name

`string`

Name of the custom element

### init

\{ \[K in string \| number \| symbol\]: K extends string ? Initializer\<K\<K\>, P\> : never \}

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
