import {
	type Component,
	component,
	computed,
	dangerouslySetInnerHTML,
	setText,
	show,
	state,
	toggleClass,
	UNSET,
} from '../../..'
import { asURL } from '../../functions/parser/as-url'
import { fetchWithCache } from '../../functions/shared/fetch-with-cache'

export type ModuleLazyProps = {
	src: { value: string; error: string }
}

export default component('module-lazy', { src: asURL }, (el, { first }) => {
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
			error.set(err instanceof Error ? err.message : String(err))
			return ''
		}
	})

	return [
		dangerouslySetInnerHTML(content),
		first(
			'card-callout',
			[
				show(() => !!error.get() || content.get() === UNSET),
				toggleClass('danger', () => !error.get()),
			],
			'Needed to display loading state and error messages.',
		),
		first('.error', setText(error), 'Needed to display error messages.'),
	]
})

declare global {
	interface HTMLElementTagNameMap {
		'module-lazy': Component<ModuleLazyProps>
	}
}
