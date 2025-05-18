import { type Computed } from "@zeix/cause-effect";
/**
 * Create a element selection signal from a query selector
 *
 * @since 0.12.2
 * @param {ParentNode} parent - parent node to query
 * @param {string} selectors - query selector
 * @returns {Computed<T>} - Element selection signal
 */
export declare const selection: <E extends Element>(parent: ParentNode, selectors: string) => Computed<E[]>;
