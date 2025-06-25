import {
	type Component,
	type Computed,
	type Context,
	type State,
	UNSET,
	component,
	computed,
	dangerouslySetInnerHTML,
	on,
	provide,
	setProperty,
	setText,
	state,
	toggleClass,
} from '../../..'
import { fetchWithCache } from '../../functions/shared/fetch-with-cache'
import { isInternalLink } from '../../functions/shared/is-internal-link'

export type ContextRouterProps = {
	'router-pathname': string
	'router-query': Map<string, State<string>>
}

/* === Exported Contexts === */

export const ROUTER_PATHNAME = 'router-pathname' as Context<
	'router-pathname',
	State<string>
>

export const ROUTER_QUERY = 'router-query' as Context<
	'router-query',
	Computed<Map<string, State<string>>>
>

/* === Component === */

export default component(
	'context-router',
	{
		[ROUTER_PATHNAME]: window.location.pathname,
		[ROUTER_QUERY]: () => {
			const searchParams = new URLSearchParams(window.location.search)
			const queryMap = new Map()
			for (const [key, value] of searchParams.entries()) {
				queryMap.set(key, state(value))
			}
			const queryProxy = new Proxy(
				{},
				{
					has(_, prop: string) {
						return queryMap.has(prop)
					},
					get(_, prop: string) {
						if (!queryMap.has(prop))
							queryMap.set(prop, state(UNSET))
						return queryMap.get(prop).get()
					},
					set(_, prop: string, value: string) {
						if (!queryMap.has(prop))
							queryMap.set(prop, state(value))
						else queryMap.get(prop).set(value)
						const params = new URLSearchParams()
						for (const [key, signal] of queryMap) {
							const value = signal.get()
							if (value != null && value !== '')
								params.set(key, value)
						}
						const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`
						window.history.replaceState(null, '', newUrl)
						return true
					},
					ownKeys() {
						return [...queryMap.keys()]
					},
				},
			)
			return () => queryProxy
		},
	},
	(el, { all, first }) => {
		const outlet = el.getAttribute('outlet') ?? 'main'
		const error = state('')
		const hasError = () => !error.get()

		// Convert all relative links to absolute URLs during setup
		for (const link of el.querySelectorAll('a[href]')) {
			const href = link.getAttribute('href')
			if (
				href &&
				!href.startsWith('#') &&
				!href.includes('://') &&
				!href.startsWith('/')
			) {
				try {
					const absoluteUrl = new URL(href, window.location.href)
					link.setAttribute('href', absoluteUrl.pathname)
				} catch {
					// Skip invalid URLs
				}
			}
		}

		const content = computed(async abort => {
			const currentPath = String(el[ROUTER_PATHNAME])
			const url = String(new URL(currentPath, window.location.origin))
			if (abort?.aborted) return content.get()

			try {
				error.set('')
				const { content: html } = await fetchWithCache(url, abort)
				const doc = new DOMParser().parseFromString(html, 'text/html')

				// Update title and URL
				const newTitle = doc.querySelector('title')?.textContent
				if (newTitle) document.title = newTitle
				if (currentPath !== window.location.pathname)
					window.history.pushState({}, '', url)

				return doc.querySelector(outlet)?.innerHTML ?? ''
			} catch (err) {
				const errorMessage = `Navigation failed: ${err instanceof Error ? err.message : String(err)}`
				error.set(errorMessage)
				return content.get() // Keep current content on error
			}
		})

		return [
			// Provide contexts
			provide([ROUTER_PATHNAME, ROUTER_QUERY]),

			// Navigate and update 'active' class
			all(
				'a[href]:not([href^="#"])',
				toggleClass(
					'active',
					target =>
						isInternalLink(target) &&
						el[ROUTER_PATHNAME] === target.pathname,
				),
				on('click', (e: Event) => {
					if (!isInternalLink(e.target)) return
					const url = new URL(e.target.href)
					if (url.origin === window.location.origin) {
						e.preventDefault()
						el[ROUTER_PATHNAME] = url.pathname
					}
				}),
			),

			// Render content
			first(
				outlet,
				dangerouslySetInnerHTML(content, { allowScripts: true }),
			),

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
					el[ROUTER_PATHNAME] = window.location.pathname
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
		'context-router': Component<{}>
	}
}
