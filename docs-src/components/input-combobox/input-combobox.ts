import {
	type Component,
	asString,
	batch,
	component,
	effect,
	on,
	RESET,
	selection,
	setAttribute,
	setProperty,
	setText,
	state,
	UNSET,
} from '../../..'

export type InputComboboxProps = {
	value: string
	length: number
	error: string
	description: string
}

type ComboboxMode = 'idle' | 'editing' | 'selected'

export default component(
	'input-combobox',
	{
		value: asString(),
		length: 0,
		error: '',
		description: RESET,
	},
	(el, { first, all }) => {
		const input = el.querySelector('input')
		if (!input) throw new Error('Input element not found')
		const errorId = el.querySelector('.error')?.id
		const descriptionId = el.querySelector('.description')?.id

		// Internal signals
		const mode = state<ComboboxMode>('idle')
		const focusIndex = state(-1)
		const filterText = state('')
		const showPopup = state(false)
		const options = selection<HTMLLIElement>(
			el,
			'[role="option"]:not([hidden])',
		)
		const isExpanded = () => mode.get() === 'editing' && showPopup.get()

		// Internal function
		const commit = (value: string) => {
			input.value = value
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
			on('keydown', (e: KeyboardEvent) => {
				if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
					e.preventDefault()
					e.stopPropagation()
					// Set mode to editing when navigating options
					mode.set('editing')
					if (e.altKey) showPopup.set(e.key === 'ArrowDown')
					else
						focusIndex.update(v =>
							e.key === 'ArrowDown'
								? Math.min(v + 1, options.get().length - 1)
								: Math.max(v - 1, -1),
						)
				}
			}),
			on('keyup', (e: KeyboardEvent) => {
				if (e.key === 'Delete') {
					e.preventDefault()
					e.stopPropagation()
					commit('')
				}
			}),
			on('focusout', () =>
				requestAnimationFrame(() => {
					// Set mode to idle when no element in our component has focus
					if (!el.contains(document.activeElement)) mode.set('idle')
				}),
			),

			// Effect on description - has to come first so we can set the el.description using RESET
			first('.description', setText('description')),

			// Effects and event listeners on input
			first(
				'input',
				setProperty('value'),
				setProperty('ariaExpanded', () => String(isExpanded())),
				setProperty('ariaInvalid', () => (el.error ? 'true' : 'false')),
				setAttribute('aria-errormessage', () =>
					el.error && errorId ? errorId : UNSET,
				),
				setAttribute('aria-describedby', () =>
					el.description && descriptionId ? descriptionId : UNSET,
				),
				on('input', () =>
					batch(() => {
						// Set mode to editing when typing
						mode.set('editing')
						showPopup.set(true)
						filterText.set(input.value.trim().toLowerCase())
						el.length = input.value.length
					}),
				),
				on('change', () =>
					batch(() => {
						el.value = input.value
						el.error = input.validationMessage ?? ''
					}),
				),
			),

			// Effects and event listeners on clear button
			first<HTMLButtonElement>(
				'.clear',
				setProperty('hidden', () => !el.length),
				on('click', () => commit('')),
			),

			// Effect on listbox
			first(
				'[role="listbox"]',
				setProperty('hidden', () => !isExpanded()),
				on('keyup', (e: KeyboardEvent) => {
					if (e.key === 'Enter') {
						commit(
							options
								.get()
								.at(focusIndex.get())
								?.textContent?.trim() || '',
						)
					} else if (e.key === 'Escape') {
						commit(el.value)
					} else {
						const key = e.key.toLowerCase()
						const nextIndex = options
							.get()
							.findIndex(option =>
								(
									option.textContent?.trim().toLowerCase()
									|| ''
								).startsWith(key),
							)
						if (nextIndex !== -1) focusIndex.set(nextIndex)
					}
				}),
			),

			// Effects and event listeners on options
			all<HTMLLIElement>(
				'[role="option"]',
				setProperty('ariaSelected', target =>
					String(
						target.textContent?.trim().toLowerCase()
							=== el.value.toLowerCase(),
					),
				),
				setProperty(
					'hidden',
					target =>
						!target.textContent
							?.trim()
							.toLowerCase()
							.includes(filterText.get()),
				),
				on('click', e => {
					commit(
						(e.target as HTMLLIElement).textContent?.trim() || '',
					)
				}),
			),

			// Effect on error message
			first('.error', setText('error')),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'input-combobox': Component<InputComboboxProps>
	}
}
