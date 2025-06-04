import {
	type Signal,
	type Cleanup,
	isFunction,
	effect,
	enqueue,
	isSignal,
	isState,
	UNSET,
} from '@zeix/cause-effect'

import {
	type ComponentProps,
	type Component,
	type FxFunction,
	RESET,
} from '../component'
import {
	DEV_MODE,
	isString,
	elementName,
	log,
	LOG_ERROR,
	valueString,
} from '../core/util'

/* === Types === */

type SignalLike<P extends ComponentProps, T, E extends Element = HTMLElement> =
	| keyof P
	| Signal<NonNullable<T>>
	| ((element: E) => T | null | undefined)

type UpdateOperation = 'a' | 'c' | 'h' | 'p' | 's' | 't'

type ElementUpdater<E extends Element, T> = {
	op: UpdateOperation
	name?: string
	read: (element: E) => T | null
	update: (element: E, value: T) => void
	delete?: (element: E) => void
	resolve?: (element: E) => void
	reject?: (error: unknown) => void
}

type ElementInserter<E extends Element> = {
	position?: InsertPosition
	create: (parent: E) => Element | null
	resolve?: (parent: E) => void
	reject?: (error: unknown) => void
}

type DangerouslySetInnerHTMLOptions = {
	shadowRootMode?: ShadowRootMode
	allowScripts?: boolean
}

/* === Internal === */

const resolveSignalLike = /*#__PURE__*/ <
	P extends ComponentProps,
	T extends {},
	E extends Element = Component<P>,
>(
	s: SignalLike<P, T, E>,
	host: Component<P>,
	target: E,
): T =>
	isString(s)
		? (host.getSignal(s).get() as unknown as T)
		: isSignal(s)
			? s.get()
			: isFunction<T>(s)
				? s(target)
				: RESET

const isSafeURL = /*#__PURE__*/ (value: string): boolean => {
	if (/^(mailto|tel):/i.test(value)) return true
	if (value.includes('://')) {
		try {
			const url = new URL(value, window.location.origin)
			return ['http:', 'https:', 'ftp:'].includes(url.protocol)
		} catch (_error) {
			return false
		}
	}
	return true
}

