import { isFunction } from "../core/util"
import { UIElement, type ComponentStates, type InferSignalTypes } from "../ui-element"

/* === Types === */

export type ComponentSetup = (
	host: UIElement,
	signals: InferSignalTypes<ComponentStates>
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
 * @param {ComponentStates} states - states of the component
 * @param {ComponentSetup<S>} setup - setup function to be called in connectedCallback(), may return cleanup function to be called in disconnectedCallback()
 * @returns {typeof Component} - the custom element class
 */
export function component<S extends ComponentStates>(
	name: string,
	states: S,
	setup: ComponentSetup
  ): typeof UIElement {
	class Component extends UIElement {
		static get observedAttributes() {
			return Object.keys(states).map(camelToKebab)
		}

		constructor() {
			super()
			this.states = states
		}

		connectedCallback() {
			super.connectedCallback()
			const cleanup = setup(this, this.signals)
			if (isFunction(cleanup)) this.cleanup.push(cleanup)
		}
	}
	Component.define(name)
	return Component
}