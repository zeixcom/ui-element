import { component, on, pass, setProperty } from '../../../'
import type { InputButtonProps } from '../input-button/input-button'

export type RatingFeedbackProps = {
	rating: number
	empty: boolean
	submitted: boolean
}

const RatingFeedback = component('rating-feedback', {
	rating: 0,
	empty: true,
	submitted: false,
}, el => {

	// Event listeners for rating changes and form submission
	el.self(
		on('change-rating', (e: Event) => {
			el.rating = (e as CustomEvent<number>).detail
		}),
		on('submit', (e: Event) => {
			e.preventDefault()
			el.submitted = true
			console.log('Feedback submitted')
		})
	)

	// Event listener for hide button
	el.first('.hide', on('click', () => {
		const feedback = el.querySelector<HTMLElement>('.feedback')
		if (feedback) feedback.hidden = true
	}))

	// Event listener for texteare
	el.first('textarea', on('input', (e: Event) => {
		el.empty = (e.target as HTMLTextAreaElement)?.value.trim() === ''
	}))

	// Effects on rating changes
	const stars = el.querySelector('rating-stars')
	el.first<HTMLElement>('.feedback', setProperty('hidden', () => el.submitted || !stars?.value))
	el.all<HTMLElement>('.feedback p', setProperty('hidden', (_, index) => stars?.value !== index + 1))

	// Effect on empty state
	el.first('input-button', pass<RatingFeedbackProps, InputButtonProps>({
		disabled: 'empty'
	}))
})

declare global {
	interface HTMLElementTagNameMap {
		'rating-feedback': typeof RatingFeedback
	}
}

export default RatingFeedback