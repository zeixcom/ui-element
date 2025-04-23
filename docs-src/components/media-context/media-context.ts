import { type Context, type SignalProducer, type State, component, provide, state } from '../../../'

export type ThemeContext = {
	'media-motion': boolean
	'media-theme': string
	'media-viewport': string
	'media-orientation': string
}

/* === Signal Producers === */

const matchMotion: SignalProducer<HTMLElement, boolean> = () => {
	const mql = matchMedia('(prefers-reduced-motion: reduce)')
	const reducedMotion = state(mql.matches)
	mql.addEventListener('change', e => {
		reducedMotion.set(e.matches)
	})
	return reducedMotion
}

const matchTheme: SignalProducer<HTMLElement, string> = () => {
	const mql = matchMedia('(prefers-color-scheme: dark)')
	const colorScheme = state(mql.matches ? 'dark' : 'light')
	mql.addEventListener('change', e => {
		colorScheme.set(e.matches ? 'dark' : 'light')
	})
	return colorScheme
}

const matchViewport: SignalProducer<HTMLElement, string> = el => {
	const getBreakpoint = (attr: string, fallback: string) => {
		const value = el.getAttribute(attr)
		const trimmed = value?.trim()
		if (!trimmed) return fallback
		const unit = trimmed.match(/em$/) ? 'em' : 'px'
		const v = parseFloat(trimmed)
		return Number.isFinite(v) ? v + unit : fallback
	}
	const mqlSM = matchMedia(`(min-width: ${getBreakpoint('sm', '32em')})`)
	const mqlMD = matchMedia(`(min-width: ${getBreakpoint('md', '48em')})`)
	const mqlLG = matchMedia(`(min-width: ${getBreakpoint('lg', '72em')})`)
	const mqlXL = matchMedia(`(min-width: ${getBreakpoint('xl', '104em')})`)
	const getViewport = () =>
		mqlXL.matches ? 'xl'
			: mqlLG.matches ? 'lg'
			: mqlMD.matches ? 'md'
			: mqlSM.matches ? 'sm'
			: 'xs'
	const viewport = state(getViewport())
	mqlSM.addEventListener('change', () => { viewport.set(getViewport()) })
	mqlMD.addEventListener('change', () => { viewport.set(getViewport()) })
	mqlLG.addEventListener('change', () => { viewport.set(getViewport()) })
	mqlXL.addEventListener('change', () => { viewport.set(getViewport()) })
	return viewport
}

const matchOrientation: SignalProducer<HTMLElement, string> = () => {
	const mql = matchMedia('(orientation: landscape)')
	const orientation = state(mql.matches? 'landscape' : 'portrait')
	mql.addEventListener('change', e => {
		orientation.set(e.matches? 'landscape' : 'portrait')
	})
	return orientation
}

/* === Component === */

const MediaContext = component('media-context', {
	'media-motion': matchMotion,
	'media-theme': matchTheme,
	'media-viewport': matchViewport,
    'media-orientation': matchOrientation
}, () => [
	provide([
		'media-motion' as Context<'media-motion', State<boolean>>,
		'media-theme' as Context<'media-theme', State<string>>,
		'media-viewport' as Context<'media-viewport', State<string>>,
		'media-orientation' as Context<'media-orientation', State<string>>
	])
])

declare global {
	interface HTMLElementTagNameMap {
		'media-context': typeof MediaContext
	}
}

export default MediaContext