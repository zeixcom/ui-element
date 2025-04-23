import { asBoolean, component, first, setProperty, toggleAttribute } from '../../../'

export type AccordionPanelProps = {
	open: boolean
	collapsible: boolean
}

const AccordionPanel = component('accordion-panel', {
	open: asBoolean,
	collapsible: asBoolean
}, el => [
	toggleAttribute('open'),
	toggleAttribute('collapsible'),
	setProperty('hidden', () => !el.open && !el.collapsible),
	first<AccordionPanelProps, HTMLDetailsElement>('details',
		setProperty('open'),
		setProperty('ariaDisabled', () => String(!el.collapsible))
	)
])

declare global {
	interface HTMLElementTagNameMap {
		'accordion-panel': typeof AccordionPanel
	}
}

export default AccordionPanel