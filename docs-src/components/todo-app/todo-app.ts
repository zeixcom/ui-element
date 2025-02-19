import { setAttribute, setProperty, setText, UIElement } from "@zeix/ui-element"
import type { InputRadiogroup } from "../input-radiogroup/input-radiogroup"
import type { InputField } from "../input-field/input-field"
import type { InputCheckbox } from "../input-checkbox/input-checkbox"

export class TodoApp extends UIElement {
	connectedCallback() {
		const input = this.querySelector<InputField>('input-field')

		// State signal 'tasks': State<InputCheckbox[]>
		this.#updateTasks()

		// Derived signals
		this.set('total', () =>
			this.get<InputCheckbox[]>('tasks')!.length
		)
		this.set('completed', () =>
			this.get<InputCheckbox[]>('tasks')!.filter(el => el.get('checked')).length
        )
		this.set('active', () =>
			this.get<number>('total')! - this.get<number>('completed')!
		)
		this.set('filter', () =>
            this.querySelector<InputRadiogroup>('input-radiogroup')?.get<string>('value') ?? 'all'
        )
		
		this.first('form').on('submit', (e: Event) => {
			e.preventDefault()

			// Wait for microtask to ensure the input field value is updated
			queueMicrotask(() => {
				const value = input?.get<string>('value')?.trim()
				if (value) {
					const ol = this.querySelector('ol')
					const fragment = this.querySelector('template')
						?.content.cloneNode(true) as DocumentFragment
					const span = fragment.querySelector('span')
					if (ol && fragment && span) {
						span.textContent = value
						ol.appendChild(fragment)
					}
					this.#updateTasks()
					input?.clear()
				}
			})
		})

		// Coordinate .submit button
		this.first('.submit').pass({
			disabled: () => input?.get('empty')
		})

		// Event handler and effect on ol element
		this.first('ol')
			.on('click', (e: Event) => {
				const el = e.target as HTMLElement
				if (el.localName === 'button') {
					el.closest('li')?.remove()
					this.#updateTasks()
				}
			})
			.sync(setAttribute('filter'))
		
		// Effects on .todo-count elements
		this.first('.count').sync(setText('active'))
		const setAriaHidden = (fn: (n: number) => boolean) =>
			setProperty('ariaHidden', () => fn(this.get<number>('active')!))
		this.first('.singular').sync(setAriaHidden(n => n > 1))
		this.first('.plural').sync(setAriaHidden(n => n === 1))
		this.first('.remaining').sync(setAriaHidden(n => !n))
		this.first('.all-done').sync(setAriaHidden(n => !!n))

		// Coordinate .clear-completed button
		this.first('.clear-completed')
			.on('click', () => {
				this.get<InputCheckbox[]>('tasks')!
					.filter(el => el.get('checked'))
					.forEach(el => el.parentElement?.remove())
				this.#updateTasks()
			})
			.pass({
				disabled: () => !(this.get('completed'))
			})
	}

	#updateTasks() {
		this.set('tasks', Array.from(this.querySelectorAll('input-checkbox')))
	}
}
TodoApp.define('todo-app')