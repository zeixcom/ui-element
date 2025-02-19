import { UIElement } from "@zeix/ui-element"
import type { TodoCountObject, TodoList } from "../todo-list/todo-list"
import type { InputRadiogroup } from "../input-radiogroup/input-radiogroup"
import type { AddTodoEvent } from "../todo-form/todo-form"

export class TodoApp extends UIElement {
	connectedCallback() {
		const todoList = this.querySelector<TodoList>('todo-list')

		// Event listener on own element
		this.self.on('add-todo', (e: Event) => {
			todoList?.addItem((e as AddTodoEvent).detail)
		})
		
		// Coordinate todo-count
		this.first('todo-count').pass({
			active: () => (todoList?.get('count') as TodoCountObject).active
		})

		// Coordinate todo-list
		this.first('todo-list').pass({
			filter: () => this.querySelector<InputRadiogroup>('input-radiogroup')?.get('value')
		})

		// Coordinate .clear-completed button
		this.first('.clear-completed')
			.on('click', () => todoList?.clearCompleted())
			.pass({
				disabled: () => !(todoList?.get('count') as TodoCountObject).completed
			})
	}
}
TodoApp.define('todo-app')