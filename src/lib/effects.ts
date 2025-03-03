import { effect, isSignal, UNSET } from '@zeix/cause-effect'

import { isFunction, isString } from '../core/util'
import { parse, UIElement, RESET, type ComponentSignals } from '../ui-element'
import type { SignalLike } from '../core/ui'
import { elementName, log, LOG_DEBUG, type LogLevel } from '../core/log'

/* === Types === */

type ElementUpdater<E extends Element, T> = {
    read: (element: E) => T | null,
    update: (element: E, value: T) => void,
    delete?: (element: E) => void,
}

/* === Private Functions === */

const isSafeURL = /*#__PURE__*/ (value: string): boolean => {
	if (/^(mailto|tel):/i.test(value)) return true
	if (value.includes('://')) {
		try {
			const url = new URL(value, window.location.origin)
			return ['http:', 'https:', 'ftp:'].includes(url.protocol)
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
 * Effect for setting properties of a target element according to a given state
 * 
 * @since 0.9.0
 * @param {SignalLike<T>} s - state bound to the element property
 * @param {ElementUpdater} updater - updater object containing key, read, update, and delete methods
 */
const updateElement = <E extends Element, T extends {}, S extends ComponentSignals = {}>(
	s: SignalLike<T>,
	updater: ElementUpdater<E, T>
) => (host: UIElement<S>, target: E): void => {
	const { read, update } = updater
	const fallback = read(target)

	// If not yet set, set signal value to value read from DOM
	if (isString(s)) {
		const value = isString(fallback)
			? parse(host, s, fallback)
			: fallback
		if (null != value) host.set(s, value as S[string], false)
	}

    // Update the element's DOM state according to the signal value
	effect(() => {
		const current = read(target)
		const value = isString(s) ? host.get(s)
			: isSignal(s) ? s.get()
			: isFunction(s) ? s(current)
			: undefined
		if (!Object.is(value, current)) {

			// A value of null or UNSET triggers deletion (if available)
			if (
				(value === null || value === UNSET || (value === RESET && fallback === null))
				&& updater.delete
			) {
				updater.delete(target)

			// Undefined or RESET triggers reset to the fallback value (if available)
			} else if (value == null || value === RESET) {
				if (fallback) update(target, fallback)
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
 * @param {SignalLike<Record<string, string>>} s - state bound to the element's attributes
 */
const createElement = (
    tag: string,
    s: SignalLike<Record<string, string>>,
	text?: string,
) => updateElement(s, {
	read: () => null,
	update: (el: Element, attributes) => {
		const child = document.createElement(tag);
		for (const [key, value] of Object.entries(attributes))
			safeSetAttribute(child, key, value);
		if (text)
			child.textContent = text;
		el.append(child);
	},
})

/**
 * Remove an element from the DOM
 * 
 * @since 0.9.0
 * @param {SignalLike<string>} s - state bound to the element removal
 */
const removeElement = <E extends Element>(
	s: SignalLike<boolean>
) => updateElement(s, {
	read: (el: E) => null != el,
    update: (el: E, really) => {
		if (really) el.remove()
	}
})

/**
 * Set text content of an element
 * 
 * @since 0.8.0
 * @param {SignalLike<string>} s - state bound to the text content
 */
const setText = <E extends Element>(
	s: SignalLike<string>
) => updateElement(s, {
	read: (el: E) => el.textContent,
	update: (el: E, value) => {
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
 * @param {string} key - name of property to be set
 * @param {SignalLike<E[K]>} s - state bound to the property value
 */
const setProperty = <E extends Element, K extends keyof E>(
	key: K,
	s: SignalLike<E[K]> = key
) => updateElement(s, {
	read: (el: E) => key in el ? el[key] : UNSET,
	update: (el: E, value: E[K]) => {
		el[key] = value
	}
})

/**
 * Set attribute of an element
 * 
 * @since 0.8.0
 * @param {string} name - name of attribute to be set
 * @param {SignalLike<string>} s - state bound to the attribute value
 */
const setAttribute = <E extends Element>(
	name: string,
	s: SignalLike<string> = name
) => updateElement(s, {
	read: (el: E) => el.getAttribute(name),
	update: (el: E, value: string) => {
		safeSetAttribute(el, name, value)
	},
	delete: (el: E) => {
		el.removeAttribute(name)
	}
})

/**
 * Toggle a boolan attribute of an element
 * 
 * @since 0.8.0
 * @param {string} name - name of attribute to be toggled
 * @param {SignalLike<boolean>} s - state bound to the attribute existence
 */
const toggleAttribute = <E extends Element>(
	name: string,
	s: SignalLike<boolean> = name
) => updateElement(s, {
	read: (el: E) => el.hasAttribute(name),
	update: (el: E, value: boolean) => {
		el.toggleAttribute(name, value)
	}
})

/**
 * Toggle a classList token of an element
 * 
 * @since 0.8.0
 * @param {string} token - class token to be toggled
 * @param {SignalLike<boolean>} s - state bound to the class existence
 */
const toggleClass = <E extends Element>(
	token: string,
	s: SignalLike<boolean> = token
) => updateElement(s, {
	read: (el: E) => el.classList.contains(token),
	update: (el: E, value: boolean) => {
		el.classList.toggle(token, value)
	}
})

/**
 * Set a style property of an element
 * 
 * @since 0.8.0
 * @param {string} prop - name of style property to be set
 * @param {SignalLike<string>} s - state bound to the style property value
 */
const setStyle = <E extends (HTMLElement | SVGElement | MathMLElement)>(
	prop: string,
	s: SignalLike<string> = prop
) => updateElement(s, {
		read: (el: E) => el.style.getPropertyValue(prop),
		update: (el: E, value: string) => {
			el.style.setProperty(prop, value)
		},
		delete: (el: E) => {
			el.style.removeProperty(prop)
		}
	})

/**
 * Log a message to the console
 * 
 * @since 0.10.1
 * @param {string} message - message to be logged
 * @param {SignalLike<T>} s - observed signal
 * @param {LogLevel} logLevel - log level to be used: LOG_DEBUG (default), LOG_INFO, LOG_WARN, LOG_ERROR
 */
const logMessage = <E extends Element, K extends keyof S, S extends ComponentSignals = {}>(
	message: string,
	s: SignalLike<S[K]> = message,
	logLevel: LogLevel = LOG_DEBUG
) => (host: UIElement<S>, target: E): void => {
	effect(() => {
		const value = isString(s) ? host.get(s)
			: isSignal(s) ? s.get()
			: isFunction(s) ? s()
			: undefined
		log(value, `${message} of ${elementName(host) + (target instanceof UIElement && host === target ? '' : `for ${elementName(target)}`)}`, logLevel)
	})
}

/* === Exported Types === */

export {
	type ElementUpdater,
	updateElement, createElement, removeElement,
	setText, setProperty, setAttribute, toggleAttribute, toggleClass, setStyle,
	logMessage
}
