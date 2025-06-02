import {
	type Component,
	setProperty,
	setText,
	dangerouslySetInnerHTML,
	component,
} from '../../../'
import { asURL } from '../../functions/attribute-parser/as-url'
import { fetchText } from '../../functions/signal-producer/fetch-text'

export type LazyLoadProps = {
	error: string
	src: string
	content: string
}

export default component(
	'lazy-load',
	{
		error: '',
		src: asURL,
		content: fetchText,
	},
	(el, { first }) => [
		dangerouslySetInnerHTML('content'),
		first(
			'.error',
			setText('error'),
			setProperty('hidden', () => !el.error),
		),
	],
)

declare global {
	interface HTMLElementTagNameMap {
		'lazy-load': Component<LazyLoadProps>
	}
}
