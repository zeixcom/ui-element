import { isFunction } from "../core/util"
import { UIElement, type ComponentSignals, type SignalInitializer } from "../ui-element"

/* === Types === */

export type ComponentSetup<S extends ComponentSignals> = (
	host: UIElement<S>,
	signals: S
) => void | (() => void)

/* === Internal Functions === */

const camelToKebab = /*#__PURE__*/ (str: string): string =>
	str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

/* === Exported Functions === */

/**
 * Define a component with its states and setup function (connectedCallback)
 * 
 * @since 0.10.1
 * @param {string} name - name of the custom element
 * @param {{ [K in keyof S]: SignalInitializer<S[K], S> }} init - states of the component
 * @param {ComponentSetup<S>} setup - setup function to be called in connectedCallback(), may return cleanup function to be called in disconnectedCallback()
 * @returns {typeof Component} - the custom element class
 */
export const component = <S extends ComponentSignals>(
	name: string,
	init: { [K in keyof S]: SignalInitializer<S[K], S> },
	setup: ComponentSetup<S>
  ): typeof UIElement => {
	return (class extends UIElement {
		static readonly localName = name
		static get observedAttributes() {
			return Object.keys(init).map(camelToKebab)
		}

		init = init

		connectedCallback() {
			super.connectedCallback()
			const cleanup = setup(this as unknown as UIElement<S>, this.signals as S)
			if (isFunction(cleanup)) this.cleanup.push(cleanup)
		}
	}).define()
}