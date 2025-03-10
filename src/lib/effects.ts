import { type Signal, effect, enqueue, isComputed, isSignal, UNSET } from '@zeix/cause-effect'

import { isFunction, isString } from '../core/util'
import { type ComponentSignals, parse, UIElement, RESET } from '../ui-element'
import { elementName, log, LOG_ERROR } from '../core/log'

/* === Types === */

type SignalValueProvider<T> = <E extends Element>(target: E, index: number) => T

type SignalLike<T> = PropertyKey
	| Signal<NonNullable<T>>
	| SignalValueProvider<T>

type ElementUpdater<E extends Element, T> = {
	op: string,
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
const updateElement = <
	E extends Element,
	T extends {},
	S extends ComponentSignals = {},
	K extends keyof S = never
>(
	s: K | SignalLike<T>,
	updater: ElementUpdater<E, S[K] | T>
) => (host: UIElement<S>, target: E, index: number): void => {
	const { op, read, update } = updater
	const fallback = read(target)

	// If not yet set, set signal value to value read from DOM
	if (isString(s) && !isComputed(host.signals[s as K])) {
		const value = isString(fallback)
			? parse(host, s, fallback)
			: fallback
		if (null != value) host.set(s as K, value as S[K], false)
	}

    // Update the element's DOM state according to the signal value
	effect(() => {
			let value = RESET
			try {
				value = isString(s) ? host.get(s)
					: isSignal(s) ? s.get()
					: isFunction(s) ? s(target, index)
					: RESET
			} catch (error) {
				log(error, `Failed to update element ${elementName(target)} in ${elementName(host)}:`, LOG_ERROR)
			} finally {
				if (value === RESET) value = fallback as T
				if (value === UNSET) value = null
			}
			const current = read(target)
			if (!Object.is(value, current)) {

				// A value of null or UNSET triggers deletion (if available)
				if (
					(value === null || (value == null && fallback === null))
					&& updater.delete
				) {
					enqueue(() => {
						updater.delete!(target)
						return true
					}, [target, op])

				// Otherwise every nullish value triggers reset to the fallback value (if available)
				} else if (value == null) {
					if (fallback) {
						enqueue(() => {
							update(target, fallback)
							return true
						}, [target, op])
					}
					// else do nothing if neither delete method nor fallback value is provided 

				// Otherwise, update the value
				} else {
					enqueue(() => {
						update(target, value)
						return true
					}, [target, op])
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
const createElement = <E extends Element>(
    tag: string,
    s: SignalLike<Record<string, string>>,
	text?: string,
) => updateElement(s, {
	op: 'create',
	read: () => null,
	update: (el: E, attributes) => {
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
	op: 'remove',
	read: (el: E) => !!el,
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
	op: 'text',
	read: (el: E) => el.textContent,
	update: (el: E, value) => {
		Array.from(el.childNodes)
			.filter(node => node.nodeType !== Node.COMMENT_NODE)
			.forEach(node => node.remove())
		el.append(document.createTextNode(value))
	}
})

/**
 * Set inner HTML of an element
 * 
 * @since 0.11.0
 * @param {SignalLike<string>} s - state bound to the inner HTML
 * @param {'open' | 'closed'} [attachShadow] - whether to attach a shadow root to the element, expects mode 'open' or 'closed'
 * @param {boolean} [allowScripts] - whether to allow executable script tags in the HTML content, defaults to false
 */
const dangerouslySetInnerHTML = <E extends Element>(
    s: SignalLike<string>,
	attachShadow?: 'open' | 'closed',
	allowScripts?: boolean,
) => updateElement(s, {
	op: 'html',
    read: (el: E) => (el.shadowRoot || !attachShadow ? el : null)?.innerHTML ?? '',
    update: (el: E, html) => {
		if (!html) {
			if (el.shadowRoot) el.shadowRoot.innerHTML = '<slot></slot>'
			return
		}
		if (attachShadow && !el.shadowRoot) el.attachShadow({ mode: attachShadow })
		const target = el.shadowRoot || el
        target.innerHTML = html
		if (!allowScripts) return
		target.querySelectorAll('script').forEach(script => {
			const newScript = document.createElement('script')
			newScript.appendChild(document.createTextNode(script.textContent ?? ''))
			target.appendChild(newScript)
			script.remove()
		})
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
	op: 'prop',
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
	op: 'attr',
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
	op: 'attr',
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
	op: 'class',
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
	op: 'style',
	read: (el: E) => el.style.getPropertyValue(prop),
	update: (el: E, value: string) => {
		el.style.setProperty(prop, value)
	},
	delete: (el: E) => {
		el.style.removeProperty(prop)
	}
})

/* === Exported Types === */

export {
	type SignalValueProvider, type SignalLike, type ElementUpdater,
	updateElement, createElement, removeElement,
	setText, setProperty, setAttribute, toggleAttribute, toggleClass, setStyle,
	dangerouslySetInnerHTML
}
