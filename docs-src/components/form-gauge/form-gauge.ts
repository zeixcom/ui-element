import {
	asInteger,
	type Component,
	component,
	computed,
	fromDOM,
	getProperty,
	on,
	setAttribute,
	setProperty,
	setStyle,
	setText,
} from '../../..'

export type FormGaugeProps = {
	value: number
}

export type FormGaugeThreshold = {
	min: number
	label: string
	color: string
}

export default component(
	'form-gauge',
	{ value: asInteger(fromDOM({ progress: getProperty('value') }, 0)) },
	(el, { first, useElement }) => {
		const max =
			useElement('progress', 'Add a native <progress> element.').max ??
			100
		const thresholds: FormGaugeThreshold[] = (() => {
			const attr = el.getAttribute('thresholds')
			if (!attr) return []
			try {
				return JSON.parse(attr)
			} catch {
				return []
			}
		})()
		const qualification = computed(
			() =>
				thresholds.find(threshold => el.value >= threshold.min) || {
					label: '',
					color: 'var(--color-primary)',
				},
		)

		return [
			// Bind progress value to value state
			first('progress', setProperty('value')),
			first('.value span', setText('value')),

			// Set form-gauge styles based on progress and qualification
			setAttribute('value'),
			setStyle(
				'--form-gauge-degree',
				() => `${(240 * el.value) / max}deg`,
			),
			setStyle('--form-gauge-color', () => qualification.get().color),
			first('small', [setText(() => qualification.get().label)]),

			// Event handlers on buttons and their disabled state
			first('button.increment', [
				setProperty('disabled', () => el.value >= max),
				on('click', ({ event }) => {
					el.value += event.shiftKey ? 10 : 1
				}),
			]),
			first('button.decrement', [
				setProperty('disabled', () => el.value <= 0),
				on('click', ({ event }) => {
					el.value -= event.shiftKey ? 10 : 1
				}),
			]),
			on('keydown', ({ event }) => {
				const { key, shiftKey } = event
				if ((key === 'ArrowLeft' || key === '-') && el.value > 0)
					el.value -= shiftKey ? 10 : 1
				else if (
					(key === 'ArrowRight' || key === '+') &&
					el.value < max
				)
					el.value += shiftKey ? 10 : 1
			}),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'form-gauge': Component<FormGaugeProps>
	}
}
