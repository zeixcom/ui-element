import { asBoolean, setProperty, toggleAttribute, UIElement } from "../../../"

export class AccordionPanel extends UIElement<{
	open: boolean,
    collapsible: boolean,
}> {
	static readonly localName = 'accordion-panel'
	static observedAttributes = ['open', 'collapsible']

	init = {
        open: asBoolean,
        collapsible: asBoolean
    }

	connectedCallback() {
		super.connectedCallback()

		// Handle open and collapsible state changes
		this.self.sync(
			toggleAttribute('open'),
			toggleAttribute('collapsible'),
			setProperty('hidden', () => !this.get('open') && !this.get('collapsible'))
		)

		// Control inner details panel
		this.first<HTMLDetailsElement>('details').sync(
			setProperty('open'),
			setProperty('ariaDisabled', () => String(!this.get('collapsible')))
		)
	}
}
AccordionPanel.define()
