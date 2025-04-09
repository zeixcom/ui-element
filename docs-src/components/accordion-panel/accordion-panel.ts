import { asBoolean, component, first, setProperty, toggleAttribute } from "../../../"

type AccordionPanelProps = {
	open: boolean,
	collapsible: boolean
}

component<AccordionPanelProps>('accordion-panel', {
	open: asBoolean,
	collapsible: asBoolean
}, host => [
	toggleAttribute('open'),
	toggleAttribute('collapsible'),
	setProperty('hidden', () => !host.open && !host.collapsible),
	first<HTMLDetailsElement, AccordionPanelProps>('details',
		setProperty('open'),
		setProperty('ariaDisabled', () => String(!host.collapsible))
	)
])