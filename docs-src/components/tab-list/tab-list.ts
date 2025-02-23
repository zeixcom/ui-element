import { asBoolean, setProperty, toggleAttribute, UIElement, type Context } from '../../../'

export class TabList extends UIElement<{
	active: number,
    accordion: boolean,
	'media-viewport'?: string,
}> {
	static readonly localName = 'tab-list'
	static observedAttributes = ['accordion']
	static consumedContexts = ['media-viewport' as Context<string, string>]

	states = {
		active: 0,
		accordion: asBoolean,
	}

	connectedCallback() {
		super.connectedCallback()

		// Dynamically adjust accordion based on viewport size
		queueMicrotask(() => {
			if (this.get('media-viewport'))
				this.set('accordion', () =>
					['xs', 'sm'].includes(String(this.get('media-viewport')))
				)
		})

		// Reflect accordion attribute (may be used for styling)
		this.self.sync(toggleAttribute('accordion'))

		// Hide accordion tab navigation when in accordion mode
		this.first('menu').sync(setProperty('hidden', 'accordion'))

		// Update active tab state and bind click handlers
		this.all('menu button')
			.on('click', (_target, index) => () => this.set('active', index))
			.sync((host, target, index) => {
				setProperty(
					'ariaPressed',
					() => String(this.get('active') === index)
				)(host, target)
			})

		// Pass open and collapsible states to accordion panels
		this.all('accordion-panel').pass((_target, index) => ({
			open: () => this.get('active') === index,
			collapsible: 'accordion'
		}))
	}
}
TabList.define()