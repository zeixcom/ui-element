import { removeElement, setText, dangerouslySetInnerHTML, UIElement, UNSET } from '../../../'

export class LazyLoad extends UIElement<{
	content: string,
	error: string,
	loaded: boolean
}> {
	static readonly localName = 'lazy-load'

	states = {
		content: async () => {
			let msg = ''
			const url = this.getAttribute('src')
			if (url) {
				try {
					const response = await fetch(url)
					if (response.ok) return response.text()
					msg = `HTTP error! ${response.statusText}`
				} catch (error) {
					msg = `Network error! ${error.message}`
				}
			} else {
				msg = 'No URL provided'
			}
			this.set('error', msg)
			return ''
		},
		error: UNSET,
		loaded: () => !!(this.get('content') || this.get('error')),
	}

	connectedCallback() {
		super.connectedCallback()

		// Uncomment the following line to use shadow DOM
		// if (this.shadowRoot) this.attachShadow({ mode: 'open' })

		// Remove loading element when 'loaded' becomes true
		this.first('.loading').sync(removeElement('loaded'))

		// Set error text when 'error' is set
		this.first('.error').sync(setText('error'))

		// Update the shadow DOM or innerHTML when content changes
		this.self.sync(dangerouslySetInnerHTML('content'))
	}
}
LazyLoad.define()