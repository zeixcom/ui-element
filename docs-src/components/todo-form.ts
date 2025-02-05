import { UIElement } from "@zeix/ui-element"
import type { InputField } from "./input-field"

export type AddTodoEvent = CustomEvent & { detail: string }

export class TodoForm extends UIElement {
	connectedCallback() {
		const inputField: InputField | null = this.querySelector('input-field')

        this.first('form').on('submit', (e: Event) => {
			e.preventDefault()
			setTimeout(() => {
				this.dispatchEvent(new CustomEvent('add-todo', {
					bubbles: true,
					detail: inputField?.get('value') ?? ''
				}))
				inputField?.clear()
			}, 0)
		})
	
		this.first('input-button').pass({
			disabled: () => inputField?.get('empty')
		})
    }
}
TodoForm.define('todo-form')