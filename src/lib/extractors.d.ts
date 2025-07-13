import {
	type Extractor,
	type OptionalStringParser,
	type ValueOrExtractor,
} from '../core/dom'
declare const getText: <T extends {}, E extends Element = Element>(
	parser: OptionalStringParser<T, E>,
) => Extractor<T, E>
declare const getProperty: <E extends Element, K extends keyof E>(
	prop: K,
	fallback: ValueOrExtractor<NonNullable<E[K]>, E>,
	parser: OptionalStringParser<NonNullable<E[K]>, E>,
) => Extractor<NonNullable<E[K]>, E>
declare const hasAttribute: (attr: string) => Extractor<boolean, Element>
declare const getAttribute: <T extends {}, E extends Element = Element>(
	attr: string,
	parser: OptionalStringParser<T, E>,
) => Extractor<T, E>
declare const hasClass: (token: string) => Extractor<boolean, Element>
declare const getStyle: <
	T extends {},
	E extends HTMLElement | SVGElement | MathMLElement = HTMLElement,
>(
	prop: string,
	parser: OptionalStringParser<T, E>,
) => Extractor<T, E>
export { getText, getProperty, hasAttribute, getAttribute, hasClass, getStyle }
