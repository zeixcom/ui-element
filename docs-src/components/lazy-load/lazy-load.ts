import { effect, enqueue, removeElement, setText, UIElement } from '../../../'

export class LazyLoad extends UIElement<{
	content: string,
	error: string,
	loaded: boolean
}> {
	static readonly localName = 'lazy-load'

	states = {
		content: '',
		error: '',
		loaded: false
	}

	connectedCallback() {
		super.connectedCallback()

		const url = this.getAttribute('src')
		if (url) { // Do sanity checks on the user-provided URL here
			this.loadContent(url).then(([error, content]) => {
				this.set('content', content)
				this.set('error', error)
				this.set('loaded', true)
			})
		}

		// Remove loading element when 'loaded' becomes true
		this.first('.loading').sync(removeElement('loaded'))

		// Set error text when 'error' is set
		this.first('.error').sync(setText('error'))

		// Update the shadow DOM or innerHTML when content changes
		effect(() => {
			const content = this.get('content') as string
			if (content) {
				enqueue(() => {
					// Uncomment the following line to use shadow DOM
					// if (this.shadowRoot) this.attachShadow({ mode: 'open' })
					this.root.innerHTML = content 
					this.root.querySelectorAll('script').forEach(script => {
						const newScript = document.createElement('script')
						newScript.appendChild(document.createTextNode(script.textContent ?? ''))
						this.root.appendChild(newScript)
						script.remove()
					})
				}, [this.root as Element, 'll'])
			}
		})
	}

	async loadContent(url: string): Promise<[string, string]> {
		try {
			const response = await fetch(url)
			if (!response.ok) return [response.statusText, '']
			const text = await response.text()
			return ['', text]
		} catch (error) {
			return [error.message, '']
		}
	}

}
LazyLoad.define()