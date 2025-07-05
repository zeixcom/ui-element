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

- [component](api/functions/component.html) defines a custom element with reactive properties and declarative effects

</section>

<section>

## Signals

Create a signal of type [Signal](api/type-aliases/Signal.html).

- [computed](api/functions/computed.html) creates a [Computed](api/type-aliases/Computed.html) signal derived from other signals
- [state](api/functions/state.html) creates a [State](api/type-aliases/State.html) signal

Helper functions:

- [isComputed](api/functions/isComputed.html) checks whether a value is a [Computed](api/type-aliases/Computed.html) signal
- [isSignal](api/functions/isSignal.html) checks whether a value is a [Signal](api/type-aliases/Signal.html)
- [isState](api/functions/isState.html) checks whether a value is a [State](api/type-aliases/State.html) signal

</section>

<section>

## Attribute Parsers

Declare how attributes are parsed. Functions returning [AttributeParser](api/type-aliases/AttributeParser.html) that will be used to create [State](api/type-aliases/State.html) signals as reactive properties on the component.

- [asBoolean](api/functions/asBoolean.html) parses boolean attributes (presence indicates true)
- [asEnum](api/functions/asEnum.html) parses string attributes constrained to specific values
- [asInteger](api/functions/asInteger.html) parses integer attributes with validation
- [asJSON](api/functions/asJSON.html) parses JSON attributes into JavaScript objects
- [asNumber](api/functions/asNumber.html) parses numeric attributes as floating-point numbers
- [asString](api/functions/asString.html) parses string attributes

</section>

<section>

## Signal Producers

Declare how signals are initialized. Variable of type or function returning [SignalProducer](api/type-aliases/SignalProducer.html):

- [fromContext](api/functions/fromContext.html) consumes a context value from nearest ancestor context provider component
- [fromDescendant](api/functions/fromDescendant.html) gets a reactive property of a descendant component
- [fromDescendants](api/functions/fromDescendants.html) reduces properties of a collection of descendant elements to a single value
- [fromEvent](api/functions/fromEvent.html) creates a computed signal from an event handler on a descendant element
- [fromSelector](api/functions/fromSelector.html) creates a computed signal of descentant elements matching a CSS selector

</section>

<section>

## Effects

Declare effects of type [FxFunction](api/type-aliases/FxFunction.html) to be applied when signals change:

- [dangerouslySetInnerHTML](api/functions/dangerouslySetInnerHTML.html) sets inner HTML content from a signal
- [emit](api/functions/emit.html) dispatches custom events when signals change
- [insertOrRemoveElement](api/functions/insertOrRemoveElement.html) conditionally inserts or removes elements
- [on](api/functions/on.html) attaches event listeners to elements
- [pass](api/functions/pass.html) passes signal values to descendant component properties
- [provide](api/functions/provide.html) provides context values to descendant components
- [setAttribute](api/functions/setAttribute.html) sets element attributes from signals
- [setProperty](api/functions/setProperty.html) sets element properties from signals
- [setStyle](api/functions/setStyle.html) sets CSS styles from signals
- [setText](api/functions/setText.html) sets text content from signals
- [show](api/functions/show.html) conditionally shows or hides elements
- [toggleAttribute](api/functions/toggleAttribute.html) toggles attributes based on signal values
- [toggleClass](api/functions/toggleClass.html) toggles CSS classes based on signal values
- [updateElement](api/functions/updateElement.html) base function for updating elements, used for [setText](api/functions/setText.html), [show](api/functions/show.html), [toggleClass](api/functions/toggleClass.html), [toggleAttribute](api/functions/toggleAttribute.html), [setAttribute](api/functions/setAttribute.html), [setProperty](api/functions/setProperty.html), [setStyle](api/functions/setStyle.html)

</section>
