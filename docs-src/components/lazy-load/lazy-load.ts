import {
	type AttributeParser, type SignalProducer,
	setProperty, setText, dangerouslySetInnerHTML, component,
	first
} from '../../../'

export type LazyLoadProps = {
	error: string
	src: string
	content: string
}

/* === Attribute Parser === */

const asURL: AttributeParser<HTMLElement & { error: string }, string> = (el, v) => {
	if (!v) {
		el.error = 'No URL provided in src attribute'
		return ''
	} else if ((el.parentElement || (el.getRootNode() as ShadowRoot).host)?.closest(`${el.localName}[src="${v}"]`)) {
		el.error = 'Recursive loading detected'
		return ''
	}
	const url = new URL(v, location.href) // Ensure 'src' attribute is a valid URL
	if (url.origin === location.origin) { // Sanity check for cross-origin URLs
		el.error = '' // Success: wipe previous error if there was any
		return String(url)
	}
	el.error = 'Invalid URL origin'
	return ''
}

/* === Signal Producer === */

const fetchText: SignalProducer<HTMLElement & { error: string, src: string }, string> = el =>
	async abort => { // Async Computed callback
		const url = el.src
		if (!url) return ''
		try {
			const response = await fetch(url, { signal: abort })
			el.querySelector('.loading')?.remove()
			if (response.ok) return response.text()
			else el.error = response.statusText
		} catch (error) {
			el.error = error.message
		}
		return ''
	}


/* === Component === */

const LazyLoad = component('lazy-load', {
	error: '',
	src: asURL,
	content: fetchText
}, el => [
	dangerouslySetInnerHTML('content'),
	first<LazyLoadProps, HTMLElement>('.error',
		setText('error'),
		setProperty('hidden', () => !el.error)
	)
])

declare global {
	interface HTMLElementTagNameMap {
		'lazy-load': typeof LazyLoad
	}
}

export default LazyLoad