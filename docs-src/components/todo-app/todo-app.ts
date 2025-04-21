import { type ComponentProps, component, computed, first, insertTemplate, on, setAttribute, setProperty, setText, state } from '../../../'
import InputButton from '../input-button/input-button'
import InputCheckbox from '../input-checkbox/input-checkbox'
import InputField from '../input-field/input-field'

/* === Component === */

const TodoApp = component('todo-app', {}, el => {
	const tasks = state(Array.from(el.querySelectorAll<typeof InputCheckbox>('input-checkbox')))
	const total = tasks.map(tasks => tasks.length)
	const completed = tasks.map(tasks => tasks.filter(task => task.checked).length)
	const active = computed({
		signals: [total, completed],
		ok: (t, c) => t - c
	})
	const addTask = state(false)
	const input = el.querySelector<typeof InputField>('input-field')
	if (!input) throw new Error('No input field found')
	const template = el.querySelector('template')
	if (!template) throw new Error('No template found')

	return [
		first('form',
			on('submit', (e: Event) => {
				e.preventDefault()
				queueMicrotask(() => {
					const value = input?.value.toString().trim()
					if (value) addTask.set(true)
				})
			})
		),
		first<typeof InputButton, ComponentProps>('.submit',
			setProperty('disabled', () => input.empty),
			/* pass({
				disabled: () => input.empty ?? true
			}) */
		),
		first('ol',
			setAttribute('filter',
				() => (el.querySelector('input-radiogroup')?.value ?? 'all')
			),
			insertTemplate(template, addTask, 'beforeend', String(input.value)),
			on('click', (e: Event) => {
				const target = e.target as HTMLElement
				if (target.localName === 'button') {
					target.closest('li')?.remove()
					tasks.set(Array.from(el.querySelectorAll<typeof InputCheckbox>('input-checkbox')))
				}
			})
		),
		first('.count',
			setText(active.map(a => String(a)))
		),
		first<HTMLElement, ComponentProps>('.singular',
			setProperty('hidden', active.map(a => a > 1))
		),
		first<HTMLElement, ComponentProps>('.plural',
			setProperty('hidden', active.map(a => a === 1))
		),
		first<HTMLElement, ComponentProps>('.remaining',
			setProperty('hidden', active.map(a => !a))
		),
		first<HTMLElement, ComponentProps>('.all-done',
			setProperty('hidden', active.map(a => !!a))
		),
		first<typeof InputButton, ComponentProps>('.clear-completed',
			setProperty('disabled', completed.map(c => !c)),
			on('click', () => {
				tasks.get()
					.filter(task => task.checked)
					.forEach(task => task.parentElement?.remove())
				tasks.set(Array.from(el.querySelectorAll<typeof InputCheckbox>('input-checkbox')))
			}),
			/* pass({
				disabled: () => !el.completed
			}) */
		)
	]

})

declare global {
	interface HTMLElementTagNameMap {
		'todo-app': typeof TodoApp
	}
}

export default TodoApp