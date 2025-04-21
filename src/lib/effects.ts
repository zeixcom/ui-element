import { type Signal, effect, enqueue, isSignal, isState, UNSET } from '@zeix/cause-effect'

import { isFunction, isString } from '../core/util'
import { type ComponentProps, type Component, RESET } from '../component'
import { DEV_MODE, elementName, log, LOG_ERROR } from '../core/log'
import type { Provider } from '../core/ui'

/* === Types === */

type SignalLike<T, P extends ComponentProps> = keyof P
	| Signal<NonNullable<T>>
	| Provider<T>

type ElementUpdater<E extends Element, T> = {
	op: string,
    read: (element: E) => T | null,
    update: (element: E, value: T) => string,
    delete?: (element: E) => string
}

type NodeInserter = {
	type: string,
	where: InsertPosition,
	create: () => Node | undefined
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

const resolveSignalLike = <T extends {}, P extends ComponentProps, E extends Element>(
	s: SignalLike<T, P>,
	host: Component<P>,
	target: E,
	index: number
): T => isString(s) ? host.getSignal(s).get() as unknown as T
	: isSignal(s) ? s.get()
	: isFunction<T>(s) ? s(target, index)
	: RESET

const isSafeURL = /*#__PURE__*/ (value: string): boolean => {
	if (/^(mailto|tel):/i.test(value)) return true
	if (value.includes('://')) {
		try {
			const url = new URL(value, window.location.origin)
			return ['http:', 'https:', 'ftp:'].includes(url.protocol)
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (_) {
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
const updateElement = <E extends Element, T extends {}, P extends ComponentProps>(
	s: SignalLike<T, P>,
	updater: ElementUpdater<E, T>
) => (host: Component<P>, target: E, index: number = 0): () => void => {
	const { op, read, update } = updater
	const fallback = read(target)

	// If not yet set, set signal value to value read from DOM
	if (isString(s) && isString(fallback) && host[s] === RESET)
		host.attributeChangedCallback(s, null, fallback)

	const err = (error: unknown, verb: string, prop: string = 'element') =>
		log(error, `Failed to ${verb} ${prop} ${elementName(target)} in ${elementName(host)}`, LOG_ERROR)

    // Update the element's DOM state according to the signal value
	return effect(() => {
		let value = RESET
		try {
			value = resolveSignalLike(s, host, target, index)
		} catch (error) {
			err(error, 'update')
			return
		}
		if (value === RESET) value = fallback
		if (value === UNSET) value = updater.delete ? null : fallback

		// Nil path => delete the attribute or style property of the element
		if (updater.delete && value === null) {
			let name: string = ''
			enqueue(() => {
                name = updater.delete!(target)
                return true
            }, [target, op]).then(() => {
				if (DEV_MODE && host.debug)
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
				if (DEV_MODE && host.debug)
					log(target, `Updated ${ops[op] + name} of ${elementName(target)} in ${elementName(host)}`)
			}).catch((error) => {
				err(error, 'update', `${ops[op] + name} of`)
			})
		}
	})
}

/**
 * Effect to insert a node relative to an element according to a given SignalLike
 * 
 * @since 0.9.0
 * @param {SignalLike<string>} s - state bound to the node insertion
 * @param {NodeInserter} inserter - inserter object containing type, where, and create methods
 * @throws {TypeError} if the insertPosition is invalid for the target element
 */
const insertNode = <E extends Element, P extends ComponentProps>(
	s: SignalLike<boolean, P>,
    { type, where, create }: NodeInserter
) => (host: Component<P>, target: E, index: number = 0): void | (() => void) => {
	const methods: Record<InsertPosition, keyof Element> = {
		beforebegin: 'before',
		afterbegin: 'prepend',
        beforeend: 'append',
        afterend: 'after'
	}
	if (!isFunction(target[methods[where]]))
		throw new TypeError(`Invalid insertPosition "${where}" for ${elementName(host)}`)
	const err = (error: unknown) =>
		log(error, `Failed to insert ${type} into ${elementName(host)}:`, LOG_ERROR)

	return effect(() => {
		let really = false
		try {
			really = resolveSignalLike(s, host, target, index)
		} catch (error) {
			err(error)
			return
		}
		if (!really) return
        enqueue(() => {
			const node = create()
			if (!node) return
			(target[methods[where]] as (...nodes: Node[]) => void)(node)
		}, [target, 'i']).then(() => {
			const signal = isSignal(s) ? s : isString(s) ? host.getSignal(s) : undefined
			if (isState<boolean>(signal)) signal.set(false)
			if (DEV_MODE && host.debug)
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
const setText = <E extends Element, P extends ComponentProps>(
	s: SignalLike<string, P>
) => updateElement(s, {
	op: 't',
	read: (el: E): string | null => el.textContent,
	update: (el: E, value: string): string => {
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
const setProperty = <E extends Element, K extends keyof E, P extends ComponentProps>(
	key: K,
	s: SignalLike<NonNullable<E[K]>, P> = key as SignalLike<NonNullable<E[K]>, P>
) => updateElement(s, {
	op: 'p',
	read: (el: E) => key in el ? el[key] : UNSET,
	update: (el: E, value: E[K]): string => {
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
const setAttribute = <E extends Element, P extends ComponentProps>(
	name: string,
	s: SignalLike<string, P> = name
) => updateElement(s, {
	op: 'a',
	read: (el: E): string | null => el.getAttribute(name),
	update: (el: E, value: string): string => {
		safeSetAttribute(el, name, value)
		return name
	},
	delete: (el: E): string => {
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
const toggleAttribute = <E extends Element, P extends ComponentProps>(
	name: string,
	s: SignalLike<boolean, P> = name
) => updateElement(s, {
	op: 'a',
	read: (el: E): boolean => el.hasAttribute(name),
	update: (el: E, value: boolean): string => {
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
const toggleClass = <E extends Element, P extends ComponentProps>(
	token: string,
	s: SignalLike<boolean, P> = token
) => updateElement(s, {
	op: 'c',
	read: (el: E): boolean => el.classList.contains(token),
	update: (el: E, value: boolean): string => {
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
const setStyle = <E extends (HTMLElement | SVGElement | MathMLElement), P extends ComponentProps>(
	prop: string,
	s: SignalLike<string, P> = prop
) => updateElement(s, {
	op: 's',
	read: (el: E): string | null => el.style.getPropertyValue(prop),
	update: (el: E, value: string): string => {
		el.style.setProperty(prop, value)
		return prop
	},
	delete: (el: E): string => {
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
const dangerouslySetInnerHTML = <E extends Element, P extends ComponentProps>(
    s: SignalLike<string, P>,
	attachShadow?: 'open' | 'closed',
	allowScripts?: boolean,
) => updateElement(s, {
	op: 'h',
    read: (el: E): string => (el.shadowRoot || !attachShadow ? el : null)?.innerHTML ?? '',
    update: (el: E, html: string): string => {
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
 * @param {string} content - content to be inserted into the template's slot
 * @throws {TypeError} if the template is not an HTMLTemplateElement
 */
const insertTemplate = <P extends ComponentProps>(
	template: HTMLTemplateElement,
	s: SignalLike<boolean, P>,
	where: InsertPosition = 'beforeend',
	content?: string | (() => string)
) => {
	if (!(template instanceof HTMLTemplateElement))
		throw new TypeError('Expected template to be an HTMLTemplateElement')
	return insertNode(s, {
		type: 'template content',
		where,
		create: (): Node | undefined => {
			const clone = document.importNode(template.content, true)
			const slot = clone.querySelector('slot')
			const text = isFunction(content) ? content() : content
			if (slot) slot.replaceWith(document.createTextNode(text ? text : slot.textContent ?? ''))
			return clone
		}
	})
}

/**
 * Create an element with a given tag name and optionally set its attributes
 * 
 * @since 0.11.0
 * @param {string} tag - tag name of the element to create
 * @param {SignalLike<boolean>} s - insert if SignalLike evalutes to true, otherwise ignore
 * @param {InsertPosition} where - position to insert the template relative to the target element ('beforebegin', 'afterbegin', 'beforeend', 'afterend')
 * @param {Record<string, string>} attributes - attributes to set on the element
 * @param {string} content - text content to be inserted into the element
 */
const createElement = <P extends ComponentProps>(
    tag: string,
    s: SignalLike<boolean, P>,
	where: InsertPosition = 'beforeend',
	attributes: Record<string, string> = {},
	content?: string | (() => string)
) => insertNode(s, {
	type: 'new element',
	where,
	create: (): Node | undefined => {
        const child = document.createElement(tag)
        for (const [key, value] of Object.entries(attributes))
			safeSetAttribute(child, key, value)
		const text = isFunction(content) ? content() : content
		if (text) child.textContent = text
        return child
    }
})

/**
 * Remove an element from the DOM
 * 
 * @since 0.9.0
 * @param {SignalLike<string>} s - state bound to the element removal
 */
const removeElement = <E extends Element, P extends ComponentProps>(
	s: SignalLike<boolean, P>
) => (host: Component<P>, target: E, index: number = 0): () => void => {
	const err = (error: unknown) =>
		log(error, `Failed to delete ${elementName(target)} from ${elementName(host)}:`, LOG_ERROR)

	return effect(() => {
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
			const signal = isSignal(s) ? s : isString(s) ? host.getSignal(s) : undefined
			if (isState<boolean>(signal)) signal.set(false)
			if (DEV_MODE && host.debug)
				log(target, `Deleted ${elementName(target)} into ${elementName(host)}`)
		}).catch((error) => {
			err(error)
		})
	})
}

/* === Exported Types === */

export {
	type SignalLike, type ElementUpdater, type NodeInserter,
	updateElement, insertNode,
	setText, setProperty, setAttribute, toggleAttribute, toggleClass, setStyle,
	insertTemplate, createElement, removeElement, dangerouslySetInnerHTML
}
