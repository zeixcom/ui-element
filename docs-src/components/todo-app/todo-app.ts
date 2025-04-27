import {
	type Component, type ComponentProps,
	batch, component, computed, enqueue, first, insertTemplate, on, setAttribute, setProperty, setText, state
} from '../../../'
import { InputButtonProps } from '../input-button/input-button'
import { InputCheckboxProps } from '../input-checkbox/input-checkbox'
import { InputFieldProps } from '../input-field/input-field'
import { InputRadiogroupProps } from '../input-radiogroup/input-radiogroup'

export default component('todo-app', {}, el => {
	const input = el.querySelector<Component<InputFieldProps>>('input-field')
	if (!input) throw new Error('No input field found')
	const template = el.querySelector('template')
	if (!template) throw new Error('No template found')
	
	let tasks = Array.from(el.querySelectorAll<Component<InputCheckboxProps>>('input-checkbox'))
	const total = state(tasks.length)
	const completed = state(tasks.filter(task => task.checked).length)
	const active = computed(() => total.get() - completed.get())
	const addTask = state(false)
	const refreshCompleted = () => {
		completed.set(tasks.filter(task => task.checked).length)
	}
	const refreshTasks = () => {
		tasks = Array.from(el.querySelectorAll<Component<InputCheckboxProps>>('input-checkbox'))
		batch(() => {
			total.set(tasks.length)
			refreshCompleted()
		})
	}

	return [
		first<ComponentProps, Component<InputButtonProps>>('.submit',
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
						input.clear()
					}, [input, 'p:value'])
				})
			})
		),
		first('ol',
			setAttribute('filter',
				() => (el.querySelector<Component<InputRadiogroupProps>>('input-radiogroup')?.value ?? 'all')
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
			setText(() => String(active.get()))
		),
		first<ComponentProps, HTMLElement>('.singular',
			setProperty('hidden', () => active.get() > 1)
		),
		first<ComponentProps, HTMLElement>('.plural',
			setProperty('hidden', () => active.get() === 1)
		),
		first<ComponentProps, HTMLElement>('.remaining',
			setProperty('hidden', () => !active.get())
		),
		first<ComponentProps, HTMLElement>('.all-done',
			setProperty('hidden', () => !!active.get())
		),
		first<ComponentProps, Component<InputButtonProps>>('.clear-completed',
			setProperty('disabled', () => !completed.get()),
			setProperty('badge', () => completed.get() > 0 ? String(completed.get()) : ''),
			on('click', () => {
				tasks.filter(task => task.checked)
					.forEach(task => task.parentElement?.remove())
				refreshTasks()
			})
		)
	]
})
