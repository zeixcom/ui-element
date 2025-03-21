import { UIElement, setAttribute, setProperty, setText } from "../../.."
import type { InputCheckbox } from "../input-checkbox/input-checkbox"
import type { InputField } from "../input-field/input-field"
import type { InputRadiogroup } from "../input-radiogroup/input-radiogroup"

export class TodoApp extends UIElement<{
	tasks: InputCheckbox[],
	total: number,
	completed: number,
	active: number,
	filter: string,
}> {
	static localName = 'todo-app'

	init = {
		tasks: [],
		total: () => this.get('tasks').length,
        completed: () => this.get('tasks').filter(el => el.get('checked')).length,
        active: () => {
			const tasks = this.get('tasks')
			return tasks.length - tasks.filter(el => el.get('checked')).length
		},
        filter: () => (this.querySelector<InputRadiogroup>('input-radiogroup')?.get('value')?? 'all'),
	}

	connectedCallback() {
		super.connectedCallback()

		// Set tasks state from the DOM
		const updateTasks = () => {
			this.set('tasks', this.all<InputCheckbox>('input-checkbox').targets)
		}
		updateTasks()

		// Coordinate new todo form
		const input = this.querySelector<InputField>('input-field')
		this.first('form').on('submit', (e: Event) => {
			e.preventDefault()

			// Wait for microtask to ensure the input field value is updated
			queueMicrotask(() => {
				const value = input?.get('value').toString().trim()
				if (value) {
					const ol = this.querySelector('ol')
					const fragment = this.querySelector('template')
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
		})

		// Coordinate .submit button
		this.first('.submit').pass({
			disabled: () => input?.get('empty') ?? true
		})

		// Event handler and effect on ol element
		this.first('ol')
			.sync(setAttribute('filter', 'filter'))
			.on('click', (e: Event) => {
				const el = e.target as HTMLElement
				if (el.localName === 'button') {
					el.closest('li')?.remove()
					updateTasks()
				}
			})

		// Effects on .todo-count elements
		this.first('.count').sync(setText('active'))
		this.first('.singular').sync(setProperty('hidden', () => (this.get('active') ?? 0) > 1))
		this.first('.plural').sync(setProperty('hidden', () => this.get('active') === 1))
		this.first('.remaining').sync(setProperty('hidden', () => !this.get('active')))
		this.first('.all-done').sync(setProperty('hidden', () => !!this.get('active')))

		// Coordinate .clear-completed button
		this.first('.clear-completed')
			.on('click', () => {
				this.get('tasks')
					.filter(el => el.get('checked'))
					.forEach(el => el.parentElement?.remove())
				updateTasks()
			})
			.pass({
				disabled: () => !this.get('completed')
			})
	}
}
TodoApp.define()