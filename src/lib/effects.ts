import { type Signal, effect, enqueue, isComputed, isSignal, isState, UNSET } from '@zeix/cause-effect'

import { isFunction, isString } from '../core/util'
import { type ComponentSignals, parse, UIElement, RESET } from '../ui-element'
import { elementName, log, LOG_ERROR, valueString } from '../core/log'

/* === Types === */

type ValueProvider<T> = <E extends Element>(target: E, index: number) =>
	T

type SignalLike<T> = PropertyKey
	| Signal<NonNullable<T>>
	| ValueProvider<T>

type ElementUpdater<E extends Element, T> = {
	op: string,
    read: (element: E) => T | null,
    update: (element: E, value: T) => string,
    delete?: (element: E) => string,
}

type NodeInserter<S extends ComponentSignals> = {
	type: string,
	where: InsertPosition,
	create: (host: UIElement<S>) => Node | undefined,
}

/* === Internal === */

const ops: Record<string, string> = {
	a: 'attribute ',
    c: 'class ',
    h: 'inner HTML',
    p: 'property ',
	s: 'style property ',
	t: 'text content',
}

const resolveSignalLike = <T, S extends ComponentSignals, E extends Element>(
	s: SignalLike<T>,
	host: UIElement<S>,
	target: E,
	index: number
): T => isString(s) ? host.get(s)
	: isSignal(s) ? s.get()
	: isFunction(s) ? s(target, index)
	: RESET

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
 * Effect for setting properties of a target element according to a given SignalLike
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

	const err = (error: unknown, verb: string, prop: string = 'element') =>
		log(error, `Failed to ${verb} ${prop} ${elementName(target)} in ${elementName(host)}`, LOG_ERROR)

    // Update the element's DOM state according to the signal value
	effect(() => {
		let value = RESET
		try {
			value = resolveSignalLike(s, host, target, index)
		} catch (error) {
			err(error, 'update')
			return
		}
		if (value === RESET) value = fallback as T
		if (value === UNSET) value = updater.delete ? null : fallback

		// Nil path => delete the attribute or style property of the element
		if (updater.delete && value === null) {
			let name: string = ''
			enqueue(() => {
                name = updater.delete!(target)
                return true
            }, [target, op]).then(() => {
				log(target, `Deleted ${ops[op] + name} of ${elementName(target)} in ${elementName(host)}`)
			}).catch((error) => {
				err(error, 'delete', `${ops[op] + name} of`)
			})

		// Ok path => update the element
		} else if (value != null) {
			const current = read(target)
			if (Object.is(value, current)) return
			let name: string = ''
			enqueue(() => {
				name = update(target, value)
				return true
			}, [target, op]).then(() => {
				log(target, `Updated ${ops[op] + name} of ${elementName(target)} in ${elementName(host)}`)
			}).catch((error) => {
				err(error, 'update', `${ops[op] + name} of`)
			})
		}
	})
}

/**
 * Effect to insert a node relative to an element according to a given SignalLike
 */
const insertNode = <
	E extends Element,
	S extends ComponentSignals = {},
	K extends keyof S = never
>(
	s: K | SignalLike<boolean>,
    { type, where, create }: NodeInserter<S>
) => (host: UIElement<S>, target: E, index: number): void => {
	const methods: Record<InsertPosition, keyof Element> = {
		beforebegin: 'before',
		afterbegin: 'prepend',
        beforeend: 'append',
        afterend: 'after'
	}
	if (!isFunction(target[methods[where]])) {
		log(`Invalid insertPosition ${valueString(where)} for ${elementName(host)}:`, LOG_ERROR)
        return
    }
	const err = (error: unknown) =>
		log(error, `Failed to insert ${type} into ${elementName(host)}:`, LOG_ERROR)

	effect(() => {
		let really = false
		try {
			really = resolveSignalLike(s, host, target, index)
		} catch (error) {
			err(error)
			return
		}
		if (!really) return
        enqueue(() => {
			const node = create(host)
			if (!node) return
			(target[methods[where]] as (...nodes: Node[]) => void)(node)
		}, [target, 'i']).then(() => {
			const maybeSignal = isString(s) ? host.signals[s] : s
			if (isState<boolean>(maybeSignal)) maybeSignal.set(false)
			log(target, `Inserted ${type} into ${elementName(host)}`)
		}).catch((error) => {
			err(error)
		})
	})
}

/**
 * Set text content of an element
 * 
 * @since 0.8.0
 * @param {SignalLike<string>} s - state bound to the text content
 */
