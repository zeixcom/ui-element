import {
	type Component, type ComponentProps,
	all, component, first, on, setProperty, state
} from '../../../'
import { InputButtonProps } from '../input-button/input-button'
import { RatingStarsProps } from '../rating-stars/rating-stars'

export default component('rating-feedback', {}, el => {
	const rating = state(0)
	const empty = state(true)
	const submitted = state(false)
	const stars = el.querySelector<Component<RatingStarsProps>>('rating-stars')
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
	first<ComponentProps, HTMLElement>('.feedback',
		setProperty('hidden', () => submitted.get() || !rating.get())
	),
	all<ComponentProps, HTMLElement>('.feedback p',
		setProperty('hidden', (_, index) => rating.get() !== index + 1)
	),

	// Effect on empty state
	first<ComponentProps, Component<InputButtonProps>>('input-button',
		setProperty('disabled', empty)
	)
]
})
