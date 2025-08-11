import { type Extractor, fromDOM, type LooseExtractor } from '../core/dom'

const getText =
	<E extends Element = Element>(): LooseExtractor<string, E> =>
	(element: E) =>
		element.textContent?.trim()

const getIdrefText =
	<E extends Element = Element>(attr: string): LooseExtractor<string, E> =>
	(element: E) => {
		const id = element.getAttribute(attr)
		return id ? document.getElementById(id)?.textContent?.trim() : undefined
	}

const getProperty =
	<E extends Element, K extends keyof E & string>(
		prop: K,
	): LooseExtractor<E[K], E> =>
	(element: E) =>
		element[prop]

const hasAttribute =
	(attr: string): Extractor<boolean, Element> =>
	(element: Element) =>
		element.hasAttribute(attr)

const getAttribute =
	<E extends Element = Element>(attr: string): LooseExtractor<string, E> =>
	(element: E) =>
		element.getAttribute(attr)

const hasClass =
	(token: string): Extractor<boolean, Element> =>
	(element: Element) =>
		element.classList.contains(token)

const getStyle =
	<E extends HTMLElement | SVGElement | MathMLElement = HTMLElement>(
		prop: string,
	): Extractor<string, E> =>
	(element: E) =>
		window.getComputedStyle(element).getPropertyValue(prop)

const getLabel = <E extends HTMLElement>(
	selector: string,
): Extractor<string, E> =>
	fromDOM({ '.label': getText(), [selector]: getAttribute('aria-label') }, '')

const getDescription = <E extends HTMLElement>(
	selector: string,
): Extractor<string, E> =>
	fromDOM(
		{
			'.description': getText(),
			[selector]: getIdrefText('aria-describedby'),
		},
		'',
	)

export {
	getText,
	getProperty,
	hasAttribute,
	getAttribute,
	hasClass,
	getStyle,
	getLabel,
	getDescription,
}
