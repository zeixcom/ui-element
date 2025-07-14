import {
	type Extractor,
	type Fallback,
	type Parser,
	type ParserOrFallback,
	type TypeFromParser,
	extractValue,
	isParser,
	parseValue,
} from '../core/dom'

const getText =
	<
		T extends {},
		E extends Element = Element,
		P extends Parser<T, E> | undefined = undefined,
	>(
		parserOrFallback: ParserOrFallback<T, E>,
	): Extractor<TypeFromParser<P>, E> =>
	(element: E): TypeFromParser<P> => {
		const value = element.textContent
		if (parser) return parseValue(value, element, parser) as TypeFromParser<P>
		if (value != null || fallback) return value ?? extractValue(fallback, element)
		return parser
			? ( )
			: value ?? extractValue(fallback, element)
	}

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
		parserOrFallback: ParserOrFallback<T, E>,
	): Extractor<T, E> =>
	(element: E): T =>
		parseValue(element.getAttribute(attr) ?? !isParser(parserOrFallback) ? parserOrFallback : '', element, isParser(parserOrFallback)
			? parserOrFallback
			: undefined

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
		parser: Parser<T, E>,
	): Extractor<T, E> =>
	(element: E): T =>
		parseValue(
			window.getComputedStyle(element).getPropertyValue(prop),
			element,
			parser,
		)

export { getText, getProperty, hasAttribute, getAttribute, hasClass, getStyle }
