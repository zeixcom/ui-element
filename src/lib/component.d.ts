import { UIElement, type ComponentStates, type InferSignalTypes } from "../ui-element";
export type ComponentSetup = (host: UIElement, signals: InferSignalTypes<ComponentStates>) => void | (() => void);
/**
 * Define a component with its states and setup function (connectedCallback)
 *
 * @since 0.10.1
 * @param {string} name - name of the custom element
 * @param {ComponentStates} states - states of the component
 * @param {ComponentSetup<S>} setup - setup function to be called in connectedCallback(), may return cleanup function to be called in disconnectedCallback()
 * @returns {typeof Component} - the custom element class
 */
export declare function component<S extends ComponentStates>(name: string, states: S, setup: ComponentSetup): typeof UIElement;
