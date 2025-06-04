import {
	type Component,
	dangerouslySetInnerHTML,
	component,
	computed,
	state,
	setProperty,
	setText,
	toggleClass,
	UNSET,
} from '../../..'
import { asURL } from '../../functions/attribute-parser/as-url'
import { fetchWithCache } from '../../functions/shared/fetch-with-cache'

export type LazyLoadProps = {
	src: string
}

export default component(
	'lazy-load',
	{
		src: asURL,
	},
	(el, { first }) => {
		const error = state('')

		const content = computed(async abort => {
			const url = el.src.value
			if (el.src.error || !url) {
				error.set(el.src.error ?? 'No URL provided')
				return ''
			}

			try {
				error.set('')
				el.querySelector('.loading')?.remove()
				const { content } = await fetchWithCache(url, abort)
				return content
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : String(err)
				error.set(errorMessage)
				return ''
			}
		})

		return [
			dangerouslySetInnerHTML(content),
			first(
				'callout-box',
				setProperty(
					'hidden',
					() => !error.get() && content.get() !== UNSET,
				),
				toggleClass('danger', () => !error.get()),
			),
			first('.error', setText(error)),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'lazy-load': Component<LazyLoadProps>
	}
}
