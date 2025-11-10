import { type Computed, type MaybeCleanup } from '@zeix/cause-effect';
import type { Component, ComponentProps } from '../component';
import { type Effects } from './reactive';
type ExtractTag<S extends string> = S extends `${infer T}.${string}` ? T : S extends `${infer T}#${string}` ? T : S extends `${infer T}:${string}` ? T : S extends `${infer T}[${string}` ? T : S;
type KnownTag<S extends string> = Lowercase<ExtractTag<S>> extends keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap | keyof MathMLElementTagNameMap ? Lowercase<ExtractTag<S>> : never;
type ElementFromSelector<S extends string> = KnownTag<S> extends never ? HTMLElement : KnownTag<S> extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[KnownTag<S>] : KnownTag<S> extends keyof SVGElementTagNameMap ? SVGElementTagNameMap[KnownTag<S>] : KnownTag<S> extends keyof MathMLElementTagNameMap ? MathMLElementTagNameMap[KnownTag<S>] : HTMLElement;
type Extractor<T extends {}, E extends Element = HTMLElement> = (element: E) => T;
type LooseExtractor<T, E extends Element = HTMLElement> = (element: E) => T | null | undefined;
type Parser<T extends {}, E extends Element = HTMLElement> = (element: E, value: string | null | undefined, old?: string | null) => T;
type Fallback<T extends {}, E extends Element = HTMLElement> = T | Extractor<T, E>;
type ParserOrFallback<T extends {}, E extends Element = HTMLElement> = Parser<T, E> | Fallback<T, E>;
type ElementUsage = {
    <S extends string>(selector: S, required: string): ElementFromSelector<S>;
    <S extends string>(selector: S): ElementFromSelector<S> | null;
    <E extends Element>(selector: string, required: string): E;
    <E extends Element>(selector: string): E | null;
};
type ElementsUsage = {
    <S extends string>(selector: S, required?: string): ElementFromSelector<S>[];
    <E extends Element>(selector: string, required?: string): E[];
};
type ElementEffects<P extends ComponentProps> = {
    <S extends string>(selector: S, effects: Effects<P, ElementFromSelector<S>>, required?: string): () => MaybeCleanup;
    <E extends Element>(selector: string, effects: Effects<P, E>, required?: string): () => MaybeCleanup;
};
type Helpers<P extends ComponentProps> = {
    useElement: ElementUsage;
    useElements: ElementsUsage;
    first: ElementEffects<P>;
    all: ElementEffects<P>;
};
/**
 * Check if a value is a string parser
 *
 * @since 0.14.0
 * @param {unknown} value - Value to check if it is a string parser
 * @returns {boolean} True if the value is a string parser, false otherwise
 */
declare const isParser: <T extends {}, E extends Element = HTMLElement>(value: unknown) => value is Parser<T, E>;
/**
 * Get a fallback value for an element
 *
 * @since 0.14.0
 * @param {E} element - Element to get fallback value for
 * @param {ParserOrFallback<T, E>} fallback - Fallback value or parser function
 * @returns {T} Fallback value or parsed value
 */
declare const getFallback: <T extends {}, E extends Element = HTMLElement>(element: E, fallback: ParserOrFallback<T, E>) => T;
/**
 * Get a value from elements in the DOM
 *
 * @since 0.14.0
 * @param {S} extractors - An object of extractor functions for selectors as keys to get a value from
 * @param {ParserOrFallback<T, E>} fallback - Fallback value or parser function
 * @returns {LooseExtractor<T | string | null | undefined, C>} Loose extractor function to apply to the host element
 */
declare const fromDOM: <T extends {}, C extends HTMLElement = HTMLElement, S extends { [K in keyof S & string]: LooseExtractor<T | string, ElementFromSelector<K>>; } = {}>(extractors: S, fallback: ParserOrFallback<T, C>) => Extractor<T, C>;
/**
 * Observe a DOM subtree with a mutation observer
 *
 * @since 0.12.2
 * @param {ParentNode} parent - parent node
 * @param {string} selector - selector for matching elements to observe
 * @param {MutationCallback} callback - mutation callback
 * @returns {MutationObserver} - the created mutation observer
 */
declare const observeSubtree: (parent: ParentNode, selector: string, callback: MutationCallback) => MutationObserver;
/**
 * Create partially applied helper functions to get descendants and run effects on them
 *
 * @since 0.14.0
 * @param {Component<P>} host - Host component
 * @returns {ElementSelectors<P>} - Helper functions for selecting descendants
 */
declare const getHelpers: <P extends ComponentProps>(host: Component<P>) => [Helpers<P>, () => string[]];
/**
 * Produce a computed signal of an array of elements matching a selector
 *
 * @since 0.13.1
 * @param {S} selector - CSS selector for descendant elements
 * @returns {Extractor<Computed<ElementFromSelector<S>[]>, C>} Signal producer for descendant element collection from a selector
 * @throws {CircularMutationError} If observed mutations would trigger infinite mutation cycles
 */
declare function fromSelector<S extends string, C extends HTMLElement = HTMLElement>(selector: S): Extractor<Computed<ElementFromSelector<S>[]>, C>;
declare function fromSelector<E extends Element, C extends HTMLElement = HTMLElement>(selector: string): Extractor<Computed<E[]>, C>;
export { type ElementFromSelector, type Extractor, type Fallback, type LooseExtractor, type Parser, type ParserOrFallback, type ElementUsage, type ElementsUsage, type ElementEffects, type ExtractTag, type Helpers, type KnownTag, fromDOM, fromSelector, getFallback, getHelpers, isParser, observeSubtree, };
