import { type SignalProducer, component, on, pass, setAttribute, setProperty, setText } from '../../../'
import InputCheckbox from '../input-checkbox/input-checkbox'
import InputField from '../input-field/input-field'

/* === Signal Producers === */

const createTotal: SignalProducer<number, HTMLElement & { tasks: typeof InputCheckbox[] }> = el =>
	() => el.tasks.length

const createCompleted: SignalProducer<number, HTMLElement & { tasks: typeof InputCheckbox[] }> = el =>
	() => el.tasks.filter(task => task.checked).length

const createActive: SignalProducer<number, HTMLElement & { tasks: typeof InputCheckbox[] }> = el =>
	() => el.tasks.length - el.tasks.filter(task => task.checked).length

const createFilter: SignalProducer<string, HTMLElement> = el =>
	() => (el.querySelector('input-radiogroup')?.value?? 'all')

/* === Component === */

const TodoApp = component('todo-app', {
	tasks: [] as typeof InputCheckbox[],
	total: createTotal,
	completed: createCompleted,
	active: createActive,
	filter: createFilter,
}, el => {

	// Set tasks state from the DOM
	const updateTasks = () => {
		el.tasks = Array.from(el.querySelectorAll<typeof InputCheckbox>('input-checkbox'))
	}
	updateTasks()

	// Coordinate new todo form
	const input = el.querySelector<typeof InputField>('input-field')
	if (input) {
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
					if (input) input.value = ''
				}
			})
		}))

		el.first('.submit', pass({
			disabled: () => input?.empty ?? true
		}))
	}	

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

declare global {
	interface HTMLElementTagNameMap {
		'todo-app': typeof TodoApp
	}
}

export default TodoApp