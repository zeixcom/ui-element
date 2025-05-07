import { type Signal, effect, enqueue, isSignal, UNSET } from '@zeix/cause-effect'

import { isFunction, isString } from '../core/util'
import { type ComponentProps, type Component, RESET, type Cleanup } from '../component'
import { DEV_MODE, elementName, log, LOG_ERROR, valueString } from '../core/log'

/* === Types === */

type SignalLike<P extends ComponentProps, E extends Element, T> = keyof P
	| Signal<NonNullable<T>>
	| ((element: E) => T | null | undefined)

type UpdateOperation = 'a' | 'c' | 'h' | 'p' | 's' | 't'

type ElementUpdater<E extends Element, T> = {
	op: UpdateOperation,
    read: (element: E) => T | null,
    update: (element: E, value: T) => string,
    delete?: (element: E) => string,
	resolve?: (element: E) => void,
	reject?: (error: unknown) => void
}

type ElementInserterOrRemover<E extends Element> = {
	position?: InsertPosition,
	create: (parent: E) => Element | null,
	resolve?: (parent: E) => void,
	reject?: (error: unknown) => void
}

/* === Internal === */

const resolveSignalLike = /*#__PURE__*/ <P extends ComponentProps, E extends Element, T extends {}>(
	s: SignalLike<P, E, T>,
	host: Component<P>,
	target: E
): T => isString(s) ? host.getSignal(s).get() as unknown as T
	: isSignal(s) ? s.get()
	: isFunction<T>(s) ? s(target)
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
const updateElement = <P extends ComponentProps, E extends Element, T extends {}>(
	s: SignalLike<P, E, T>,
	updater: ElementUpdater<E, T>
) => (host: Component<P>, target: E): Cleanup => {
	const { op, read, update } = updater
	const fallback = read(target)
	const ops: Record<string, string> = {
		a: 'attribute ',
		c: 'class ',
		h: 'inner HTML',
		p: 'property ',
		s: 'style property ',
		t: 'text content',
	}
	let name: string = ''

	// If not yet set, set signal value to value read from DOM
	if (isString(s) && isString(fallback) && host[s] === RESET)
		host.attributeChangedCallback(s, null, fallback)

	const ok = (verb: string) => () => {
		if (DEV_MODE && host.debug)
			log(target, `${verb} ${ops[op] + name} of ${elementName(target)} in ${elementName(host)}`)
		updater.resolve?.(target)
	}
	const err = (verb: string) => (error: unknown) => {
		log(error, `Failed to ${verb} ${ops[op] + name} of ${elementName(target)} in ${elementName(host)}`, LOG_ERROR)
		updater.reject?.(error)
	}

    // Update the element's DOM state according to the signal value
	return effect(() => {
		let value = RESET
		try {
			value = resolveSignalLike(s, host, target)
		} catch (error) {
			log(error, `Failed to resolve value of ${valueString(s)} for ${ops[op] + name} of ${elementName(target)} in ${elementName(host)}`, LOG_ERROR)
			return
		}
		if (value === RESET) value = fallback
		else if (value === UNSET) value = updater.delete ? null : fallback

		// Nil path => delete the attribute or style property of the element
		if (updater.delete && value === null) {
			enqueue(() => {
                name = updater.delete!(target)
                return true
            }, [target, op])
				.then(ok('Deleted'))
				.catch(err('delete'))

		// Ok path => update the element
		} else if (value != null) {
			const current = read(target)
			if (Object.is(value, current)) return
			enqueue(() => {
				name = update(target, value)
				return true
			}, [target, op])
				.then(ok('Updated'))
				.catch(err('update'))
		}
	})
}

/**
 * Effect for inserting or removing elements according to a given SignalLike
 * 
 * @since 0.12.1
 * @param {SignalLike<P, E, number>} s - state bound to the number of elements to insert (positive) or remove (negative)
 * @param {ElementInserterOrRemover} inserter - inserter object containing position, insert, and remove methods
 */
