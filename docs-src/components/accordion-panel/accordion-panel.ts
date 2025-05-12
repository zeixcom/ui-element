import {
	type Component,
	asBoolean,
	component,
	first,
	setProperty,
	toggleAttribute,
} from "../../../";

export type AccordionPanelProps = {
	open: boolean;
	collapsible: boolean;
};

export default component(
	"accordion-panel",
	{
		open: asBoolean,
		collapsible: asBoolean,
	},
	(el) => [
		toggleAttribute("open"),
		toggleAttribute("collapsible"),
		setProperty("hidden", () => !el.open && !el.collapsible),
		first<AccordionPanelProps, HTMLDetailsElement>(
			"details",
			setProperty("open"),
			setProperty("ariaDisabled", () => String(!el.collapsible)),
		),
	],
);

declare global {
	interface HTMLElementTagNameMap {
		"accordion-panel": Component<AccordionPanelProps>;
	}
}
