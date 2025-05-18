import {
	type Component,
	type SignalProducer,
	component,
	first,
	selection,
	setProperty,
} from "../../../";
import { SpinButtonProps } from "../spin-button/spin-button";
import { InputButtonProps } from "../input-button/input-button";

export type ProductCatalogProps = {
	quantities: Component<SpinButtonProps>[];
};

export default component(
	"product-catalog",
	{
		quantities: ((el) =>
			selection<Component<{ value: number }>>(
				el,
				"spin-button",
			)) as SignalProducer<HTMLElement, Component<{ value: number }>[]>,
	},
	(el) => [
		first<ProductCatalogProps, Component<InputButtonProps>>(
			"input-button",
			setProperty("badge", () => {
				const total = el.quantities.reduce(
					(sum, item) => sum + item.value,
					0,
				);
				return total > 0 ? String(total) : "";
			}),
		),
	],
);

declare global {
	interface HTMLElementTagNameMap {
		"product-catalog": Component<ProductCatalogProps>;
	}
}