const setText = <E extends Element>(
	s: SignalLike<string>
) => updateElement(s, {
	op: 't',
	read: (el: E) => el.textContent,
	update: (el: E, value: string) => {
		Array.from(el.childNodes)
			.filter(node => node.nodeType !== Node.COMMENT_NODE)
			.forEach(node => node.remove())
		el.append(document.createTextNode(value))
		return ''
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
	op: 'p',
	read: (el: E) => key in el ? el[key] : UNSET,
	update: (el: E, value: E[K]) => {
		el[key] = value
		return String(key)
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
	op: 'a',
	read: (el: E) => el.getAttribute(name),
	update: (el: E, value: string) => {
		safeSetAttribute(el, name, value)
		return name
	},
	delete: (el: E) => {
		el.removeAttribute(name)
		return name
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
	op: 'a',
	read: (el: E) => el.hasAttribute(name),
	update: (el: E, value: boolean) => {
		el.toggleAttribute(name, value)
		return name
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
	op: 'c',
	read: (el: E) => el.classList.contains(token),
	update: (el: E, value: boolean) => {
		el.classList.toggle(token, value)
		return token
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
	op: 's',
	read: (el: E) => el.style.getPropertyValue(prop),
	update: (el: E, value: string) => {
		el.style.setProperty(prop, value)
		return prop
	},
	delete: (el: E) => {
		el.style.removeProperty(prop)
		return prop
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
	op: 'h',
    read: (el: E) => (el.shadowRoot || !attachShadow ? el : null)?.innerHTML ?? '',
    update: (el: E, html: string) => {
		if (!html) {
			if (el.shadowRoot) el.shadowRoot.innerHTML = '<slot></slot>'
			return ''
		}
		if (attachShadow && !el.shadowRoot) el.attachShadow({ mode: attachShadow })
		const target = el.shadowRoot || el
        target.innerHTML = html
		if (!allowScripts) return ''
		target.querySelectorAll('script').forEach(script => {
			const newScript = document.createElement('script')
			newScript.appendChild(document.createTextNode(script.textContent ?? ''))
			target.appendChild(newScript)
			script.remove()
		})
		return ' with scripts'
    }
})

/**
 * Insert template content next to or inside an element
 * 
 * @since 0.11.0
 * @param {HTMLTemplateElement} template - template element to clone or import from
 * @param {SignalLike<boolean>} s - insert if SignalLike evalutes to true, otherwise ignore
 * @param {InsertPosition} where - position to insert the template relative to the target element ('beforebegin', 'afterbegin', 'beforeend', 'afterend')
 */
const insertTemplate = <S extends ComponentSignals>(
	template: HTMLTemplateElement,
	s: SignalLike<boolean>,
	where: InsertPosition = 'beforeend'
) => insertNode(s, {
	type: 'template content',
	where,
	create: (host: UIElement<S>) => {
		if (!(template instanceof HTMLTemplateElement)) {
			log(`Invalid template to insert into ${elementName(host)}:`, LOG_ERROR)
			return
		}
		const clone = host.shadowRoot
			? document.importNode(template.content, true)
			: template.content.cloneNode(true)
		return clone
	}
})

/**
 * Create an element with a given tag name and optionally set its attributes
 * 
 * @since 0.11.0
 * @param {string} tag - tag name of the element to create
 * @param {SignalLike<boolean>} s - insert if SignalLike evalutes to true, otherwise ignore
 * @param {InsertPosition} [where] - position to insert the template relative to the target element ('beforebegin', 'afterbegin', 'beforeend', 'afterend')
 * @param {Record<string, string>} [attributes] - attributes to set on the element
 * @param {string} [text] - text content to set on the element
 */
const createElement = (
    tag: string,
    s: SignalLike<boolean>,
	where: InsertPosition = 'beforeend',
	attributes: Record<string, string> = {},
	text?: string,
) => insertNode(s, {
	type: 'new element',
	where,
	create: () => {
        const child = document.createElement(tag)
        for (const [key, value] of Object.entries(attributes))
			safeSetAttribute(child, key, value)
		if (text)
			child.textContent = text
        return child
    }
})

/**
 * Remove an element from the DOM
 * 
 * @since 0.9.0
 * @param {SignalLike<string>} s - state bound to the element removal
 */
const removeElement = <E extends Element, S extends ComponentSignals>(
	s: SignalLike<boolean>
) => (host: UIElement<S>, target: E, index: number): void => {
	const err = (error: unknown) =>
		log(error, `Failed to delete ${elementName(target)} from ${elementName(host)}:`, LOG_ERROR)
	effect(() => {
		let really = false
		try {
			really = resolveSignalLike(s, host, target, index)
		} catch (error) {
			err(error)
			return
		}
		if (!really) return
        enqueue(() => {
			target.remove()
			return true
		}, [target, 'r']).then(() => {
			log(target, `Deleted ${elementName(target)} into ${elementName(host)}`)
		}).catch((error) => {
			err(error)
		})
	})
}

/* === Exported Types === */

export {
	type ValueProvider, type SignalLike, type ElementUpdater, type NodeInserter,
	updateElement, insertNode,
	setText, setProperty, setAttribute, toggleAttribute, toggleClass, setStyle,
	insertTemplate, createElement, removeElement, dangerouslySetInnerHTML
}
