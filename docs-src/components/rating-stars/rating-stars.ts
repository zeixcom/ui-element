import { all, asInteger, component, emit, on, setProperty, setText } from '../../../'

export type RatingStarsProps = {
	value: number
}

const RatingStars = component('rating-stars',{
	value: asInteger(),
}, el => [
	all<HTMLInputElement, RatingStarsProps>('input',
		setProperty('checked',
			(_, index) => el.value === index + 1,
		),
		on('change', (_, index) => (e: Event) => {
			e.stopPropagation()
			el.value = index + 1
			emit('change-rating', index + 1)(el)
		})
	),
	all('.label',
		setText((_, index) => index < el.value ? '★' : '☆')
	)
])

declare global {
	interface HTMLElementTagNameMap {
		'rating-stars': typeof RatingStars
	}
}

export default RatingStars