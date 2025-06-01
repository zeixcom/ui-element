import {
	type Component,
	type SignalProducer,
	component,
	selection,
	pass,
} from "../../../";
import { SpinButtonProps } from "../spin-button/spin-button";

export type ProductCatalogProps = {
	total: number;
};

export default component(
	"product-catalog",
	{
		total: ((el) => () =>
			selection<Component<SpinButtonProps>>(el, "spin-button")
				.get()
				.reduce((sum, item) => sum + item.value, 0)
		) as SignalProducer<HTMLElement, number>,
	},
	(el, { first }) => [
		first(
			"input-button",
			pass({
				badge: () => (el.total > 0 ? String(el.total) : ""),
				disabled: () => !el.total,
			}),
		),
	],
);

declare global {
	interface HTMLElementTagNameMap {
		"product-catalog": Component<ProductCatalogProps>;
	}
}
