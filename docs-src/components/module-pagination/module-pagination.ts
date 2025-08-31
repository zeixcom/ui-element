import {
	asInteger,
	type Component,
	component,
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
		value: asInteger(1),
		max: asInteger(1),
	},
	(el, { first }) => [
		show(() => el.max > 1),
		setAttribute('value', () => String(el.value)),
		setAttribute('max', () => String(el.max)),
		first('.value', setText(() => String(el.value))),
		first('.max', setText(() => String(el.max))),
		on('keyup', ({ event }) => {
			if ((event.target as HTMLElement)?.localName === 'input') return
			const key = event.key
			if (key === 'ArrowLeft' && el.value > 1) el.value--
			else if (key === 'ArrowRight' && el.value < el.max) el.value++
		}),
		first(
			'input',
			[
				on('change', ({ target }) => {
					el.value = Math.max(1, Math.min(target.valueAsNumber, el.max))
				}),
				setProperty('value', () => String(el.value)),
				setProperty('max', () => String(el.max)),
			],
			'Add an <input[type="number"]> to enter the page number to go to.'
		),
		first(
			'button.prev',
			[
				on('click', () => {
					el.value--
				}),
				setProperty('disabled', () => el.value <= 1),
			],
			'Add a <button.prev> to go to previous page.',
		),
		first(
			'button.next',
			[
				on('click', () => {
					el.value++
				}),
				setProperty('disabled', () => el.value >= el.max),
			],
			'Add a <button.next> to go to next page.',
		),
	],
)

declare global {
	interface HTMLElementTagNameMap {
		'module-pagination': Component<ModulePaginationProps>
	}
}
