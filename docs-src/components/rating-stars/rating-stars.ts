import {
	type Component,
	asInteger,
	component,
	emitEvent,
	on,
	setProperty,
	setText,
} from '../../../'

export type RatingStarsProps = {
	value: number
}

export default component(
	'rating-stars',
	{
		value: asInteger(),
	},
	(el, { all }) => {
		const getKey = (element: HTMLElement): number =>
			parseInt(element.dataset['key'] || '0')

		return [
			emitEvent('change-rating', 'value'),
			all(
				'input',
				setProperty('checked', target => el.value === getKey(target)),
				on('change', e => {
					e.stopPropagation()
					const value = parseInt((e.currentTarget as HTMLInputElement)?.value)
					el.value = value + 1
				}),
			),
			all(
				'.label',
				setText(target => (getKey(target) <= el.value ? '★' : '☆')),
			),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'rating-stars': Component<RatingStarsProps>
	}
	interface HTMLElementEventMap {
		'change-rating': CustomEvent<number>
	}
}
