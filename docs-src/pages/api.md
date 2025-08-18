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

## Parsers

Declare how attributes are parsed. Functions returning [Parser](api/type-aliases/AttributeParser.html) that will be used to create [State](api/type-aliases/State.html) writable reactive properties on the component.

| Function                                      | Description                                                                                                                                                                  |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [asBoolean()](api/functions/asBoolean.html)   | Converts `"true"` / `"false"` to a **boolean** (`true` / `false`). Also treats empty attributes (`checked`) as `true` and missing attributes as `false`.                     |
| [asInteger()](api/functions/asInteger.html)   | Converts a numeric string (e.g., `"42"`) to an **integer** (`42`).                                                                                                           |
| [asNumber()](api/functions/asNumber.html)     | Converts a numeric string (e.g., `"3.14"`) to a **floating-point number** (`3.14`).                                                                                          |
| [asString()](api/functions/asString.html)     | Returns the attribute value as a **string** (unchanged).                                                                                                                     |
| [asEnum(values)](api/functions/asEnum.html)   | Ensures the string matches **one of the allowed values**. Example: `asEnum(["small", "medium", "large"])`. If the value is not in the list, it defaults to the first option. |
| [asJSON(fallback)](api/functions/asJSON.html) | Parses a JSON string (e.g., `'["a", "b", "c"]'`) into an **array** or **object**. If invalid, returns the fallback object.                                                   |

The pre-defined parsers `asInteger()`, `asNumber()` and `asString()` allow to set a custom fallback value as parameter.

The `asEnum()` parser requires an array of valid values, while the first will be the fallback value for invalid results.

The `asJSON()` parser requires a fallback object as parameter as `{}` probably won't match the type you're expecting.

</section>

<section>

## Extractors

Declare derived reactive properties. Functions returning type [Extractor](api/type-aliases/Extractor.html) that will be used to create [Computed](api/type-aliases/Computed.html) read-only reactive properties on the component.

- [fromContext](api/functions/fromContext.html) consumes a context value from nearest ancestor context provider component
- [fromDOM](api/functions/fromDOM.html) creates a computed signal reflecting a property of a descendant element
- [fromEvents](api/functions/fromEvents.html) creates a computed signal from event transformers on descendant elements
- [fromSelector](api/functions/fromSelector.html) creates a computed signal of descendant elements matching a CSS selector

</section>

<section>

## Effects

Declare effects of type [Effect](api/type-aliases/Effect.html) to be applied when signals change:

| Function                                                                | Description                                                                                     |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [setText()](api/functions/setText.html)                                 | Updates **text content** with a `string` signal value (while preserving comment nodes).         |
| [setProperty()](api/functions/setProperty.html)                         | Updates a given **property** with any signal value.                                             |
| [show()](api/functions/show.html)                                       | Updates the **visibility** of an element with a `boolean` signal value.                         |
| [setAttribute()](api/functions/setAttribute.html)                       | Updates a given **attribute** with a `string` signal value.                                     |
| [toggleAttribute()](api/functions/toggleAttribute.html)                 | Toggles a given **boolean attribute** with a `boolean` signal value.                            |
| [toggleClass()](api/functions/toggleClass.html)                         | Toggles a given **CSS class** with a `boolean` signal value.                                    |
| [setStyle()](api/functions/setStyle.html)                               | Updates a given **CSS property** with a `string` signal value.                                  |
| [dangerouslySetInnerHTML()](api/functions/dangerouslySetInnerHTML.html) | Sets **HTML content** with a `string` signal value.                                             |
| [insertOrRemoveElement()](api/functions/insertOrRemoveElement.html)     | Inserts (positive integer) or removes (negative integer) elements with a `number` signal value. |
| [emitEvent()](api/functions/emitEvent.html)                             | Dispatches custom events when signals change.                                                   |
| [on()](api/functions/on.html)                                           | Attaches event listeners to elements.                                                           |
| [pass()](api/functions/pass.html)                                       | Passes signal values to descendant component properties.                                        |
| [provideContexts()](api/functions/provideContexts.html)                 | Provides context values to descendant components.                                               |
| [updateElement()](api/functions/updateElement.html)                     | Base function for updating elements, used by other effects.                                     |

**Tip**: TypeScript will check whether a typed value is assignable to a certain element property. Prefer `setProperty()` over `setAttribute()` for increased type safety. Setting string attributes is possible for all elements, but will have an effect only on some.

</section>
