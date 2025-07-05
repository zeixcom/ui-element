import { type Computed } from '@zeix/cause-effect'
import type { ElementFromSelector, SignalProducer } from '../component'
type HTMLElementEventType<K extends string> =
	K extends keyof HTMLElementEventMap ? HTMLElementEventMap[K] : Event
type ValidEventName = keyof HTMLElementEventMap | string
type EventType<K extends string> = K extends keyof HTMLElementEventMap
	? HTMLElementEventMap[K]
	: Event
interface TransformerContext<
	T extends {},
	E extends HTMLElement,
	K extends string,
> {
	event: EventType<K>
	host: HTMLElement
	source: E
	value: T
}
type EventTransformer<T extends {}, E extends HTMLElement, K extends string> = (
	context: TransformerContext<T, E, K>,
) => T
/**
 * Observe a DOM subtree with a mutation observer
 *
 * @since 0.12.2
 * @param {ParentNode} parent - parent node
 * @param {string} selectors - selector for matching elements to observe
 * @param {MutationCallback} callback - mutation callback
 * @returns {MutationObserver} - the created mutation observer
 */
declare const observeSubtree: (
	parent: ParentNode,
	selectors: string,
	callback: MutationCallback,
) => MutationObserver
/**
 * Produce a selection signal from a selector with automatic type inference
 *
 * @since 0.13.1
 * @param {K} selectors - CSS selector for descendant elements
 * @returns {(host: HTMLElement) => Computed<ElementFromSelector<K, E>[]} Signal producer for descendant element collection from a selector
 *
 * @example
 * // TypeScript automatically infers HTMLInputElement[] for 'input' selector
 * const inputs = fromSelector('input')(host).get()
 * inputs[0].value // TypeScript knows this is valid
 *
 * @example
 * // Works with custom UIElement components when declared in HTMLElementTagNameMap
 * // declare global { interface HTMLElementTagNameMap { 'my-button': Component<MyButtonProps> } }
 * const buttons = fromSelector('my-button')(host).get()
 * buttons[0].getSignal('disabled').get() // Access UIElement component methods
 */
declare const fromSelector: <
	E extends Element = HTMLElement,
	K extends string = string,
>(
	selectors: K,
) => SignalProducer<ElementFromSelector<K, E>[]>
/**
 * Produce a computed signal from reduced properties of descendant elements with type safety
 *
 * @since 0.13.1
 * @param {K} selectors - CSS selector for descendant elements
 * @param {(accumulator: T, currentElement: ElementFromSelector<K, E>, currentIndex: number, array: ElementFromSelector<K, E>[]) => T} reducer - function to reduce values
 * @param {T} init - initial value for reduction
 * @returns {(host: HTMLElement) => () => T} signal producer that emits reduced value
 *
 * @example
 * // TypeScript knows each 'input' is HTMLInputElement
 * fromDescendants('input', (total, input) => total + input.value.length, 0)
 *
 * @example
 * // Works with UIElement components when properly declared
 * // declare global { interface HTMLElementTagNameMap { 'form-spinbutton': Component<FormSpinbuttonProps> } }
 * fromDescendants('form-spinbutton', (sum, item) => {
 *   // TypeScript knows item is Component<FormSpinbuttonProps>
 *   return sum + item.value // Access reactive property
 * }, 0)
 */
declare const fromDescendants: <
	T extends {},
	E extends Element = HTMLElement,
	K extends string = string,
