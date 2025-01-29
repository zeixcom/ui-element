import { effect } from 'alien-signals'

import { isFunction, isString } from '../core/util'
import { parse } from '../core/parse'
import type { UIElement } from '../ui-element'

/* === Types === */

type ElementUpdater<E extends Element, T> = {
    r: (element: E) => T | null, // read
    u: (element: E, value: T) => void, // update
    d?: (element: E) => void, // delete
}

type StateKeyOrFunction<T> = PropertyKey | ((v?: T | null) => T)

/* === Internal Functions === */

const isSafeURL = /*#__PURE__*/ (value: string): boolean => {
	if (/^(mailto|tel):/i.test(value)) return true
	if (value.includes('://')) {
		try {
			const url = new URL(value, window.location.origin)
			return ['http:', 'https:', 'ftp:'].includes(url.protocol)
		} catch (error) {
			return false
		}
	}
	return true
}

const safeSetAttribute = /*#__PURE__*/ (
	element: Element,
	attr: string,
	value: string
): void => {
	if (/^on/i.test(attr)) throw new Error(`Unsafe attribute: ${attr}`)
	value = String(value).trim()
	if (!isSafeURL(value)) throw new Error(`Unsafe URL for ${attr}: ${value}`)
	element.setAttribute(attr, value)
}

/* === Exported Functions === */

/**
 * Auto-Effect to emit a custom event when a state changes
 * 
 * @since 0.8.3
 * @param {string} event - event name to dispatch
 * @param {StateKeyOrFunction<T>} s - state key or function
 */
const emit = <E extends Element, T>(
	event: string,
	s: StateKeyOrFunction<T> = event
) => (host: UIElement, target: E): void => {
	effect(() => {
		target.dispatchEvent(new CustomEvent(event, {
			detail: host.get(s),
			bubbles: true
		}))
	})
}

/**
 * Auto-effect for setting properties of a target element according to a given state
 * 
 * @since 0.9.0
 * @param {StateKeyOrFunction<T>} s - state bound to the element property
 * @param {ElementUpdater} updater - updater object containing key, read, update, and delete methods
 */
const updateElement = <E extends Element, T>(
	s: StateKeyOrFunction<T>,
	updater: ElementUpdater<E, T>
) => (host: UIElement, target: E): void => {
	const { r, u, d } = updater // read, update, delete methods
	const fallback = r(target)
	if (!isFunction(s)) { // s is PropertyKey
		const value = isString(s) && isString(fallback)
			? parse(host, s, fallback)
			: fallback
		host.set(s, value, false)
	}
	effect(() => {
		const current = r(target)
		const value = isFunction(s) ? s(current) : host.get<T>(s)
		if (!Object.is(value, current)) {

			// A value of null triggers deletion
			if (null === value && d) d(target)
			
			// A value of undefined triggers reset to the default value
			else if (null == value && fallback) u(target, fallback)

			// Otherwise, update the value
			else if (null != value) u(target, value)

			// Do nothing if value is nullish and neither delete method or fallback value is provided
		}
	})
}

/**
 * Create an element with a given tag name and optionally set its attributes
 * 
 * @since 0.9.0
 * @param {string} tag - tag name of the element to create
 * @param {StateKeyOrFunction<Record<string, string>>} s - state bound to the element's attributes
 */
const createElement = (
    tag: string,
    s: StateKeyOrFunction<Record<string, string>>,
	text?: string,
) => updateElement(s, {
	r: () => null,
	u: (el, attributes) => {
		const child = document.createElement(tag)
		for (const [key, value] of Object.entries(attributes))
			safeSetAttribute(child, key, value)
		if (text) child.textContent = text
		el.append(child)
	},
})

/**
 * Remove an element from the DOM
 * 
 * @since 0.9.0
 * @param {StateKeyOrFunction<boolean>} s - state bound to the element removal
 */
const removeElement = (s: StateKeyOrFunction<boolean>) =>
	updateElement(s, {
		r: el => null != el,
		u: (el, really) => {
			really && el.remove()
		}
	})

/**
 * Set text content of an element
 * 
 * @since 0.8.0
 * @param {StateKeyOrFunction<string>} s - state bound to the text content
 */
const setText = (s: StateKeyOrFunction<string>) =>
	updateElement(s, {
		r: el => el.textContent,
		u: (el, value) => {
			Array.from(el.childNodes)
				.filter(node => node.nodeType !== Node.COMMENT_NODE)
				.forEach(node => node.remove())
			el.append(document.createTextNode(value))
		}
	})

/**
 * Set property of an element
 * 
 * @since 0.8.0
 * @param {PropertyKey} key - name of property to be set
 * @param {StateKeyOrFunction<unknown>} s - state bound to the property value
 */
const setProperty = (
	key: PropertyKey,
	s: StateKeyOrFunction<unknown> = key
) => updateElement(s, {
	r: el => (el as Record<PropertyKey, any>)[key],
	u: (el, value) => {
		(el as Record<PropertyKey, any>)[key] = value
	}
})

/**
 * Set attribute of an element
 * 
 * @since 0.8.0
 * @param {string} name - name of attribute to be set
 * @param {StateKeyOrFunction<string>} s - state bound to the attribute value
 */
const setAttribute = (
	name: string,
	s: StateKeyOrFunction<string> = name
) => updateElement(s, {
	r: el => el.getAttribute(name),
	u: (el, value) => {
		safeSetAttribute(el, name, value)
	},
	d: el => {
		el.removeAttribute(name)
	}
})

/**
 * Toggle a boolan attribute of an element
 * 
 * @since 0.8.0
 * @param {string} name - name of attribute to be toggled
 * @param {StateKeyOrFunction<boolean>} s - state bound to the attribute existence
 */
const toggleAttribute = (
	name: string,
	s: StateKeyOrFunction<boolean> = name
) => updateElement(s, {
	r: el => el.hasAttribute(name),
	u: (el, value) => {
		el.toggleAttribute(name, value)
	}
})

/**
 * Toggle a classList token of an element
 * 
 * @since 0.8.0
 * @param {string} token - class token to be toggled
 * @param {StateKeyOrFunction<boolean>} s - state bound to the class existence
 */
const toggleClass = (
	token: string,
	s: StateKeyOrFunction<boolean> = token
) => updateElement(s, {
	r: el => el.classList.contains(token),
	u: (el, value) => {
		el.classList.toggle(token, value)
	}
})

/**
 * Set a style property of an element
 * 
 * @since 0.8.0
 * @param {string} prop - name of style property to be set
 * @param {StateKeyOrFunction<string>} s - state bound to the style property value
 */
const setStyle = <E extends (HTMLElement | SVGElement | MathMLElement)>(
	prop: string,
	s: StateKeyOrFunction<string> = prop
) => updateElement(s, {
		r: (el: E) => el.style.getPropertyValue(prop),
		u: (el: E, value) => {
			el.style.setProperty(prop, value)
		},
		d: (el: E) => {
			el.style.removeProperty(prop)
		}
	})



/* === Exported Types === */

export {
	type ElementUpdater,
	emit, updateElement,
	createElement, removeElement,
	setText, setProperty, setAttribute, toggleAttribute, toggleClass, setStyle
}
