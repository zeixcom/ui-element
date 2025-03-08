import {
	type EventListenerProvider, type SignalValueProvider, 
	asBoolean, setProperty, toggleAttribute, UIElement
} from '../../../'

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
		const setActiveIndex: EventListenerProvider = (_, index) => () => {
			this.set('active', index)
		}
		const getPressedByIndex: SignalValueProvider<string> = (_, index) =>
			String(this.get('active') === index)
		this.all('menu button')
			.on('click', setActiveIndex)
			.sync(setProperty('ariaPressed', getPressedByIndex))

		// Update open details panel
		const getOpenByIndex: SignalValueProvider<boolean> = (_, index) =>
			!!(this.get('active') === index)
		this.all<HTMLDetailsElement>('details')
			.sync(setProperty('open', getOpenByIndex))
	}
}
TabList.define()