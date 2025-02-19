import { asBoolean, setProperty, toggleAttribute, UIElement, type Context } from "@zeix/ui-element"

export class TabList extends UIElement {
	static observedAttributes = ['accordion']
	static states = {
		accordion: asBoolean,
	}
	static consumedContexts = ['media-viewport' as Context<string, string>]

	connectedCallback() {
		super.connectedCallback()
		this.set('active', 0, false) // initial active tab

		// Dynamically adjust accordion based on viewport size
		setTimeout(() => {
			if (this.get('media-viewport'))
				this.set('accordion', () => ['xs', 'sm'].includes(String(this.get('media-viewport'))))
		}, 0)

		// Reflect accordion attribute (may be used for styling)
		this.self.sync(toggleAttribute('accordion'))

		// Hide accordion tab navigation when in accordion mode
		this.first('menu').sync(setProperty('ariaHidden', 'accordion'))

		// Update active tab state and bind click handlers
		this.all('menu button')
			.on('click', (_target, index) => () => this.set('active', index))
			.sync((host, target, index) => setProperty(
				'ariaPressed',
				() => this.get('active') === index
			)(host, target))

		// Pass open and collapsible states to accordion panels
		this.all('accordion-panel').pass({
			open: (_target, index) => () => this.get('active') === index,
			collapsible: 'accordion'
		})
	}
}
TabList.define('tab-list')