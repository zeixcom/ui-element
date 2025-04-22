import { all, component, first, on, setProperty, state } from '../../../'
import RatingStars from '../rating-stars/rating-stars'

const RatingFeedback = component('rating-feedback', {}, el => {
	const rating = state(0)
	const empty = state(true)
	const submitted = state(false)
	const stars = el.querySelector<typeof RatingStars>('rating-stars')
	if (!stars)
		throw new Error('No rating-stars component found')
	return [

	// Event listeners for rating changes and form submission
	on('change-rating', (e: Event) => {
		rating.set((e as CustomEvent<number>).detail)
	}),
	on('submit', (e: Event) => {
		e.preventDefault()
		submitted.set(true)
		console.log('Feedback submitted')
	}),

	// Event listener for hide button
	first('.hide', on('click', () => {
		const feedback = el.querySelector<HTMLElement>('.feedback')
		if (feedback) feedback.hidden = true
	})),

	// Event listener for textarea
	first('textarea', on('input', (e: Event) => {
		empty.set((e.target as HTMLTextAreaElement)?.value.trim() === '')
	})),

	// Effects on rating changes
	first('.feedback',
		setProperty('hidden', () => submitted.get() || !rating.get())
	),
	all('.feedback p',
		setProperty('hidden', (_, index) => rating.get() !== index + 1)
	),

	// Effect on empty state
	first('input-button',
		setProperty('disabled', empty)
	)
]
})

declare global {
	interface HTMLElementTagNameMap {
		'rating-feedback': typeof RatingFeedback
	}
}

export default RatingFeedback