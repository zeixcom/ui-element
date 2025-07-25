import {
	type Component,
	component,
	on,
	setProperty,
	show,
	state,
} from '../../../'
import '../basic-button/basic-button'
import type { RatingStarsProps } from '../rating-stars/rating-stars'

export default component('rating-feedback', {}, (el, { all, first }) => {
	const rating = state(0)
	const empty = state(true)
	const submitted = state(false)
	const stars = el.querySelector<Component<RatingStarsProps>>('rating-stars')
	if (!stars) throw new Error('No rating-stars component found')

	return [
		// Event listeners for rating changes and form submission
		on('change-rating', ({ event }) => {
			rating.set(event.detail)
		}),
		on('submit', ({ event }) => {
			event.preventDefault()
			submitted.set(true)
			console.log('Feedback submitted')
		}),

		// Event listener for hide button
		first(
			'.hide',
			on('click', () => {
				const feedback = el.querySelector<HTMLElement>('.feedback')
				if (feedback) feedback.hidden = true
			}),
		),

		// Event listener for textarea
		first(
			'textarea',
			on('input', e => {
				empty.set(
					(e.target as HTMLTextAreaElement)?.value.trim() === '',
				)
			}),
		),

		// Effects on rating changes
		first(
			'.feedback',
			show(() => !submitted.get() && !!rating.get()),
		),
		all(
			'.feedback p',
			show(
				target =>
					rating.get() === parseInt(target.dataset['key'] || '0'),
			),
		),

		// Effect on empty state
		first('basic-button', setProperty('disabled', empty)),
	]
})
