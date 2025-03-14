import { UIElement, type Context } from '../../../'

/* === Provided Context Keys === */

const MEDIA_MOTION = 'media-motion'
const MEDIA_THEME = 'media-theme'
const MEDIA_VIEWPORT = 'media-viewport'
const MEDIA_ORIENTATION = 'media-orientation'

/* === Pure Functions === */

const parseBreakpoint = (value: string | null, fallback: string) => {
	const attr = value?.trim()
	if (!attr) return fallback
	const unit = attr.match(/em$/) ? 'em' : 'px'
	const v = parseFloat(attr)
	return Number.isFinite(v) ? v + unit : fallback
}

/* === Class Definition === */

export class MediaContext extends UIElement<{
	'media-motion': boolean,
    'media-theme': string,
    'media-viewport': string,
    'media-orientation': string,
}> {
	static readonly localName ='media-context'
	static providedContexts = [
		MEDIA_MOTION as Context<string, boolean>,
		MEDIA_THEME as Context<string, string>,
		MEDIA_VIEWPORT as Context<string, string>,
		MEDIA_ORIENTATION as Context<string, string>,
	]

	connectedCallback() {
		super.connectedCallback()

		const THEME_LIGHT = 'light'
		const THEME_DARK = 'dark'
		const VIEWPORT_XS = 'xs'
		const VIEWPORT_SM = 'sm'
		const VIEWPORT_MD = 'md'
		const VIEWPORT_LG = 'lg'
		const VIEWPORT_XL = 'xl'
		const ORIENTATION_LANDSCAPE = 'landscape'
		const ORIENTATION_PORTRAIT = 'portrait'

		const getBreakpoints = () => ({
			sm: parseBreakpoint(this.getAttribute(VIEWPORT_SM), '32em'),
			md: parseBreakpoint(this.getAttribute(VIEWPORT_MD), '48em'),
			lg: parseBreakpoint(this.getAttribute(VIEWPORT_LG), '72em'),
			xl: parseBreakpoint(this.getAttribute(VIEWPORT_XL), '108em'),
		})
		const breakpoints = getBreakpoints()

		const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
		const colorScheme = matchMedia('(prefers-color-scheme: dark)')
		const screenSmall = matchMedia(`(min-width: ${breakpoints.sm})`)
		const screenMedium = matchMedia(`(min-width: ${breakpoints.md})`)
		const screenLarge = matchMedia(`(min-width: ${breakpoints.lg})`)
		const screenXLarge = matchMedia(`(min-width: ${breakpoints.xl})`)
		const screenOrientation = matchMedia('(orientation: landscape)')

		const getViewport = () => {
			if (screenXLarge.matches) return VIEWPORT_XL
            if (screenLarge.matches) return VIEWPORT_LG
            if (screenMedium.matches) return VIEWPORT_MD
            if (screenSmall.matches) return VIEWPORT_SM
            return VIEWPORT_XS
		}

		// set initial values
		this.set(MEDIA_MOTION, reducedMotion.matches)
		this.set(MEDIA_THEME, colorScheme.matches ? THEME_DARK : THEME_LIGHT)
		this.set(MEDIA_VIEWPORT, getViewport())
		this.set(MEDIA_ORIENTATION, screenOrientation.matches ? ORIENTATION_LANDSCAPE : ORIENTATION_PORTRAIT)

		// event listeners
		reducedMotion.addEventListener('change', e => this.set(MEDIA_MOTION, e.matches))
		colorScheme.addEventListener('change', e => this.set(MEDIA_THEME, e.matches ? THEME_DARK : THEME_LIGHT))
		screenSmall.addEventListener('change', () => this.set(MEDIA_VIEWPORT, getViewport()))
		screenMedium.addEventListener('change', () => this.set(MEDIA_VIEWPORT, getViewport()))
		screenLarge.addEventListener('change', () => this.set(MEDIA_VIEWPORT, getViewport()))
		screenXLarge.addEventListener('change', () => this.set(MEDIA_VIEWPORT, getViewport()))
		screenOrientation.addEventListener('change', e => this.set(MEDIA_THEME, e.matches ? ORIENTATION_LANDSCAPE : ORIENTATION_PORTRAIT))
	}
}
MediaContext.define()