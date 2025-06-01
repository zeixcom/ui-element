import {
	type Component,
	component,
	on,
	setProperty,
	state,
} from "../../../";
import type { InputButtonProps } from "../input-button/input-button";
import type { RatingStarsProps } from "../rating-stars/rating-stars";

export default component("rating-feedback", {}, (el, { all, first }) => {
	const rating = state(0);
	const empty = state(true);
	const submitted = state(false);
	const stars = el.querySelector<Component<RatingStarsProps>>("rating-stars");
	if (!stars) throw new Error("No rating-stars component found");
	const hasDifferentKey = (element: HTMLElement): boolean =>
		rating.get() !== parseInt(element.dataset["key"] || "0");

	return [
		// Event listeners for rating changes and form submission
		on<CustomEvent<number>>("change-rating", (e) => {
			rating.set(e.detail);
		}),
		on("submit", (e) => {
			e.preventDefault();
			submitted.set(true);
			console.log("Feedback submitted");
		}),

		// Event listener for hide button
		first(
			".hide",
			on("click", () => {
				const feedback = el.querySelector<HTMLElement>(".feedback");
				if (feedback) feedback.hidden = true;
			}),
		),

		// Event listener for textarea
		first(
			"textarea",
			on("input", (e: Event) => {
				empty.set(
					(e.target as HTMLTextAreaElement)?.value.trim() === "",
				);
			}),
		),

		// Effects on rating changes
		first<HTMLElement>(
			".feedback",
			setProperty("hidden", () => submitted.get() || !rating.get()),
		),
		all<HTMLElement>(
			".feedback p",
			setProperty("hidden", hasDifferentKey),
		),

		// Effect on empty state
		first<Component<InputButtonProps>>(
			"input-button",
			setProperty("disabled", empty),
		),
	];
});
