import {
	type Component,
	asBoolean,
	asString,
	component,
	first,
	RESET,
	setProperty,
	setText,
} from "../../../";

export type InputButtonProps = {
	disabled: boolean;
	label: string;
	badge: string;
};

export default component(
	"input-button",
	{
		disabled: asBoolean,
		label: asString(RESET),
		badge: asString(RESET),
	},
	() => [
		first<InputButtonProps, HTMLButtonElement>(
			"button",
			setProperty("disabled"),
		),
		first(".label", setText("label")),
		first(".badge", setText("badge")),
	],
);

declare global {
	interface HTMLElementTagNameMap {
		"input-button": Component<InputButtonProps>;
	}
}
