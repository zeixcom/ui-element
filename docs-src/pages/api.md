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

Create a Web Component of type [Component](api/type-aliases/Component.html):

- [component](api/functions/component.html)

</section>

<section>

## Signals

Create a signal of type [Signal](api/type-aliases/Signal.html):

- [computed](api/functions/computed.html)
- [selection](api/functions/selection.html)
- [sensor](api/functions/sensor.html)
- [state](api/functions/state.html)

Helper functions:

- [isComputed](api/functions/isComputed.html)
- [isSignal](api/functions/isSignal.html)
- [isState](api/functions/isState.html)

</section>

<section>

## Attribute Parsers

Declare how attributes are parsed. Variable of type or function returning [AttributeParser](api/type-aliases/AttributeParser.html):

- [asBoolean](api/variables/asBoolean.html)
- [asEnum](api/functions/asEnum.html)
- [asInteger](api/functions/asInteger.html)
- [asJSON](api/functions/asJSON.html)
- [asNumber](api/functions/asNumber.html)
- [asString](api/functions/asString.html)

</section>

<section>

## Signal Initializers

Declare how signals are initialized. Variable of type or function returning [SignalInitializer](api/type-aliases/SignalInitializer.html):

- [consume](api/functions/consume.html)
- [fromChild](api/functions/fromChild.html)
- [fromChildren](api/functions/fromChildren.html)
- [fromEvent](api/functions/fromEvent.html)
- [fromSelector](api/functions/fromSelector.html)

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
