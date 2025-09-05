import {
	type Component,
	type Computed,
	type Context,
	component,
	computed,
	dangerouslySetInnerHTML,
	on,
	provideContexts,
	type State,
	setText,
	show,
	state,
	toggleClass,
	UNSET,
} from '../../..'
import { fetchWithCache } from '../../functions/shared/fetchWithCache'
import { isInternalLink } from '../../functions/shared/isInternalLink'

export type ContextRouterProps = {
	'router-pathname': string
	'router-query': Record<string, string>
}

/* === Exported Contexts === */

export const ROUTER_PATHNAME = 'router-pathname' as Context<
	'router-pathname',
	State<string>
>

export const ROUTER_QUERY = 'router-query' as Context<
	'router-query',
	Computed<Record<string, string>>
>

/* === Component === */

export default component(
	'context-router',
	{
		[ROUTER_PATHNAME]: window.location.pathname,
		[ROUTER_QUERY]: () => {
			const queryMap = new Map()
			for (const [key, value] of new URLSearchParams(
				window.location.search,
			)) {
				queryMap.set(key, state(value))
			}
			const getSetParam = (key: string, value?: string): string => {
				if (!queryMap.has(key)) queryMap.set(key, state(value ?? UNSET))
				else if (value != null) queryMap.get(key).set(value)
				return queryMap.get(key).get()
			}
			const syncToURL = () => {
				const params = new URLSearchParams()
				for (const [key, signal] of queryMap) {
					const value = signal.get()
					if (value && value !== UNSET) params.set(key, value)
				}
				window.history.replaceState(
					null,
					'',
					`${window.location.pathname}?${params.toString()}${window.location.hash}`,
				)
			}
			return () =>
				new Proxy(
					{},
					{
						has(_, prop: string) {
							return queryMap.has(prop)
						},
						get(_, prop: string) {
							return getSetParam(prop)
						},
						set(_, prop: string, value: string) {
							getSetParam(prop, value)
							syncToURL()
							return true
						},
						ownKeys() {
							return [...queryMap.keys()]
						},
					},
				)
		},
	},
	(el, { all, first }) => {
		const outlet = el.getAttribute('outlet') ?? 'main'
		const error = state('') // Convert all relative links to absolute URLs during setup
		for (const link of Array.from(el.querySelectorAll('a[href]'))) {
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

		const content = computed(
			async (abort: AbortSignal): Promise<string> => {
				const currentPath = String(el[ROUTER_PATHNAME])
				const url = String(new URL(currentPath, window.location.origin))
				if (abort?.aborted) return ''

				const { content: html } = await fetchWithCache(url, abort)
				const doc = new DOMParser().parseFromString(html, 'text/html')

				// Update title and URL
				const newTitle = doc.querySelector('title')?.textContent
				if (newTitle) document.title = newTitle
				if (currentPath !== window.location.pathname)
					window.history.pushState({}, '', url)

				return doc.querySelector(outlet)?.innerHTML ?? ''
			},
		)

		return [
			// Provide contexts
			provideContexts([ROUTER_PATHNAME, ROUTER_QUERY]),

			// Navigate and update 'active' class
			all('a[href]:not([href^="#"])', [
				toggleClass(
					'active',
					target =>
						isInternalLink(target) &&
						el[ROUTER_PATHNAME] === target.pathname,
				),
				on('click', ({ event, target }) => {
					if (!isInternalLink(target)) return
					const url = new URL(target.href)
					if (url.origin === window.location.origin) {
						event.preventDefault()
						el[ROUTER_PATHNAME] = url.pathname
					}
				}),
			]),

			// Render content
			first(outlet, [dangerouslySetInnerHTML(content)]),

			// Error display with aria-live
			first('card-callout', [show(() => !!error.get())]),
			first('.error', [setText(error)]),

			// Handle browser history navigation
			on('popstate', () => {
				el[ROUTER_PATHNAME] = window.location.pathname
			}),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'context-router': Component<ContextRouterProps>
	}
}
