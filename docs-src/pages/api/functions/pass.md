[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / pass

# Function: pass()

> **pass**\<`P`, `Q`\>(`signals`): \<`E`\>(`host`, `target`) => `void`

Defined in: [src/core/dom.ts:462](https://github.com/zeixcom/ui-element/blob/6285025fa3b3778fb2f356dae80a5fa6250ac264/src/core/dom.ts#L462)

Pass signals to a custom element

## Type Parameters

### P

`P` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

### Q

`Q` *extends* [`ComponentProps`](../type-aliases/ComponentProps.md)

## Parameters

### signals

signals to be passed to the custom element

[`PassedSignals`](../type-aliases/PassedSignals.md)\<`P`, `Q`\> | (`target`) => [`PassedSignals`](../type-aliases/PassedSignals.md)\<`P`, `Q`\>

## Returns

> \<`E`\>(`host`, `target`): `void`

### Type Parameters

#### E

`E` *extends* `Element`

### Parameters

#### host

[`Component`](../type-aliases/Component.md)\<`P`\>

#### target

`E`

### Returns

`void`

## Since

0.12.0

## Throws

- if the target element is not a custom element

## Throws

- if the provided signals are not an object or a provider function

## Throws

- if it fails to pass signals to the target element