const safeSetAttribute = /*#__PURE__*/ (
	element: Element,
	attr: string,
	value: string,
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
const updateElement =
	<P extends ComponentProps, T extends {}, E extends Element = HTMLElement>(
		s: SignalLike<P, T, E>,
		updater: ElementUpdater<E, T>,
	): FxFunction<P, E> =>
	(host: Component<P>, target: E): Cleanup => {
		const { op, name = '', read, update } = updater
		const fallback = read(target)
		const ops: Record<string, string> = {
			a: 'attribute ',
			c: 'class ',
			h: 'inner HTML',
			p: 'property ',
			s: 'style property ',
			t: 'text content',
		}

		// If not yet set, set signal value to value read from DOM
		if (isString(s) && isString(fallback) && host[s] === RESET)
			host.attributeChangedCallback(s, null, fallback)

		const ok = (verb: string) => () => {
			if (DEV_MODE && host.debug)
				log(
					target,
					`${verb} ${ops[op] + name} of ${elementName(target)} in ${elementName(host)}`,
				)
			updater.resolve?.(target)
		}
		const err = (verb: string) => (error: unknown) => {
			log(
				error,
				`Failed to ${verb} ${ops[op] + name} of ${elementName(target)} in ${elementName(host)}`,
				LOG_ERROR,
			)
			updater.reject?.(error)
		}

		// Update the element's DOM state according to the signal value
		return effect(() => {
			const UPDATE_DEDUPE = Symbol(`${op}:${name}`)
			const DELETE_DEDUPE = Symbol(`${op}-${name}`)
			let value = RESET
			try {
				value = resolveSignalLike(s, host, target)
			} catch (error) {
				log(
					error,
					`Failed to resolve value of ${valueString(s)} for ${ops[op] + name} of ${elementName(target)} in ${elementName(host)}`,
					LOG_ERROR,
				)
				return
			}
			if (value === RESET) value = fallback
			else if (value === UNSET) value = updater.delete ? null : fallback

			// Nil path => delete the attribute or style property of the element
			if (updater.delete && value === null) {
				enqueue(() => {
					updater.delete!(target)
					return true
				}, DELETE_DEDUPE)
					.then(ok('Deleted'))
					.catch(err('delete'))

				// Ok path => update the element
			} else if (value != null) {
				const current = read(target)
				if (Object.is(value, current)) return
				enqueue(() => {
					update(target, value)
					return true
				}, UPDATE_DEDUPE)
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
 * @param {ElementInserter<E>} inserter - inserter object containing position, insert, and remove methods
 */
const insertOrRemoveElement =
	<P extends ComponentProps, E extends Element = HTMLElement>(
		s: SignalLike<P, number, E>,
		inserter?: ElementInserter<E>,
	): FxFunction<P, E> =>
	(host: Component<P>, target: E) => {
		const ok = (verb: string) => () => {
			if (DEV_MODE && host.debug)
				log(
					target,
					`${verb} element in ${elementName(target)} in ${elementName(host)}`,
				)
			if (isFunction(inserter?.resolve)) {
				inserter.resolve(target)
			} else {
				const signal = isSignal(s)
					? s
					: isString(s)
						? host.getSignal(s)
						: undefined
				if (isState<number>(signal)) signal.set(0)
			}
		}
		const err = (verb: string) => (error: unknown) => {
			log(
				error,
				`Failed to ${verb} element in ${elementName(target)} in ${elementName(host)}`,
				LOG_ERROR,
			)
			inserter?.reject?.(error)
		}

		return effect(() => {
			const INSERT_DEDUPE = Symbol('i')
			const REMOVE_DEDUPE = Symbol('d')
			let diff = 0
			try {
				diff = resolveSignalLike(s, host, target)
			} catch (error) {
				log(
					error,
					`Failed to resolve value of ${valueString(s)} for insertion or deletion in ${elementName(target)} in ${elementName(host)}`,
					LOG_ERROR,
				)
				return
			}
			if (diff === RESET) diff = 0

			if (diff > 0) {
				// Positive diff => insert element
				if (!inserter) throw new TypeError(`No inserter provided`)
				enqueue(() => {
					for (let i = 0; i < diff; i++) {
						const element = inserter.create(target)
						if (!element) continue
						target.insertAdjacentElement(
							inserter.position ?? 'beforeend',
							element,
						)
					}
					return true
				}, INSERT_DEDUPE)
					.then(ok('Inserted'))
					.catch(err('insert'))
			} else if (diff < 0) {
				// Negative diff => remove element
				enqueue(() => {
					if (
						inserter &&
						(inserter.position === 'afterbegin' ||
							inserter.position === 'beforeend')
					) {
						for (let i = 0; i > diff; i--) {
							if (inserter.position === 'afterbegin')
								target.firstElementChild?.remove()
							else target.lastElementChild?.remove()
						}
					} else {
						target.remove()
					}
					return true
				}, REMOVE_DEDUPE)
					.then(ok('Removed'))
					.catch(err('remove'))
			}
		})
	}

/**
 * Set text content of an element
 *
 * @since 0.8.0
 * @param {SignalLike<string>} s - state bound to the text content
 */
const setText = <P extends ComponentProps, E extends Element = HTMLElement>(
	s: SignalLike<P, string, E>,
): FxFunction<P, E> =>
	updateElement(s, {
		op: 't',
		read: el => el.textContent,
		update: (el, value) => {
			Array.from(el.childNodes)
				.filter(node => node.nodeType !== Node.COMMENT_NODE)
				.forEach(node => node.remove())
			el.append(document.createTextNode(value))
		},
	})

/**
 * Set property of an element
 *
 * @since 0.8.0
 * @param {string} key - name of property to be set
 * @param {SignalLike<E[K]>} s - state bound to the property value
 */
const setProperty = <
	P extends ComponentProps,
	K extends keyof E,
	E extends Element = HTMLElement,
>(
	key: K,
	s: SignalLike<P, E[K], E> = key as SignalLike<P, E[K], E>,
): FxFunction<P, E> =>
	updateElement(s, {
		op: 'p',
		name: String(key),
		read: el => (key in el ? el[key] : UNSET),
		update: (el, value) => {
			el[key] = value
		},
	})

/**
 * Set attribute of an element
 *
 * @since 0.8.0
 * @param {string} name - name of attribute to be set
 * @param {SignalLike<string>} s - state bound to the attribute value
 */
const setAttribute = <
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	name: string,
	s: SignalLike<P, string, E> = name,
): FxFunction<P, E> =>
	updateElement(s, {
		op: 'a',
		name,
		read: el => el.getAttribute(name),
		update: (el, value) => {
			safeSetAttribute(el, name, value)
		},
		delete: el => {
			el.removeAttribute(name)
		},
	})

/**
 * Toggle a boolan attribute of an element
 *
 * @since 0.8.0
 * @param {string} name - name of attribute to be toggled
 * @param {SignalLike<boolean>} s - state bound to the attribute existence
 */
const toggleAttribute = <
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	name: string,
	s: SignalLike<P, boolean, E> = name,
): FxFunction<P, E> =>
	updateElement(s, {
		op: 'a',
		name,
		read: el => el.hasAttribute(name),
		update: (el, value) => {
			el.toggleAttribute(name, value)
		},
	})

/**
 * Toggle a classList token of an element
 *
 * @since 0.8.0
 * @param {string} token - class token to be toggled
 * @param {SignalLike<boolean>} s - state bound to the class existence
 */
const toggleClass = <P extends ComponentProps, E extends Element = HTMLElement>(
	token: string,
	s: SignalLike<P, boolean, E> = token,
): FxFunction<P, E> =>
	updateElement(s, {
		op: 'c',
		name: token,
		read: el => el.classList.contains(token),
		update: (el, value) => {
			el.classList.toggle(token, value)
		},
	})

/**
 * Set a style property of an element
 *
 * @since 0.8.0
 * @param {string} prop - name of style property to be set
 * @param {SignalLike<string>} s - state bound to the style property value
 */
const setStyle = <
	P extends ComponentProps,
	E extends HTMLElement | SVGElement | MathMLElement,
>(
	prop: string,
	s: SignalLike<P, string, E> = prop,
): FxFunction<P, E> =>
	updateElement(s, {
		op: 's',
		name: prop,
		read: el => el.style.getPropertyValue(prop),
		update: (el, value) => {
			el.style.setProperty(prop, value)
		},
		delete: el => {
			el.style.removeProperty(prop)
		},
	})

/**
 * Set inner HTML of an element
 *
 * @since 0.11.0
 * @param {SignalLike<string>} s - state bound to the inner HTML
 * @param {DangerouslySetInnerHTMLOptions} options - options for setting inner HTML: shadowRootMode, allowScripts
 */
const dangerouslySetInnerHTML = <
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	s: SignalLike<P, string, E>,
	options: DangerouslySetInnerHTMLOptions = {},
): FxFunction<P, E> =>
	updateElement(s, {
		op: 'h',
		read: el =>
			(el.shadowRoot || !options.shadowRootMode ? el : null)?.innerHTML ??
			'',
		update: (el, html) => {
			const { shadowRootMode, allowScripts } = options
			if (!html) {
				if (el.shadowRoot) el.shadowRoot.innerHTML = '<slot></slot>'
				return ''
			}
			if (shadowRootMode && !el.shadowRoot)
				el.attachShadow({ mode: shadowRootMode })
			const target = el.shadowRoot || el
			target.innerHTML = html
			if (!allowScripts) return ''
			target.querySelectorAll('script').forEach(script => {
				const newScript = document.createElement('script')
				newScript.appendChild(
					document.createTextNode(script.textContent ?? ''),
				)
				target.appendChild(newScript)
				script.remove()
			})
			return ' with scripts'
		},
	})

/* === Exported Types === */

export {
	type SignalLike,
	type UpdateOperation,
	type ElementUpdater,
	type ElementInserter,
	type DangerouslySetInnerHTMLOptions,
	updateElement,
	insertOrRemoveElement,
	setText,
	setProperty,
	setAttribute,
	toggleAttribute,
	toggleClass,
	setStyle,
	dangerouslySetInnerHTML,
}
