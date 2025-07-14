import {
	type Extractor,
	type StringParser,
	type ValueOrExtractor,
	extractValue,
	parseValue,
} from '../core/dom'

const getText =
	<T extends {}, E extends Element = Element>(
		parser: StringParser<T, E>,
	): Extractor<T, E> =>
	(element: E): T =>
		parseValue<T, E>(element.textContent, element, parser)

const getProperty =
	<E extends Element, K extends keyof E>(
		prop: K,
		fallback: ValueOrExtractor<NonNullable<E[K]>, E>,
	): Extractor<NonNullable<E[K]>, E> =>
	(element: E): NonNullable<E[K]> =>
		element[prop] ?? extractValue(fallback, element)

const hasAttribute =
	(attr: string): Extractor<boolean, Element> =>
	(element: Element): boolean =>
		element.hasAttribute(attr)

const getAttribute =
	<T extends {} = string, E extends Element = Element>(
		attr: string,
		parser: StringParser<T, E>,
	): Extractor<T, E> =>
	(element: E): T =>
		parseValue(element.getAttribute(attr), element, parser)

const hasClass =
	(token: string): Extractor<boolean, Element> =>
	(element: Element): boolean =>
		element.classList.contains(token)

const getStyle =
	<
		T extends {},
		E extends HTMLElement | SVGElement | MathMLElement = HTMLElement,
	>(
		prop: string,
		parser: StringParser<T, E>,
	): Extractor<T, E> =>
	(element: E): T =>
		parseValue(
			window.getComputedStyle(element).getPropertyValue(prop),
			element,
			parser,
		)

export { getText, getProperty, hasAttribute, getAttribute, hasClass, getStyle }
