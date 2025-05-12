import {
	type Component,
	asString,
	component,
	first,
	on,
	setAttribute,
	setProperty,
	setText,
	UNSET,
} from "../../../";

export type InputTextProps = {
	value: string;
	length: number;
	error: string;
	description: string;
};

export default component(
	"input-text",
	{
		value: asString(),
		length: 0,
		error: "",
		description: "",
	},
	(el) => {
		const input = el.querySelector("input");
		if (!input) throw new Error("No input element found");

		const errorId = el.querySelector(".error")?.id;
		const descriptionId = el.querySelector(".description")?.id;

		return [
			first(
				"input",
				on("change", () => {
					el.value = input.value;
					el.error = input.validationMessage ?? "";
				}),
				on("input", () => {
					el.length = input.value.length;
				}),
				setProperty("ariaInvalid", () => (el.error ? "true" : "false")),
				setAttribute("aria-errormessage", () =>
					el.error && errorId ? errorId : UNSET,
				),
				setAttribute("aria-describedby", () =>
					el.description && descriptionId ? descriptionId : UNSET,
				),
			),
			first<InputTextProps, HTMLButtonElement>(
				".clear",
				on("click", () => {
					el.value = "";
					el.length = 0;
					input.focus();
				}),
				setProperty("hidden", () => !el.length),
			),
			first(".error", setText("error")),
			first(".description", setText("description")),
		];
	},
);

declare global {
	interface HTMLElementTagNameMap {
		"input-text": Component<InputTextProps>;
	}
}
