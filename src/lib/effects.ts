import { effect, UNSET } from '@zeix/cause-effect'
import { ce, ra, re, rs, sa, ss, st, ta, tc } from '@zeix/pulse'

import { isFunction, isString } from '../core/util'
import { parse, UIElement } from '../ui-element'
import type { StateLike } from '../core/ui'

/* === Types === */

type ElementUpdater<E extends Element, T> = {
    read: (element: E) => T | null,
    update: (element: E, value: T) => void,
    delete?: (element: E) => void,
}

/* === Exported Functions === */

/**
 * Effect for setting properties of a target element according to a given state
 * 
 * @since 0.9.0
 * @param {StateLike<T>} s - state bound to the element property
 * @param {ElementUpdater} updater - updater object containing key, read, update, and delete methods
 */
const updateElement = <E extends Element, T extends {}>(
	s: StateLike<T>,
	updater: ElementUpdater<E, T>
) => (host: UIElement, target: E): void => {
	const { read, update } = updater
	const fallback = read(target)

	// If not yet set, set signal value to value read from DOM
	if (isString(s) && !host.has(s)) {
		const value = isString(fallback)
			? parse(host, s, fallback)
			: fallback
		if (null != value) host.set(s, value, false)
	}

    // Update the element's DOM state according to the signal value
	effect(() => {
		const current = read(target)
		const value = isString(s) ? host.get(s) : isFunction(s) ? s(current) : undefined
		if (!Object.is(value, current)) {

			// A nullish value or UNSET triggers deletion (if available) or reset to the default value
			if (value === UNSET || value == null) {
				if (fallback) update(target, fallback)
				else if (updater.delete) updater.delete(target)
			    // else do nothing if neither delete method nor fallback value is provided

			// Otherwise, update the value
			} else {
				update(target, value as T)
			}
		}
	})
}

/**
 * Create an element with a given tag name and optionally set its attributes
 * 
 * @since 0.9.0
 * @param {string} tag - tag name of the element to create
 * @param {StateLike<Record<string, string>>} s - state bound to the element's attributes
 */
const createElement = (
    tag: string,
    s: StateLike<Record<string, string>>
) => updateElement(s, {
	read: () => null,
	update: (el: Element, value) => ce(el, tag, value),
})

/**
 * Remove an element from the DOM
 * 
 * @since 0.9.0
 * @param {StateLike<string>} s - state bound to the element removal
 */
const removeElement = <E extends Element>(
	s: StateLike<boolean>
) => updateElement(s, {
	read: (el: E) => null != el,
    update: (el: E, value: boolean) => value ? re(el) : Promise.resolve(null)
})

/**
 * Set text content of an element
 * 
 * @since 0.8.0
 * @param {StateLike<string>} s - state bound to the text content
 */
const setText = <E extends Element>(
	s: StateLike<string>
) => updateElement(s, {
	read: (el: E) => el.textContent,
	update: (el: E, value) => st(el, value)
})

/**
 * Set property of an element
 * 
 * @since 0.8.0
 * @param {string} key - name of property to be set
 * @param {StateLike<unknown>} s - state bound to the property value
 */
const setProperty = <E extends Element>(
	key: string,
	s: StateLike<{}> = key
) => updateElement(s, {
	read: (el: E) => key in el ? (el as Record<string, unknown>)[key] : UNSET,
	update: (el: E, value: unknown) => (el as Record<string, unknown>)[key] = value,
})

/**
 * Set attribute of an element
 * 
 * @since 0.8.0
 * @param {string} name - name of attribute to be set
 * @param {StateLike<string>} s - state bound to the attribute value
 */
const setAttribute = <E extends Element>(
	name: string,
	s: StateLike<string> = name
) => updateElement(s, {
	read: (el: E) => el.getAttribute(name),
	update: (el: E, value: string) => sa(el, name, value),
	delete: (el: E) => ra(el, name)
})

/**
 * Toggle a boolan attribute of an element
 * 
 * @since 0.8.0
 * @param {string} name - name of attribute to be toggled
 * @param {StateLike<boolean>} s - state bound to the attribute existence
 */
const toggleAttribute = <E extends Element>(
	name: string,
	s: StateLike<boolean> = name
) => updateElement(s, {
	read: (el: E) => el.hasAttribute(name),
	update: (el: E, value: boolean) => ta(el, name, value)
})

/**
 * Toggle a classList token of an element
 * 
 * @since 0.8.0
 * @param {string} token - class token to be toggled
 * @param {StateLike<boolean>} s - state bound to the class existence
 */
const toggleClass = <E extends Element>(
	token: string,
	s: StateLike<boolean> = token
) => updateElement(s, {
	read: (el: E) => el.classList.contains(token),
	update: (el: E, value: boolean) => tc(el, token, value)
})

/**
 * Set a style property of an element
 * 
 * @since 0.8.0
 * @param {string} prop - name of style property to be set
 * @param {StateLike<string>} s - state bound to the style property value
 */
const setStyle = <E extends (HTMLElement | SVGElement | MathMLElement)>(
	prop: string,
	s: StateLike<string> = prop
) => updateElement(s, {
		read: (el: E) => el.style.getPropertyValue(prop),
		update: (el: E, value: string) => ss(el, prop, value) as Promise<E>,
		delete: (el: E) => rs(el, prop) as Promise<E>
	})



/* === Exported Types === */

export {
	type ElementUpdater,
	updateElement, createElement, removeElement,
	setText, setProperty, setAttribute, toggleAttribute, toggleClass, setStyle
}