const insertOrRemoveElement = <P extends ComponentProps, E extends Element>(
	s: SignalLike<P, E, number>,
	inserter: ElementInserterOrRemover<E>
) => (host: Component<P>, target: E) => {
	const { position = 'beforeend', create } = inserter

	const ok = (verb: string) => () => {
		if (DEV_MODE && host.debug)
			log(target, `${verb} element in ${elementName(target)} in ${elementName(host)}`)
		inserter.resolve?.(target)
	}
	const err = (verb: string) => (error: unknown) => {
		log(error, `Failed to ${verb} element in ${elementName(target)} in ${elementName(host)}`, LOG_ERROR)
		inserter.reject?.(error)
	}

	return effect(() => {
		let diff = 0
		try {
			diff = resolveSignalLike(s, host, target)
		} catch (error) {
			log(error, `Failed to resolve value of ${valueString(s)} for insertion or deletion in ${elementName(target)} in ${elementName(host)}`, LOG_ERROR)
			return
		}
		if (diff === RESET) diff = 0

		// Positive diff => insert element
		if (diff > 0) {
			enqueue(() => {
				for (let i = 0; i < diff; i++) {
					const element = create(target)
					if (!element) continue
					target.insertAdjacentElement(position, element)
				}
				return true
			}, [target, 'i'])
				.then(ok('Inserted'))
				.catch(err('insert'))

		// Negative diff => remove element
		} else if (diff < 0) {
			const prop: Record<InsertPosition, keyof Element> = {
				beforebegin: 'previousElementSibling',
				afterbegin: 'firstElementChild',
				beforeend: 'lastElementChild',
				afterend: 'nextElementSibling',
			}
			enqueue(() => {
				for (let i = 0; i > diff; i--) {
					(target[prop[position]] as Element | null)?.remove()
				}
				return true
			}, [target, 'r'])
				.then(ok('Removed'))
				.catch(err('remove'))
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
 * /
const insertNode = <P extends ComponentProps, E extends Element>(
	s: SignalLike<P, E, boolean>,
    { type, where, create }: NodeInserter
) => (host: Component<P>, target: E): void | (() => void) => {
	const methods: Record<InsertPosition, keyof Element> = {
		beforebegin: 'before',
		afterbegin: 'prepend',
        beforeend: 'append',
        afterend: 'after'
	}
	if (!isFunction(target[methods[where]]))
		throw new TypeError(`Invalid InsertPosition "${where}" for ${elementName(host)}`)
	const err = (error: unknown) =>
		log(error, `Failed to insert ${type} into ${elementName(host)}:`, LOG_ERROR)

	return effect(() => {
		let really = false
		try {
			really = resolveSignalLike(s, host, target)
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
} */

/**
 * Set text content of an element
 * 
 * @since 0.8.0
 * @param {SignalLike<string>} s - state bound to the text content
 */
const setText = <P extends ComponentProps, E extends Element>(
	s: SignalLike<P, E, string>
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
const setProperty = <P extends ComponentProps, E extends Element, K extends keyof E>(
	key: K,
	s: SignalLike<P, E, E[K]> = key as SignalLike<P, E, E[K]>
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
const setAttribute = <P extends ComponentProps, E extends Element>(
	name: string,
	s: SignalLike<P, E, string> = name
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
const toggleAttribute = <P extends ComponentProps, E extends Element>(
	name: string,
	s: SignalLike<P, E, boolean> = name
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
const toggleClass = <P extends ComponentProps, E extends Element>(
	token: string,
	s: SignalLike<P, E, boolean> = token
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
const setStyle = <P extends ComponentProps, E extends (HTMLElement | SVGElement | MathMLElement)>(
	prop: string,
	s: SignalLike<P, E, string> = prop
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
const dangerouslySetInnerHTML = <P extends ComponentProps, E extends Element>(
    s: SignalLike<P, E, string>,
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
 * /
const insertTemplate = <P extends ComponentProps>(
	template: HTMLTemplateElement,
	s: SignalLike<P, Element, boolean>,
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
 * /
const createElement = <P extends ComponentProps>(
    tag: string,
    s: SignalLike<P, Element, boolean>,
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
 * /
const removeElement = <P extends ComponentProps, E extends Element>(
	s: SignalLike<P, E, boolean>
) => (host: Component<P>, target: E): () => void => {
	const err = (error: unknown) =>
		log(error, `Failed to delete ${elementName(target)} from ${elementName(host)}:`, LOG_ERROR)

	return effect(() => {
		let really = false
		try {
			really = resolveSignalLike(s, host, target)
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
} */

/* === Exported Types === */

export {
	type SignalLike, type UpdateOperation, type ElementUpdater, type ElementInserterOrRemover,
	updateElement, insertOrRemoveElement,
	setText, setProperty, setAttribute, toggleAttribute, toggleClass, setStyle,
	dangerouslySetInnerHTML
}
