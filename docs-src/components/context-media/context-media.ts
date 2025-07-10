import {
	type Component,
	type Context,
	type State,
	component,
	provideContexts,
	state,
} from '../../../'

export type ContextMediaProps = {
	'media-motion': boolean
	'media-theme': 'light' | 'dark'
	'media-viewport': 'xs' | 'sm' | 'md' | 'lg' | 'xl'
	'media-orientation': 'portrait' | 'landscape'
}

/* === Exported Contexts === */

export const MEDIA_MOTION = 'media-motion' as Context<
	'media-motion',
	State<boolean>
>
export const MEDIA_THEME = 'media-theme' as Context<
	'media-theme',
	State<'light' | 'dark'>
>
export const MEDIA_VIEWPORT = 'media-viewport' as Context<
	'media-viewport',
	State<'xs' | 'sm' | 'md' | 'lg' | 'xl'>
>
export const MEDIA_ORIENTATION = 'media-orientation' as Context<
	'media-orientation',
	State<'portrait' | 'landscape'>
>

/* === Component === */

export default component(
	'context-media',
	{
		// Context for reduced motion preference
		[MEDIA_MOTION]: () => {
			const mql = matchMedia('(prefers-reduced-motion: reduce)')
			const reducedMotion = state(mql.matches)
			mql.addEventListener('change', e => {
				reducedMotion.set(e.matches)
			})
			return reducedMotion
		},

		// Context for preferred color scheme
		[MEDIA_THEME]: () => {
			const mql = matchMedia('(prefers-color-scheme: dark)')
			const colorScheme = state(mql.matches ? 'dark' : 'light')
			mql.addEventListener('change', e => {
				colorScheme.set(e.matches ? 'dark' : 'light')
			})
			return colorScheme
		},

		// Context for screen viewport size
		[MEDIA_VIEWPORT]: (el: HTMLElement) => {
			const getBreakpoint = (attr: string, fallback: string) => {
				const value = el.getAttribute(attr)
				const trimmed = value?.trim()
				if (!trimmed) return fallback
				const unit = trimmed.match(/em$/) ? 'em' : 'px'
				const v = parseFloat(trimmed)
				return Number.isFinite(v) ? v + unit : fallback
			}
			const mqlSM = matchMedia(
				`(min-width: ${getBreakpoint('sm', '32em')})`,
			)
			const mqlMD = matchMedia(
				`(min-width: ${getBreakpoint('md', '48em')})`,
			)
			const mqlLG = matchMedia(
				`(min-width: ${getBreakpoint('lg', '72em')})`,
			)
			const mqlXL = matchMedia(
				`(min-width: ${getBreakpoint('xl', '104em')})`,
			)
			const getViewport = () => {
				if (mqlXL.matches) return 'xl'
				if (mqlLG.matches) return 'lg'
				if (mqlMD.matches) return 'md'
				if (mqlSM.matches) return 'sm'
				return 'xs'
			}
			const viewport = state(getViewport())
			mqlSM.addEventListener('change', () => {
				viewport.set(getViewport())
			})
			mqlMD.addEventListener('change', () => {
				viewport.set(getViewport())
			})
			mqlLG.addEventListener('change', () => {
				viewport.set(getViewport())
			})
			mqlXL.addEventListener('change', () => {
				viewport.set(getViewport())
			})
			return viewport
		},

		// Context for screen orientation
		[MEDIA_ORIENTATION]: () => {
			const mql = matchMedia('(orientation: landscape)')
			const orientation = state(mql.matches ? 'landscape' : 'portrait')
			mql.addEventListener('change', e => {
				orientation.set(e.matches ? 'landscape' : 'portrait')
			})
			return orientation
		},
	},
	() => [
		provideContexts([
			MEDIA_MOTION,
			MEDIA_THEME,
			MEDIA_VIEWPORT,
			MEDIA_ORIENTATION,
		]),
	],
)

declare global {
	interface HTMLElementTagNameMap {
		'context-media': Component<ContextMediaProps>
	}
}
