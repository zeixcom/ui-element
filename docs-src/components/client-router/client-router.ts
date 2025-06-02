import {
	type Component,
	component,
	on,
	toggleClass,
	dangerouslySetInnerHTML,
	computed,
} from '../../../'

export type ClientRouterProps = {
	title: string
	pathname: string
	error: string
}

export default component(
	'client-router',
	{
		title: document.title,
		pathname: window.location.pathname,
		error: '',
	},
	(el, { all, first }) => {
		const outlet = el.getAttribute('outlet') ?? 'main'

		const content = computed(async abort => {
			const url = String(new URL(el.pathname, window.location.origin))
			if (abort?.aborted || !url) return ''

			try {
				const response = await fetch(url)
				if (!response.ok)
					throw new Error(`HTTP error! status: ${response.status}`)

				const html = await response.text()
				const doc = new DOMParser().parseFromString(html, 'text/html')

				// Update title
				const newTitle = doc.querySelector('title')?.textContent
				if (newTitle) document.title = newTitle

				// Update URL and return outlet content
				window.history.pushState({}, '', url)
				return doc.querySelector(outlet)?.innerHTML ?? ''
			} catch (error) {
				el.error = `Navigation failed: ${error.message}`
				return ''
			}
		})

		return [
			// Navigate and update 'active' class
			all(
				'a[href]',
				toggleClass(
					'active',
					() =>
						el.pathname ===
						new URL(el.getAttribute('href') ?? '').pathname,
				),
				on('click', (e: Event) => {
					const link = e.target as HTMLAnchorElement
					const url = new URL(link.href)
					if (url.origin === window.location.origin) {
						e.preventDefault()
						el.pathname = url.pathname
					}
				}),
			),

			// Render initial content
			first(outlet, dangerouslySetInnerHTML(content, undefined, true)),

			// Handle browser history navigation
			() => {
				const handlePopState = () => {
					el.pathname = window.location.pathname
				}
				window.addEventListener('popstate', handlePopState)
				return () => {
					window.removeEventListener('popstate', handlePopState)
				}
			},
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'client-router': Component<ClientRouterProps>
	}
}
