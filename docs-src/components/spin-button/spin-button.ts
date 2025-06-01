import {
	type Component,
	asInteger,
	component,
	on,
	setProperty,
	setText,
} from "../../../";

export type SpinButtonProps = {
	value: number;
};

export default component(
	"spin-button",
	{
		value: asInteger(),
	},
	(el, { all, first }) => {
		const zeroLabel = el.getAttribute("zero-label") || "Add to Cart";
		const incrementLabel =
			el.getAttribute("increment-label") || "Increment";
		const max = asInteger(9)(el, el.getAttribute("max"));
		const isZero = () => el.value === 0;
		return [
			first<HTMLButtonElement>(
				".value",
				setText("value"),
				setProperty("hidden", isZero),
			),
			first<HTMLButtonElement>(
				".decrement",
				setProperty("hidden", isZero),
				on("click", () => {
					el.value--;
				}),
			),
			first<HTMLButtonElement>(
				".increment",
				setText(() => (isZero() ? zeroLabel : "+")),
				setProperty("ariaLabel", () =>
					isZero() ? zeroLabel : incrementLabel,
				),
				setProperty("disabled", () => el.value >= max),
				on("click", () => {
					el.value++;
				}),
			),
			all(
				"button",
				on("keydown", (e: Event) => {
					const { key } = e as KeyboardEvent;
					if (["ArrowUp", "ArrowDown", "-", "+"].includes(key)) {
						e.stopPropagation();
						e.preventDefault();
						if (key === "ArrowDown" || key === "-") el.value--;
						if (key === "ArrowUp" || key === "+") el.value++;
					}
				}),
			),
		];
	},
);

declare global {
	interface HTMLElementTagNameMap {
		"spin-button": Component<SpinButtonProps>;
	}
}
