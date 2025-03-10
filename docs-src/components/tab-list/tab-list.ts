import { UIElement, asBoolean, setAttribute, setProperty, toggleAttribute, toggleClass } from '../../../'

export class TabList extends UIElement<{
	active: number,
    accordion: boolean,
}> {
	static readonly localName = 'tab-list'
	static observedAttributes = ['accordion']

	states = {
		active: 0,
		accordion: asBoolean,
	}

	connectedCallback() {
		super.connectedCallback()

		// Set inital active tab by querying details[open]
		const getInitialActive = () => { 
			const panels = Array.from(this.querySelectorAll('details'))
			for (let i = 0; i < panels.length; i++) {
				if (panels[i].hasAttribute('open')) return i
			}
			return 0
		}
		this.set('active', getInitialActive())

		// Reflect accordion attribute (may be used for styling)
		this.self.sync(toggleAttribute('accordion'))

		// Update active tab state and bind click handlers
		this.all('menu button')
			.on('click', (_, index) => () => {
				this.set('active', index)
			})
			.sync(setProperty(
				'ariaPressed',
				(_, index) => String(this.get('active') === index)
			))

		// Update details panels open, hidden and disabled states
		this.all<HTMLDetailsElement>('details').sync(
			setProperty(
				'open',
				(_, index) => !!(this.get('active') === index)
			),
			setAttribute(
				'aria-disabled',
				() => String(!this.get('accordion'))
			)
		)

		// Update summary visibility
		this.all('summary').sync(toggleClass(
			'visually-hidden',
			() => !this.get('accordion')
		))
	}
}
TabList.define()