import { setProperty, UIElement } from "../../../";
import { InputButton } from "../input-button/input-button";

export class RatingFeedback extends UIElement<{
	rating: number,
	empty: boolean,
	submitted: boolean
}> {
	static localName = 'rating-feedback'

	states = {
		rating: 0,
		empty: true,
        submitted: false,
    }

	connectedCallback() {
		super.connectedCallback()

		// Event listeners for rating changes and form submission
		this.self
			.on('change-rating', (e: Event) => {
				this.set('rating', (e as CustomEvent<number>).detail)
			})
			.on('submit', (e: Event) => {
				e.preventDefault()
				this.set('submitted', true)
				console.log('Feedback submitted')
			})

		// Event listener for hide button
		this.first('.hide').on('click', () => {
			const feedback = this.querySelector<HTMLElement>('.feedback')
			if (feedback) feedback.hidden = true
		})

		// Event listener for texteare
		this.first('textarea').on('input', (e: Event) => {
			this.set('empty', (e.target as HTMLTextAreaElement)?.value.trim() === '')
		})

		// Effects on rating changes
		this.first('.feedback')
			.sync(setProperty('hidden', () => this.get('submitted') || !(stars?.get('value') ?? 0)))
		this.all('.feedback p')
			.sync(setProperty('hidden', (_, index) => stars?.get('value') !== index + 1))

		// Effect on empty state
		this.first<InputButton>('input-button').pass({
			disabled: 'empty'
		})
	}
}
RatingFeedback.define()