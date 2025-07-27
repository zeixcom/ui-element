import {
	type Component,
	type Computed,
	batch,
	component,
	effect,
	fromSelector,
	on,
	setAttribute,
	setProperty,
	setText,
	show,
	state,
} from '../../..'
import { createClearFunction } from '../../functions/shared/clear-input'

export type FormComboboxProps = {
	value: string
	length: number
	error: string
	description: string
	clear(): void
}

type FormComboboxMode = 'idle' | 'editing' | 'selected'

export default component<FormComboboxProps>(
	'form-combobox',
	{
		value: '',
		length: 0,
		error: '',
		description: '',
		clear() {},
	},
	(el, { first, all, useElement }) => {
		const input = useElement('input', 'Native input element needed.')

		// Internal signals
		const mode = state<FormComboboxMode>('idle')
		const focusIndex = state(-1)
		const filterText = state('')
		const showPopup = state(false)
		const options = fromSelector<HTMLLIElement>(
			'[role="option"]:not([hidden])',
		)(el) as Computed<HTMLLIElement[]>
		const isExpanded = () => mode.get() === 'editing' && showPopup.get()

		// Internal function
		const commit = (value: string) => {
			input.value = value
			// Clear any custom validity messages
			input.setCustomValidity('')
			// Force validation state update
			input.checkValidity()

			batch(() => {
				// Set mode to selected when input is changed
				mode.set('selected')
				el.value = value
				el.length = value.length
				el.error = input.validationMessage ?? ''
				filterText.set(value.toLowerCase())
				focusIndex.set(-1)
				showPopup.set((input.required && !input.value) || false)
			})
		}

		// Add clear method to component
		el.clear = createClearFunction(input)

		return [
			// Effects and event listeners on component
			setAttribute('value'),
			() =>
				effect(() => {
					const m = mode.get()
					const i = focusIndex.get()
					if (m === 'idle') return
					else if (m === 'editing' && i >= 0)
						options.get().at(i)?.focus()
					else input.focus()
				}),
			on('keydown', ({ event }) => {
				const { key, altKey } = event
				if (['ArrowDown', 'ArrowUp'].includes(key)) {
					event.preventDefault()
					event.stopPropagation()
					// Set mode to editing when navigating options
					mode.set('editing')
					if (altKey) showPopup.set(key === 'ArrowDown')
					else
						focusIndex.update(v =>
							key === 'ArrowDown'
								? Math.min(v + 1, options.get().length - 1)
								: Math.max(v - 1, -1),
						)
				}
			}),
			on('keyup', ({ event }) => {
				const { key } = event
				if (key === 'Delete') {
					event.preventDefault()
					event.stopPropagation()
					commit('')
				}
			}),
			on('focusout', () => {
				requestAnimationFrame(() => {
					// Set mode to idle when no element in our component has focus
					if (!el.contains(document.activeElement)) mode.set('idle')
				})
			}),

			// Effects on error and description
			first('.error', setText('error')),
			first('.description', setText('description')),

			// Effects and event listeners on input
			first('input', [
				setProperty('ariaInvalid', () => String(!!el.error)),
				setAttribute('aria-errormessage', () =>
					el.error && el.querySelector('.error')?.id
						? el.querySelector('.error')?.id
						: null,
				),
				setAttribute('aria-describedby', () =>
					el.description && el.querySelector('.description')?.id
						? el.querySelector('.description')?.id
						: null,
				),
				setProperty('ariaExpanded', () => String(isExpanded())),
				on('change', () => {
					input.checkValidity()
					batch(() => {
						el.value = input.value
						el.error = input.validationMessage ?? ''
					})
				}),
				on('input', () => {
					batch(() => {
						// Set mode to editing when typing
						mode.set('editing')
						showPopup.set(true)
						filterText.set(input.value.trim().toLowerCase())
						el.length = input.value.length
					})
				}),
			]),

			// Effects and event listeners on clear button
			first('.clear', [
				show(() => !!el.length),
				on('click', () => {
					el.clear()
				}),
			]),

			// Effect on listbox
			first('[role="listbox"]', [
				show(isExpanded),
				on('keyup', ({ event }) => {
					const { key } = event
					if (key === 'Enter') {
						commit(
							options
								.get()
								.at(focusIndex.get())
								?.textContent?.trim() || '',
						)
					} else if (key === 'Escape') {
						commit(el.value)
					} else {
						const lowKey = key.toLowerCase()
						const nextIndex = options
							.get()
							.findIndex(option =>
								(
									option.textContent?.trim().toLowerCase() ||
									''
								).startsWith(lowKey),
							)
						if (nextIndex !== -1) focusIndex.set(nextIndex)
					}
				}),
			]),

			// Effects and event listeners on options
			all('[role="option"]', [
				setProperty('ariaSelected', target =>
					String(
						target.textContent?.trim().toLowerCase() ===
							el.value.toLowerCase(),
					),
				),
				show(target =>
					target.textContent
						?.trim()
						.toLowerCase()
						.includes(filterText.get()),
				),
				on('click', ({ target }) => {
					commit(target.textContent?.trim() || '')
				}),
			]),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'form-combobox': Component<FormComboboxProps>
	}
}
