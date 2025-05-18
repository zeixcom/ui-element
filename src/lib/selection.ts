import { type Computed, computed, effect } from "@zeix/cause-effect";
import {
	type Watcher,
	notify,
	subscribe,
} from "@zeix/cause-effect/lib/scheduler";
import type { EffectMatcher, TapMatcher } from "@zeix/cause-effect/lib/effect";
import { isFunction } from "../core/util";

/* === Helper Functions === */

/**
 * Extract attribute names from a CSS selector
 * Handles various attribute selector formats: [attr], [attr=value], [attr^=value], etc.
 *
 * @param {string} selector - CSS selector to parse
 * @returns {string[]} - Array of attribute names found in the selector
 */
const extractAttributesFromSelector = (selector: string): string[] => {
	const attributeRegex =
		/\[\s*([a-zA-Z0-9_-]+)(?:[~|^$*]?=(?:"[^"]*"|'[^']*'|[^\]]*))?\s*\]/g;
	const attributes = new Set<string>();
	let match;
	while ((match = attributeRegex.exec(selector)) !== null) {
		if (match[1]) attributes.add(match[1]);
	}
	return Array.from(attributes);
};

/* === Exported Function === */

/**
 * Create a element selection signal from a query selector
 *
 * @since 0.12.2
 * @param {ParentNode} parent - parent node to query
 * @param {string} selectors - query selector
 * @returns {Computed<T>} - Element selection signal
 */
export const selection = <E extends Element>(
	parent: ParentNode,
	selectors: string,
): Computed<E[]> => {
	const watchers: Set<Watcher> = new Set();
	let value: E[] = Array.from(parent.querySelectorAll<E>(selectors));
	let observing = false;

	// Extract attributes to observe from the selector
	const observedAttributes = extractAttributesFromSelector(selectors);

	const observer = new MutationObserver(() => {
		value = Array.from(parent.querySelectorAll<E>(selectors));
		if (watchers.size) {
			notify(watchers);
		} else {
			observer.disconnect();
			observing = false;
		}
	});

	const s: Computed<E[]> = {
		[Symbol.toStringTag]: "Computed",

		get: (): E[] => {
			if (!observing) {
				observing = true;
				const observerConfig: MutationObserverInit = {
					childList: true,
					subtree: true,
				};

				// If there are attribute selectors, configure the observer to watch those attributes
				if (observedAttributes.length > 0) {
					observerConfig.attributes = true;
					observerConfig.attributeFilter = observedAttributes;
				}

				observer.observe(parent, observerConfig);
			}
			subscribe(watchers);
			return value;
		},

		map: <U extends {}>(fn: (v: E[]) => U | Promise<U>): Computed<U> =>
			computed(() => fn(s.get())),

		tap: (
			matcher: TapMatcher<E[]> | ((v: E[]) => void | (() => void)),
		): (() => void) =>
			effect({
				signals: [s],
				...(isFunction(matcher) ? { ok: matcher } : matcher),
			} as EffectMatcher<[Computed<E[]>]>),
	};
	return s;
};
