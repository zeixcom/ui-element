import { asBoolean, component, setProperty, toggleAttribute } from "../../../index"

export const AccordionPanel = component('accordion-panel', {
	open: asBoolean,
	collapsible: asBoolean
}, (host, { open, collapsible }) => {

	// Handle open and collapsible state changes
	host.self.sync(
		toggleAttribute('open'),
		toggleAttribute('collapsible'),
		setProperty('ariaHidden', () => !open.get() && !collapsible.get())
	)

	// Control inner details panel
	host.first('details').sync(
		setProperty('open'),
		setProperty('ariaDisabled', () => !collapsible.get())
	)
})