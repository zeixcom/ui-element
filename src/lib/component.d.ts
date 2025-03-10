import { UIElement, type ComponentSignals, type SignalInitializer } from "../ui-element";
export type ComponentSetup<S extends ComponentSignals> = (host: UIElement<S>, signals: S) => void | (() => void);
/**
 * Define a component with its states and setup function (connectedCallback)
 *
 * @since 0.10.1
 * @param {string} name - name of the custom element
 * @param {{ [K in keyof S]: SignalInitializer<S[K], S> }} init - states of the component
 * @param {ComponentSetup<S>} setup - setup function to be called in connectedCallback(), may return cleanup function to be called in disconnectedCallback()
 * @returns {typeof Component} - the custom element class
 */
export declare const component: <S extends ComponentSignals>(name: string, init: { [K in keyof S]: SignalInitializer<S[K], S>; }, setup: ComponentSetup<S>) => typeof UIElement;
