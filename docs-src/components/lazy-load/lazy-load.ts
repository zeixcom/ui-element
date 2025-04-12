import { type Parser, type SignalProducer, setProperty, setText, dangerouslySetInnerHTML, component } from '../../../'

export type LazyLoadProps = {
	error: string
	src: string
	content: string
}

/* === Attribute Parser === */

const asURL: Parser<string, HTMLElement & { error: string }> = (el, v) => {
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

const fetchContent: SignalProducer<string, HTMLElement & { error: string, src: string }> = el =>
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
	content: fetchContent
}, el => {
	el.first<HTMLElement>('.error',
		setText('error'),
		setProperty('hidden', () => !el.error)
	)
	el.self(dangerouslySetInnerHTML('content', 'open'))
})

declare global {
	interface HTMLElementTagNameMap {
		'lazy-load': typeof LazyLoad
	}
}

export default LazyLoad