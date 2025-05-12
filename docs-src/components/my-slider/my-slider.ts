import { all, component, first, on, state, toggleClass } from "../../../";

export default component("my-slider", {}, (el) => {
	const active = state(0);
	const total = el.querySelectorAll(".slide").length;
	const isActive = (target: HTMLElement): boolean =>
		String(active.get()) === target.dataset["index"];

	return [
		first(
			".prev",
			on("click", () => {
				active.update((v) => (v - 1 + total) % total);
			}),
		),
		first(
			".next",
			on("click", () => {
				active.update((v) => (v + 1 + total) % total);
			}),
		),
		all(".slide", toggleClass("active", isActive)),
		all(".dots span", toggleClass("active", isActive)),
	];
});
