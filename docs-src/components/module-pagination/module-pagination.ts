import {
	asInteger,
	type Component,
	component,
	fromDOM,
	getProperty,
	on,
	setAttribute,
	setProperty,
	setText,
	show,
} from '../../..'

export type ModulePaginationProps = {
	value: number
	max: number
}

export default component(
	'module-pagination',
	{
		value: asInteger(fromDOM({ input: getProperty('value') }, 1)),
		max: asInteger(fromDOM({ input: getProperty('max') }, 1)),
	},
	(el, { first }) => [
		// Reflect attributes of module-pagination component
		show(() => el.max > 1),
		setAttribute('value', () => String(el.value)),
		setAttribute('max', () => String(el.max)),

		// Text content	for current and max page numbers
		first('.value', [setText(() => String(el.value))]),
		first('.max', [setText(() => String(el.max))]),

		// Event handler on input and its value and max properties
		first(
			'input',
			[
				on('change', ({ target }) => {
					el.value = Math.max(
						1,
						Math.min(target.valueAsNumber, el.max),
					)
				}),
				setProperty('value', () => String(el.value)),
				setProperty('max', () => String(el.max)),
			],
			'Add an <input[type="number"]> to enter the page number to go to.',
		),

		// Event handlers on buttons and their disabled state
		first(
			'button.prev',
			[
				on('click', () => {
					el.value--
				}),
				setProperty('disabled', () => el.value <= 1),
			],
			'Add a <button.prev> to go to the previous page.',
		),
		first(
			'button.next',
			[
				on('click', () => {
					el.value++
				}),
				setProperty('disabled', () => el.value >= el.max),
			],
			'Add a <button.next> to go to the next page.',
		),
		on('keyup', ({ event }) => {
			if ((event.target as HTMLElement)?.localName === 'input') return
			const key = event.key
			if ((key === 'ArrowLeft' || key === '-') && el.value > 1) el.value--
			else if ((key === 'ArrowRight' || key === '+') && el.value < el.max)
				el.value++
		}),
	],
)

declare global {
	interface HTMLElementTagNameMap {
		'module-pagination': Component<ModulePaginationProps>
	}
}
