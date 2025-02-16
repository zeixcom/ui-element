import { UIElement } from "../../../index"
import { InputField } from "../input-field/input-field"

export type AddTodoEvent = CustomEvent & { detail: string }

export class TodoForm extends UIElement {
	connectedCallback() {
		const input = this.querySelector<InputField>('input-field')

        this.first('form').on('submit', (e: Event) => {
			e.preventDefault()

			// Wait for microtask to ensure the input field value is updated before dispatching the event
			queueMicrotask(() => {
				const value = input?.get<string>('value').trim()
				if (value) {
					this.self.emit('add-todo', value)
					input?.clear()
				}
			})
		})
	
		this.first('input-button').pass({
			disabled: () => input?.get('empty') ?? true
		})
    }
}
TodoForm.define('todo-form')