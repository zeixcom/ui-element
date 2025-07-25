import {
	type Component,
	UNSET,
	component,
	computed,
	dangerouslySetInnerHTML,
	setText,
	show,
	state,
	toggleClass,
} from '../../..'
import { requireDescendant } from '../../../src/core/dom'
import { asURL } from '../../functions/attribute-parser/as-url'
import { fetchWithCache } from '../../functions/shared/fetch-with-cache'

export type ModuleLazyProps = {
	src: string
}

export default component(
	'module-lazy',
	{
		src: asURL,
	},
	(el, { first }) => {
		requireDescendant(el, 'card-callout')
		requireDescendant(el, '.error')

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
				'card-callout',
				show(() => !!error.get() || content.get() === UNSET),
				toggleClass('danger', () => !error.get()),
			),
			first('.error', setText(error)),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'module-lazy': Component<ModuleLazyProps>
	}
}
