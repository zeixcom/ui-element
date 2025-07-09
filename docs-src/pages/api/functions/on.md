[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / on

# Function: on()

> **on**\<`E`\>(`listeners`): [`Effect`](../type-aliases/Effect.md)\<[`ComponentProps`](../type-aliases/ComponentProps.md), `E`\>

Defined in: [src/lib/effects.ts:643](https://github.com/zeixcom/ui-element/blob/e1c0693393151dbc67087d7dde9d2a2f9e7dd58b/src/lib/effects.ts#L643)

Effect for attaching an event listener to an element.
Provides proper cleanup when the effect is disposed.

## Type Parameters

### E

`E` *extends* `HTMLElement`

## Parameters

### listeners

Event listener function

#### abort?

`EventListener`

#### animationcancel?

`EventListener`

#### animationend?

`EventListener`

#### animationiteration?

`EventListener`

#### animationstart?

`EventListener`

#### auxclick?

`EventListener`

#### beforeinput?

`EventListener`

#### beforetoggle?

`EventListener`

#### blur?

`EventListener`

#### cancel?

`EventListener`

#### canplay?

`EventListener`

#### canplaythrough?

`EventListener`

#### change?

`EventListener`

#### click?

`EventListener`

#### close?

`EventListener`

#### compositionend?

`EventListener`

#### compositionstart?

`EventListener`

#### compositionupdate?

`EventListener`

#### context-request?

`EventListener`

A 'context-request' event can be emitted by any element which desires
a context value to be injected by an external provider.

#### contextlost?

`EventListener`

#### contextmenu?

`EventListener`

#### contextrestored?

`EventListener`

#### copy?

`EventListener`

#### cuechange?

`EventListener`

#### cut?

`EventListener`

#### dblclick?

`EventListener`

#### drag?

`EventListener`

#### dragend?

`EventListener`

#### dragenter?

`EventListener`

#### dragleave?

`EventListener`

#### dragover?

`EventListener`

#### dragstart?

`EventListener`

#### drop?

`EventListener`

#### durationchange?

`EventListener`

#### emptied?

`EventListener`

#### ended?

`EventListener`

#### error?

`EventListener`

#### focus?

`EventListener`

#### focusin?

`EventListener`

#### focusout?

`EventListener`

#### formdata?

`EventListener`

#### fullscreenchange?

`EventListener`

#### fullscreenerror?

`EventListener`

#### gotpointercapture?

`EventListener`

#### input?

`EventListener`

#### invalid?

`EventListener`

#### keydown?

`EventListener`

#### keypress?

`EventListener`

#### keyup?

`EventListener`

#### load?

`EventListener`

#### loadeddata?

`EventListener`

#### loadedmetadata?

`EventListener`

#### loadstart?

`EventListener`

#### lostpointercapture?

`EventListener`

#### mousedown?

`EventListener`

#### mouseenter?

`EventListener`

#### mouseleave?

`EventListener`

#### mousemove?

`EventListener`

#### mouseout?

`EventListener`

#### mouseover?

`EventListener`

#### mouseup?

`EventListener`

#### paste?

`EventListener`

#### pause?

`EventListener`

#### play?

`EventListener`

#### playing?

`EventListener`

#### pointercancel?

`EventListener`

#### pointerdown?

`EventListener`

#### pointerenter?

`EventListener`

#### pointerleave?

`EventListener`

#### pointermove?

`EventListener`

#### pointerout?

`EventListener`

#### pointerover?

`EventListener`

#### pointerup?

`EventListener`

#### progress?

`EventListener`

#### ratechange?

`EventListener`

#### reset?

`EventListener`

#### resize?

`EventListener`

#### scroll?

`EventListener`

#### scrollend?

`EventListener`

#### securitypolicyviolation?

`EventListener`

#### seeked?

`EventListener`

#### seeking?

`EventListener`

#### select?

`EventListener`

#### selectionchange?

`EventListener`

#### selectstart?

`EventListener`

#### slotchange?

`EventListener`

#### stalled?

`EventListener`

#### submit?

`EventListener`

#### suspend?

`EventListener`

#### timeupdate?

`EventListener`

#### toggle?

`EventListener`

#### touchcancel?

`EventListener`

#### touchend?

`EventListener`

#### touchmove?

`EventListener`

#### touchstart?

`EventListener`

#### transitioncancel?

`EventListener`

#### transitionend?

`EventListener`

#### transitionrun?

`EventListener`

#### transitionstart?

`EventListener`

#### volumechange?

`EventListener`

#### waiting?

`EventListener`

#### webkitanimationend?

`EventListener`

#### webkitanimationiteration?

`EventListener`

#### webkitanimationstart?

`EventListener`

#### webkittransitionend?

`EventListener`

#### wheel?

`EventListener`

## Returns

[`Effect`](../type-aliases/Effect.md)\<[`ComponentProps`](../type-aliases/ComponentProps.md), `E`\>

Effect function that manages the event listener

## Since

0.13.3
