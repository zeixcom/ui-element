import {
	type Component,
	asBoolean,
	component,
	setProperty,
	show,
	toggleAttribute,
} from '../../../'

export type AccordionPanelProps = {
	open: boolean
	collapsible: boolean
}

export default component(
	'accordion-panel',
	{
		open: asBoolean(),
		collapsible: asBoolean(),
	},
	(el, { first }) => [
		toggleAttribute('open'),
		toggleAttribute('collapsible'),
		show(() => el.open || el.collapsible),
		first('details', [
			setProperty('open'),
			setProperty('ariaDisabled', () => String(!el.collapsible)),
		]),
	],
)

declare global {
	interface HTMLElementTagNameMap {
		'accordion-panel': Component<AccordionPanelProps>
	}
}
