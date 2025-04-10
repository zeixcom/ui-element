import { component, on, pass, setAttribute, setProperty, setText } from '../../../'
import InputCheckbox from "../input-checkbox/input-checkbox"
import type { InputField } from "../input-field/input-field"
import InputRadiogroup from "../input-radiogroup/input-radiogroup"

export default component('todo-app', {
	tasks: [] as typeof InputCheckbox[],
	total: el => () => el.tasks.length,
	completed: el => () => el.tasks.filter(task => task.checked).length,
	active: el => () => {
		const tasks = el.tasks
		return tasks.length - tasks.filter(task => task.checked).length
	},
	filter: el => () => (el.querySelector<typeof InputRadiogroup>('input-radiogroup')?.value ?? 'all'),
}, el => {

	// Set tasks state from the DOM
	const updateTasks = () => {
		el.tasks = Array.from(el.querySelectorAll<typeof InputCheckbox>('input-checkbox'))
	}
	updateTasks()

	// Coordinate new todo form
	const input = el.querySelector<InputField>('input-field')
	el.first('form', on('submit', (e: Event) => {
		e.preventDefault()

		// Wait for microtask to ensure the input field value is updated
		queueMicrotask(() => {
			const value = input?.value.toString().trim()
			if (value) {
				const ol = el.querySelector('ol')
				const fragment = el.querySelector('template')
					?.content.cloneNode(true) as DocumentFragment
				const span = fragment.querySelector('span')
				if (ol && fragment && span) {
					span.textContent = value
					ol.appendChild(fragment)
				}
				updateTasks()
				input?.clear()
			}
		})
	}))

	// Coordinate .submit button
	el.first('.submit', pass({
		disabled: () => input?.empty ?? true
	}))

	// Event handler and effect on ol element
	el.first('ol',
		setAttribute('filter', 'filter'),
		on('click', (e: Event) => {
			const el = e.target as HTMLElement
			if (el.localName === 'button') {
				el.closest('li')?.remove()
				updateTasks()
			}
		})
	)

	// Effects on .todo-count elements
	el.first('.count', setText('active'))
	el.first<HTMLElement>('.singular', setProperty('hidden', () => (el.active ?? 0) > 1))
	el.first<HTMLElement>('.plural', setProperty('hidden', () => el.active === 1))
	el.first<HTMLElement>('.remaining', setProperty('hidden', () => !el.active))
	el.first<HTMLElement>('.all-done', setProperty('hidden', () => !!el.active))

	// Coordinate .clear-completed button
	el.first('.clear-completed',
		on('click', () => {
			el.tasks
				.filter(task => task.checked)
				.forEach(task => task.parentElement?.remove())
			updateTasks()
		}),
		pass({
			disabled: () => !el.completed
		})
	)
})