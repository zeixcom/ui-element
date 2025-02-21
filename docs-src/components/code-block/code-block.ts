import { asBoolean, toggleAttribute, UIElement } from '../../../'
// import Prism from 'prismjs'
// import 'prismjs/components/prism-bash';
// import 'prismjs/components/prism-json';
// import 'prismjs/components/prism-typescript';

import type { InputButton } from '../input-button/input-button'

export class CodeBlock extends UIElement<{ collapsed: boolean }> {
	static readonly localName = 'code-block'
	static observedAttributes = ['collapsed']

	states = {
		collapsed: asBoolean
	}

  	connectedCallback() {

		// Enhance code block with Prism.js
		// const language = this.getAttribute('language') || 'html' 
		const content = this.querySelector('code')
		if (content) {
			/* this.set('code', content.textContent?.trim(), false)
			effect(() => {
				// Apply syntax highlighting while preserving Lit's marker nodes in Storybook
				const code = document.createElement('code')
				code.innerHTML = Prism.highlight(
					this.get('code') ?? '',
					Prism.languages[language],
					language
				)
				enqueue(() => {
					Array.from(code.childNodes)
						.filter(node => node.nodeType !== Node.COMMENT_NODE)
						.forEach(node => node.remove())
					Array.from(code.childNodes)
						.forEach(node => code.appendChild(node))
				}, [code, 'h'])
			}) */

			// Copy to clipboard
			this.first('.copy').on('click', async (e: Event) => {
				const copyButton = e.currentTarget as InputButton
				const label = copyButton.textContent ?? ''
				let status = 'success'
				try {
					await navigator.clipboard.writeText(content.textContent ?? '')
				} catch (err) {
					console.error('Error when trying to use navigator.clipboard.writeText()', err)
					status = 'error'
				}
				copyButton.set('disabled', true)
				copyButton.set('label', this.getAttribute(`copy-${status}`) ?? label)
				setTimeout(() => {
					copyButton.set('disabled', false)
					copyButton.set('label', label)
				}, status === 'success' ? 1000 : 3000)
			})

			// Expand
			this.first('.overlay').on('click', () => this.set('collapsed', false))
			this.self.sync(toggleAttribute('collapsed'))
		}
	}
}
CodeBlock.define()