import {
	type Component,
	type ComponentProps,
	batch,
	component,
	computed,
	enqueue,
	first,
	insertOrRemoveElement,
	on,
	setAttribute,
	setProperty,
	setText,
	state,
} from "../../../";
import type { InputButtonProps } from "../input-button/input-button";
import type { InputCheckboxProps } from "../input-checkbox/input-checkbox";
import type { InputFieldProps } from "../input-field/input-field";
import type { InputRadiogroupProps } from "../input-radiogroup/input-radiogroup";

export default component("todo-app", {}, (el) => {
	const input = el.querySelector<Component<InputFieldProps>>("input-field");
	if (!input) throw new Error("No input field found");
	const template = el.querySelector("template");
	if (!template) throw new Error("No template found");

	let tasks = Array.from(
		el.querySelectorAll<Component<InputCheckboxProps>>("input-checkbox"),
	);
	const total = state(tasks.length);
	const completed = state(tasks.filter((task) => task.checked).length);
	const active = computed(() => total.get() - completed.get());
	const addTask = state(false);
	const refreshCompleted = () => {
		completed.set(tasks.filter((task) => task.checked).length);
	};
	const refreshTasks = () => {
		tasks = Array.from(
			el.querySelectorAll<Component<InputCheckboxProps>>(
				"input-checkbox",
			),
		);
		batch(() => {
			total.set(tasks.length);
			refreshCompleted();
		});
	};

	return [
		// Control todo input form
		first<ComponentProps, Component<InputButtonProps>>(
			".submit",
			setProperty("disabled", () => !input.length),
		),
		first(
			"form",
			on("submit", (e: Event) => {
				e.preventDefault();
				queueMicrotask(() => {
					const value = input.value.toString().trim();
					if (value) addTask.set(true);
					enqueue(() => {
						refreshTasks();
						input.clear();
					}, [input, "p:value"]);
				});
			}),
		),

		// Control todo list
		first(
			"ol",
			setAttribute(
				"filter",
				() =>
					el.querySelector<Component<InputRadiogroupProps>>(
						"input-radiogroup",
					)?.value ?? "all",
			),
			insertOrRemoveElement(() => (addTask.get() ? 1 : 0), {
				create: () => {
					const li = document.importNode(
						template.content,
						true,
					).firstElementChild;
					li?.querySelector("slot")?.replaceWith(String(input.value));
					return li;
				},
				resolve: () => {
					refreshTasks();
					addTask.set(false);
				},
			}),
			on("click", (e: Event) => {
				const target = e.target as HTMLElement;
				if (target.localName === "button") {
					target.closest("li")?.remove();
					refreshTasks();
				}
			}),
			on("change", () => {
				refreshCompleted();
			}),
		),

		// Update count elements
		first(
			".count",
			setText(() => String(active.get())),
		),
		first<ComponentProps, HTMLElement>(
			".singular",
			setProperty("hidden", () => active.get() > 1),
		),
		first<ComponentProps, HTMLElement>(
			".plural",
			setProperty("hidden", () => active.get() === 1),
		),
		first<ComponentProps, HTMLElement>(
			".remaining",
			setProperty("hidden", () => !active.get()),
		),
		first<ComponentProps, HTMLElement>(
			".all-done",
			setProperty("hidden", () => !!active.get()),
		),

		// Control clear-completed button
		first<ComponentProps, Component<InputButtonProps>>(
			".clear-completed",
			setProperty("disabled", () => !completed.get()),
			setProperty("badge", () =>
				completed.get() > 0 ? String(completed.get()) : "",
			),
			on("click", () => {
				tasks
					.filter((task) => task.checked)
					.forEach((task) => task.parentElement?.remove());
				refreshTasks();
			}),
		),
	];
});
