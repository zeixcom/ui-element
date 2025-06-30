[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / ElementEventMap

# Type Alias: ElementEventMap\<E\>

> **ElementEventMap**\<`E`\> = `E` *extends* `HTMLInputElement` \| `HTMLTextAreaElement` \| `HTMLSelectElement` ? `Pick`\<`HTMLElementEventMap`, `"input"` \| `"change"` \| `"focus"` \| `"blur"` \| `"invalid"` \| `"keydown"` \| `"keyup"` \| `"keypress"` \| `"click"` \| `"mousedown"` \| `"mouseup"` \| `"paste"` \| `"cut"` \| `"copy"`\> : `E` *extends* `HTMLFormElement` ? `Pick`\<`HTMLElementEventMap`, `"submit"` \| `"reset"` \| `"formdata"`\> : `E` *extends* `HTMLButtonElement` ? `Pick`\<`HTMLElementEventMap`, `"click"` \| `"focus"` \| `"blur"` \| `"keydown"` \| `"keyup"` \| `"keypress"`\> : `E` *extends* `HTMLAnchorElement` ? `Pick`\<`HTMLElementEventMap`, `"click"` \| `"focus"` \| `"blur"`\> : `E` *extends* `HTMLDetailsElement` ? `Pick`\<`HTMLElementEventMap`, `"toggle"`\> : `E` *extends* `HTMLDialogElement` ? `Pick`\<`HTMLElementEventMap`, `"close"` \| `"cancel"`\> : `E` *extends* `HTMLMediaElement` ? `Pick`\<`HTMLElementEventMap`, `"loadstart"` \| `"loadeddata"` \| `"canplay"` \| `"play"` \| `"pause"` \| `"ended"` \| `"volumechange"`\> : `E` *extends* `HTMLImageElement` ? `Pick`\<`HTMLElementEventMap`, `"load"` \| `"error"`\> : `HTMLElementEventMap`

Defined in: [src/core/dom.ts:22](https://github.com/zeixcom/ui-element/blob/051e9e1bc23b455abad71bf33880530a33e32030/src/core/dom.ts#L22)

## Type Parameters

### E

`E` *extends* `Element`
