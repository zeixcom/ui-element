import { asBoolean, setProperty, toggleAttribute, UIElement } from "@zeix/ui-element"

export class AccordionPanel extends UIElement {
	static states = {
		open: asBoolean,
		collapsible: asBoolean
	}

	connectedCallback() {
		super.connectedCallback()
		
		// Handle open and collapsible state changes
		this.self.sync(
			toggleAttribute('open'),
			toggleAttribute('collapsible'),
			setProperty('ariaHidden', () => !this.get('open') && !this.get('collapsible'))
		)

		// Control inner details panel
		this.first('details').sync(
			setProperty('open'),
			setProperty('ariaDisabled', () => !this.get('collapsible'))
		)
	}
}
AccordionPanel.define('accordion-panel')