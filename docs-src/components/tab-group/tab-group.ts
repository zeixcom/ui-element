import {
	type Component,
	all,
	component,
	first,
	on,
	setProperty,
} from "../../..";

export type TabGroupProps = {
	selected: string;
};

const manageArrowKeyFocus =
	(elements: HTMLElement[], index: number) => (e: Event) => {
		if (!(e instanceof KeyboardEvent))
			throw new TypeError("Event is not a KeyboardEvent");
		const handledKeys = [
			"ArrowLeft",
			"ArrowRight",
			"ArrowUp",
			"ArrowDown",
			"Home",
			"End",
		];
		if (handledKeys.includes(e.key)) {
			e.preventDefault();
			switch (e.key) {
				case "ArrowLeft":
				case "ArrowUp":
					index = index < 1 ? elements.length - 1 : index - 1;
					break;
				case "ArrowRight":
				case "ArrowDown":
					index = index >= elements.length - 1 ? 0 : index + 1;
					break;
				case "Home":
					index = 0;
					break;
				case "End":
					index = elements.length - 1;
					break;
			}
			if (elements[index]) elements[index].focus();
		}
	};

export default component(
	"tab-group",
	{
		selected: "",
	},
	(el) => {
		el.selected =
			el
				.querySelector('[role="tab"][aria-selected="true"]')
				?.getAttribute("aria-controls") ?? "";
		const isSelected = (target: Element) =>
			el.selected === target.getAttribute("aria-controls");
		const tabs = Array.from(
			el.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
		);
		let focusIndex = 0;

		return [
			first(
				'[role="tablist"]',
				on("keydown", manageArrowKeyFocus(tabs, focusIndex)),
			),
			all<TabGroupProps, HTMLButtonElement>(
				'[role="tab"]',
				on("click", (e: Event) => {
					el.selected =
						(e.currentTarget as HTMLElement).getAttribute(
							"aria-controls",
						) ?? "";
					focusIndex = tabs.findIndex((tab) => isSelected(tab));
				}),
				setProperty("ariaSelected", (target) =>
					String(isSelected(target)),
				),
				setProperty("tabIndex", (target) =>
					isSelected(target) ? 0 : -1,
				),
			),
			all<TabGroupProps, HTMLElement>(
				'[role="tabpanel"]',
				setProperty("hidden", (target) => el.selected !== target.id),
			),
		];
	},
);

declare global {
	interface HTMLElementTagNameMap {
		"tab-list": Component<TabGroupProps>;
	}
}
