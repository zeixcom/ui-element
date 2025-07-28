import { component, on, setProperty, show, state } from '../../../'

import '../rating-stars/rating-stars'

export default component(
	'rating-feedback',
	{},
	(_, { all, first, useElement }) => {
		const rating = state(0)
		const empty = state(true)
		const submitted = state(false)
		const feedback = useElement('.feedback')
		useElement('rating-stars', 'Needed for  stars rating.')

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
			first('.hide', [
				on('click', () => {
					if (feedback) feedback.hidden = true
				}),
			]),

			// Event listener for textarea
			first('textarea', [
				on('input', ({ target }) => {
					empty.set(target.value.trim() === '')
				}),
			]),

			// Effects on rating changes
			first('.feedback', [
				show(() => !submitted.get() && !!rating.get()),
			]),
			all('.feedback p', [
				show(
					target =>
						rating.get() === parseInt(target.dataset['key'] || '0'),
				),
			]),

			// Effect on empty state
			first('basic-button', [setProperty('disabled', empty)]),
		]
	},
)
