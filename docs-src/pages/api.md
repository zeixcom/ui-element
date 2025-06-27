---
title: 'API Reference'
emoji: '📚'
description: 'Functions, types, and constants'
---

<section-hero>

# 📚 API Reference

<div>
  <p class="lead">Functions, types, and constants</p>
  {{ toc }}
</div>

</section-hero>

<section>

## Component

Create a Web Component of type [Component](api/type-aliases/Component.html) with reactive properties that extend [ComponentProps](api/type-aliases/ComponentProps.html).

- [component](api/functions/component.html)

</section>

<section>

## Signals

Create a signal of type [Signal](api/type-aliases/Signal.html).

- [computed](api/functions/computed.html) creates a [Computed](api/type-aliases/Computed.html) signal derived from other signals
- [selection](api/functions/selection.html) creates a [Computed](api/type-aliases/Computed.html) signal that updates according to a dynamic CSS selector
- [sensor](api/functions/sensor.html) creates a [Computed](api/type-aliases/Computed.html) signal that updates according to events
- [state](api/functions/state.html) creates a [State](api/type-aliases/State.html) signal

Helper functions:

- [isComputed](api/functions/isComputed.html) checks whether a value is a [Computed](api/type-aliases/Computed.html) signal
- [isSignal](api/functions/isSignal.html) checks whether a value is a [Signal](api/type-aliases/Signal.html)
- [isState](api/functions/isState.html) checks whether a value is a [State](api/type-aliases/State.html) signal

</section>

<section>

## Attribute Parsers

Declare how attributes are parsed. Functions returning [AttributeParser](api/type-aliases/AttributeParser.html) that will be used to create [State](api/type-aliases/State.html) signals as reactive properties on the component.

- [asBoolean](api/functions/asBoolean.html)
- [asEnum](api/functions/asEnum.html)
- [asInteger](api/functions/asInteger.html)
- [asJSON](api/functions/asJSON.html)
- [asNumber](api/functions/asNumber.html)
- [asString](api/functions/asString.html)

</section>

<section>

## Signal Initializers

Declare how signals are initialized. Variable of type or function returning [SignalInitializer](api/type-aliases/SignalInitializer.html):

- [fromContext](api/functions/fromContext.html) consumes a context value from nearest ancestor context provider component
- [fromDescendant](api/functions/fromDescendant.html) gets a reactive property of a descendant component
- [fromDescendants](api/functions/fromDescendants.html) reduces properties of a collection of descendant elements to a single value
- [fromEvent](api/functions/fromEvent.html) creates a computed signal from an event handler on a descendant element
- [fromSelector](api/functions/fromSelector.html) creates a computed signal of descentant elements matching a CSS selector

</section>

<section>

## Effects

Declare effects of type [FxFunction](api/type-aliases/FxFunction.html) to be applied when signals change:

- [dangerouslySetInnerHTML](api/functions/dangerouslySetInnerHTML.html)
- [emit](api/functions/emit.html)
- [insertOrRemoveElement](api/functions/insertOrRemoveElement.html)
- [on](api/functions/on.html)
- [pass](api/functions/pass.html)
- [provide](api/functions/provide.html)
- [setAttribute](api/functions/setAttribute.html)
- [setProperty](api/functions/setProperty.html)
- [setStyle](api/functions/setStyle.html)
- [setText](api/functions/setText.html)
- [show](api/functions/show.html)
- [toggleAttribute](api/functions/toggleAttribute.html)
- [toggleClass](api/functions/toggleClass.html)
- [updateElement](api/functions/updateElement.html)

</section>