>(
	selectors: K,
	reducer: (
		accumulator: T,
		currentElement: ElementFromSelector<K, E>,
		currentIndex: number,
		array: ElementFromSelector<K, E>[],
	) => T,
	init: T | ((host: HTMLElement) => T),
) => SignalProducer<T>
/**
 * Produce a computed signal from transformed event data
 *
 * @since 0.13.2
 * @param {S} selector - CSS selector for the source element
 * @param {K} type - Event type to listen for
 * @param {EventTransformer<T, ElementFromSelector<S, E>, K>} transformer - Transformation function for the event
 * @param {T | ((host: C) => T)} init - Initial value or initializer function
 * @returns {(host: C) => Computed<T>} Signal producer for value from event
 *
 * @example
 * // Simple input value extraction
 * fromEvent('input', 'input', ({ source }) => source.value, '')
 *
 * @example
 * // Click counter using previous value
 * fromEvent('button', 'click', ({ value }) => value + 1, 0)
 *
 * @example
 * // Form submission with event handling
 * fromEvent('form', 'submit', ({ event, source }) => {
 *   event.preventDefault()
 *   return new FormData(source)
 * }, null)
 *
 * @example
 * // Complex logic using multiple context values
 * fromEvent('input', 'input', ({ event, source, value, host }) => {
 *   if (event.inputType === 'deleteContentBackward') {
 *     host.dispatchEvent(new CustomEvent('deletion'))
 *   }
 *   return source.value.length > value ? source.value : value
 * }, '')
 *
 * @example
 * // TypeScript automatically infers element types from selectors
 * fromEvent('input', 'input', ({ source }) => {
 *   return source.value.length // TypeScript knows source is HTMLInputElement
 * }, 0)
 *
 * @example
 * // Custom event handling with TypeScript declarations
 * // First, declare your custom events and components globally:
 * // declare global {
 * //   interface HTMLElementTagNameMap {
 * //     'my-component': Component<MyComponentProps>
 * //   }
 * //   interface HTMLElementEventMap {
 * //     itemAdded: CustomEvent<{ id: string; quantity: number }>
 * //   }
 * // }
 * fromEvent('my-component', 'itemAdded', ({ event, source }) => {
 *   // TypeScript knows source is Component<MyComponentProps> with UIElement methods
 *   const currentValue = source.getSignal('someProperty').get()
 *   return {
 *     id: source.dataset.id,
 *     quantity: event.detail.quantity, // TypeScript knows this is a number
 *     currentValue,
 *     timestamp: Date.now()
 *   }
 * }, null)
 */
declare const fromEvent: <
	T extends {},
	E extends HTMLElement = HTMLElement,
	K extends string = string,
	C extends HTMLElement = HTMLElement,
	S extends string = string,
>(
	selector: S,
	type: K,
	transformer: EventTransformer<T, ElementFromSelector<S, E>, K>,
	init: T | ((host: C) => T),
	options?: boolean | AddEventListenerOptions,
) => (host: C) => Computed<T> /**
 * Create a getter function for a reactive property from a descendant element with type safety
 *
 * @since 0.13.1
 * @param {S} selector - CSS selector for descendant element
 * @param {K} prop - Name of reactive property to get
 * @param {NonNullable<ElementFromSelector<S, E>[K]>} fallback - Fallback value to use until component is upgraded or if value is nullish
 * @returns {(host: HTMLElement) => () => NonNullable<ElementFromSelector<S, E>[K]>} Signal producer that gets the property value from descendant element
 * @example
 * // TypeScript knows 'value' exists on HTMLInputElement
 * fromDescendant('input', 'value', '')
 *
 * @example
 * // Access UIElement component properties with full type safety
 * // declare global { interface HTMLElementTagNameMap { 'my-counter': Component<{count: number}> } }
 * const counterValue = fromDescendant('my-counter', 'count', 0)
 *
 * @example
 * // Access UIElement component signals for advanced patterns
 * const getCounterSignal = fromDescendant('my-counter', 'getSignal', null)
 * if (getCounterSignal) {
 *   const signal = getCounterSignal('count')
 *   // Now you can work with the signal directly
 * }
 */
declare const fromDescendant: <
	E extends Element = HTMLElement,
	S extends string = string,
	K extends keyof ElementFromSelector<S, E> = keyof ElementFromSelector<S, E>,
>(
	selector: S,
	prop: K,
	fallback: NonNullable<ElementFromSelector<S, E>[K]>,
) => (host: HTMLElement) => () => NonNullable<ElementFromSelector<S, E>[K]>
export {
	type HTMLElementEventType,
	type ValidEventName,
	type EventType,
	type TransformerContext,
	type EventTransformer,
	fromDescendant,
	fromDescendants,
	fromEvent,
	fromSelector,
	observeSubtree,
}
