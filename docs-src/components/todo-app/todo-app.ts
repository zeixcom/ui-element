import { type ComponentProps, component, computed, enqueue, first, insertTemplate, on, setAttribute, setProperty, setText, state } from '../../../'
import InputButton from '../input-button/input-button'
import InputCheckbox from '../input-checkbox/input-checkbox'
import InputField from '../input-field/input-field'

/* === Component === */

const TodoApp = component('todo-app', {}, el => {
	const input = el.querySelector<typeof InputField>('input-field')
	if (!input) throw new Error('No input field found')
	const template = el.querySelector('template')
	if (!template) throw new Error('No template found')
	
	let tasks = Array.from(el.querySelectorAll<typeof InputCheckbox>('input-checkbox'))
	const total = state(tasks.length)
	const completed = state(tasks.filter(task => task.checked).length)
	const active = computed(() => total.get() - completed.get())
	const addTask = state(false)
	const refreshCompleted = () => {
		completed.set(tasks.filter(task => task.checked).length)
	}
	const refreshTasks = () => {
		tasks = Array.from(el.querySelectorAll<typeof InputCheckbox>('input-checkbox'))
		total.set(tasks.length)
		refreshCompleted()
	}

	return [
		first('.submit',
			setProperty('disabled', () => !input.length),
		),
		first('form',
			on('submit', (e: Event) => {
				e.preventDefault()
				queueMicrotask(() => {
					const value = input.value.toString().trim()
					if (value) addTask.set(true)
					enqueue(() => {
						refreshTasks()
						input.value = ''
					}, [input, 'p:value'])
				})
			})
		),
		first('ol',
			setAttribute('filter',
				() => (el.querySelector('input-radiogroup')?.value ?? 'all')
			),
			insertTemplate(template, addTask, 'beforeend', () => String(input.value)),
			on('click', (e: Event) => {
				const target = e.target as HTMLElement
				if (target.localName === 'button') {
					target.closest('li')?.remove()
					refreshTasks()
				}
			}),
			on('change', () => {
				refreshCompleted()
			})
		),
		first('.count',
			setText(active.map(a => String(a)))
		),
		first('.singular',
			setProperty('hidden', active.map(a => a > 1))
		),
		first('.plural',
			setProperty('hidden', active.map(a => a === 1))
		),
		first('.remaining',
			setProperty('hidden', active.map(a => !a))
		),
		first('.all-done',
			setProperty('hidden', active.map(a => !!a))
		),
		first('.clear-completed',
			setProperty('disabled', completed.map(c => !c)),
			on('click', () => {
				tasks.filter(task => task.checked)
					.forEach(task => task.parentElement?.remove())
				refreshTasks()
			})
		)
	]

})

declare global {
	interface HTMLElementTagNameMap {
		'todo-app': typeof TodoApp
	}
}

export default TodoApp