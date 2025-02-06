import { setAttribute, UIElement } from '@zeix/ui-element'
import type { InputCheckbox } from '../input-checkbox/input-checkbox'

export type TodoCountObject = {
	active: number
	completed: number
	total: number
}

export class TodoList extends UIElement {
	static states = {
		tasks: [],
		filter: 'all'
	}

	connectedCallback() {
		this.#updateList()

		// Event listener and attribute on own element
		this.self
			.on('click', (e: Event) => {
				if ((e.target as HTMLElement).localName === 'button')
					this.removeItem(e.target as HTMLElement)
			})
			.sync(setAttribute('filter'))

		// Update count on each change
		this.set('count', () => {
			const tasks = (this.get('tasks') as InputCheckbox[])
				.map(el => el.signals.get('checked'))
			const completed = tasks.filter(fn => fn?.get()).length
			const total = tasks.length
			return {
				active: total - completed,
				completed,
				total
			} as TodoCountObject
		})
	}

	addItem = (task: string) => {
		const template = this.querySelector('template')?.content.cloneNode(true) as HTMLElement
		if (template && template.querySelector('span')) {
			template.querySelector('span')!.textContent = task
			this.querySelector('ol')?.appendChild(template)
			this.#updateList()
		}
	}

	removeItem = (element: HTMLElement) => {
		element.closest('li')?.remove()
		this.#updateList()
	}

	clearCompleted = () => {
		(this.get('tasks') as InputCheckbox[])
			.filter(el => el.get('checked'))
			.forEach(el => el.parentElement?.remove())
		this.#updateList()
	}

	#updateList() {
		this.set('tasks', Array.from(this.querySelectorAll('input-checkbox')))
	}

}
TodoList.define('todo-list')