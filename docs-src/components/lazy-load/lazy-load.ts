import { UIElement, setProperty, setText, dangerouslySetInnerHTML } from '../../../'

export class LazyLoad extends UIElement<{
    src: string,
    content: string,
    error: string,
}> {
	static localName = 'lazy-load'

	init = {
		src: (v: string | null) => { // Custom attribute parser
			if (!v) {
				this.set('error', 'No URL provided in src attribute')
				return ''
			} else if ((this.parentElement || (this.getRootNode() as ShadowRoot).host)?.closest(`${this.localName}[src="${v}"]`)) {
				this.set('error', 'Recursive loading detected')
				return ''
			}
			const url = new URL(v, location.href) // Ensure 'src' attribute is a valid URL
			if (url.origin === location.origin) // Sanity check for cross-origin URLs
				return url.toString()
			this.set('error', 'Invalid URL origin')
			return ''
		},
		content: async () => { // Async Computed callback
			const url = this.get('src')
			if (!url) return ''
			try {
				const response = await fetch(this.get('src'))
				this.querySelector('.loading')?.remove()
				if (response.ok) return response.text()
				else this.set('error', response.statusText)
			} catch (error) {
				this.set('error', error.message)
			}
			return ''
		},
		error: '',
	}

	connectedCallback() {
		super.connectedCallback()

		// Effect to set error message
		this.first('.error').sync(
			setProperty('hidden', () => !this.get('error')),
			setText('error'),
		)

		// Effect to set innerHTML to result of Computed 'content'
		this.self.sync(dangerouslySetInnerHTML('content'))
	}
}
LazyLoad.define()