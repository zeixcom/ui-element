import {
	asInteger,
	type Component,
	component,
	computed,
	fromDOM,
	fromEvents,
	getProperty,
	setAttribute,
	setProperty,
	setStyle,
	setText,
} from '../../..'

export type FormGaugeProps = {
	readonly value: number
}

export type FormGaugeThreshold = {
	min: number
	label: string
	color: string
}

export default component(
	'form-gauge',
	{
		value: fromEvents<number>(
			'button',
			{
				click: ({ target, value }) =>
					value + (target.classList.contains('decrement') ? -1 : 1),
				keydown: ({ event, value }) => {
					const { key } = event as KeyboardEvent
					if (['ArrowUp', 'ArrowDown', '-', '+'].includes(key)) {
						event.stopPropagation()
						event.preventDefault()
						return (
							value +
							(key === 'ArrowDown' || key === '-' ? -1 : 1)
						)
					}
				},
			},
			fromDOM({ progress: getProperty('value') }, asInteger()),
		),
	},
	(el, { first }) => {
		const max = el.querySelector('progress')?.max ?? 100
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
				thresholds.find(
					threshold => el.getSignal('value').get() >= threshold.min,
				) || {
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
			first(
				'small',
				setText(() => qualification.get().label),
			),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'form-gauge': Component<FormGaugeProps>
	}
}
