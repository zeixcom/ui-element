import {
	type Component,
	component,
	computed,
	dangerouslySetInnerHTML,
	on,
	setProperty,
	setText,
	state,
	toggleClass,
} from '../../..'
import { fetchWithCache } from '../../functions/shared/fetch-with-cache'

export default component('context-router', {}, (el, { all, first }) => {
	const outlet = el.getAttribute('outlet') ?? 'main'
	const pathname = state(window.location.pathname)
	const error = state('')
	const hasError = () => !error.get()

	const content = computed(async abort => {
		const currentPath = pathname.get()
		const url = String(new URL(currentPath, window.location.origin))

		if (abort?.aborted) {
			return content.get()
		}

		try {
			error.set('')
			const { content: html } = await fetchWithCache(url, abort)
			const doc = new DOMParser().parseFromString(html, 'text/html')

			// Update title
			const newTitle = doc.querySelector('title')?.textContent
			if (newTitle) document.title = newTitle

			// Update URL
			if (currentPath !== window.location.pathname) {
				window.history.pushState({}, '', url)
			}

			return doc.querySelector(outlet)?.innerHTML ?? ''
		} catch (err) {
			const errorMessage = `Navigation failed: ${err instanceof Error ? err.message : String(err)}`
			error.set(errorMessage)
			return content.get() // Keep current content on error
		}
	})

	return [
		// Navigate and update 'active' class
		all(
			'a[href]',
			toggleClass('active', target => {
				const href = target.getAttribute('href')
				if (!href) return false
				try {
					return (
						pathname.get() ===
						new URL(href, window.location.href).pathname
					)
				} catch {
					return false
				}
			}),
			on('click', (e: Event) => {
				if (!(e.target instanceof HTMLAnchorElement)) return
				const url = new URL(e.target.href)
				if (url.origin === window.location.origin) {
					e.preventDefault()
					pathname.set(url.pathname)
				}
			}),
		),

		// Render content
		first(outlet, dangerouslySetInnerHTML(content, { allowScripts: true })),

		// Error display with aria-live
		first(
			'card-callout',
			setProperty('hidden', hasError),
			toggleClass('danger', hasError),
		),
		first('.error', setText(error)),

		// Handle browser history navigation
		() => {
			const handlePopState = () => {
				pathname.set(window.location.pathname)
			}
			window.addEventListener('popstate', handlePopState)
			return () => {
				window.removeEventListener('popstate', handlePopState)
			}
		},
	]
})

declare global {
	interface HTMLElementTagNameMap {
		'context-router': Component<{}>
	}
}
