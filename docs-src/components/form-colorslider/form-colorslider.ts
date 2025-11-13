import { formatCss, inGamut, type Oklch } from 'culori/fn'
import {
	asEnum,
	batch,
	type Component,
	component,
	computed,
	effect,
	emitEvent,
	on,
	setAttribute,
	setProperty,
	setStyle,
	state,
} from '../../..'
import { asOklch, CONTRAST_THRESHOLD } from '../_shared/color'
import { rafThrottle } from '../_shared/rafThrottle'

export type FormColorsliderProps = {
	color: Oklch
	value: number
	stepDown: (stepDecrement?: number) => void
	stepUp: (stepIncrement?: number) => void
}

const inP3Gamut = inGamut('p3')
const inRGBGamut = inGamut('rgb')
const TRACK_OFFSET = 20 // pixels

export default component<FormColorsliderProps>(
	'form-colorslider',
	{
		color: asOklch(),
		value: 0,
		stepDown: () => {},
		stepUp: () => {},
	},
	(el, { first, useElement }) => {
		// Required elements
		const input = useElement(
			'input',
			'Add an <input> element to control the color slider.',
		)
		const slider = useElement(
			'.slider',
			'Add a <.slider> element as a container for track and thumb.',
		)
		const track = useElement(
			'canvas',
			'Add a <canvas> element to display the color slider track.',
		)

		// Initialize
		const axis = asEnum(['l', 'c', 'h'])(el, el.getAttribute('axis'))
		const max = axis === 'h' ? 360 : axis === 'c' ? 0.4 : 1
		const step = axis === 'h' ? 1 : axis === 'c' ? 0.001 : 0.0025
		const bigStep = axis === 'h' ? 15 : axis === 'c' ? 0.02 : 0.05
		el.value = el.color[axis]
		input.min = '0'
		input.max = String(axis === 'l' ? max * 100 : max)
		slider.setAttribute('aria-valuemin', '0')
		slider.setAttribute('aria-valuemax', String(max))

		// Step methods
		const setToNearestStep = (value: number) => {
			const nearest = Math.round(value / step) * step
			if (nearest >= 0 && nearest <= max) {
				batch(() => {
					el.color = { ...el.color, [axis]: nearest }
					el.value = nearest
				})
				emitEvent('color-change', 'color')
			}
		}
		el.stepDown = (stepDecrement?: number) => {
			setToNearestStep(el.value - (stepDecrement ?? step))
		}
		el.stepUp = (stepIncrement?: number) => {
			setToNearestStep(el.value + (stepIncrement ?? step))
		}

		// Internal states
		const trackWidth = state(
			slider.getBoundingClientRect().width - 2 * TRACK_OFFSET,
		)
		const lightness = computed(() => el.color.l)

		// Helper functions
		const formatNumber = (value: number) => {
			const v = axis === 'l' ? value * 100 : value
			return v.toFixed(
				Math.min(String(v).split('.')[1]?.length || 0, axis === 'c' ? 4 : 2),
			)
		}
		const commit = (color: Oklch) => {
			batch(() => {
				el.color = color
				el.value = color[axis]
			})
			emitEvent('color-change', 'color')
		}
		const moveThumb = rafThrottle((clientX, left, width) => {
			const x = width ? (clientX - left) / width : 0
			const color = {
				...el.color,
				[axis]: Math.min(Math.max(x, 0), 1) * max,
			}
			if (inP3Gamut(color)) commit(color)
		})
		const getColorFromPosition = (x: number) => {
			const newColor = {
				...el.color,
				[axis]: x * max,
			}
			if (inRGBGamut(newColor)) return newColor
			if (inP3Gamut(newColor)) newColor.alpha = 0.5
			else newColor.alpha = 0
			return newColor
		}

		// Effects
		return [
			first('input', [
				setProperty('value', () => formatNumber(el.value)),
				on('change', ({ target }) => {
					const value = target.valueAsNumber
					const newColor = {
						...el.color,
						[axis]: axis === 'l' ? value / 100 : value,
					}
					if (inP3Gamut(newColor)) commit(newColor)
				}),
			]),
			first('.slider', [
				on('pointerdown', ({ event }) => {
					const left = track.getBoundingClientRect().left
					const width = trackWidth.get()
					slider.setPointerCapture(event.pointerId)
					const handleMove = (e: PointerEvent) => {
						const last = (e.getCoalescedEvents?.() || []).pop() || e
						moveThumb(last.clientX, left, width)
					}
					const handleUp = () => {
						slider.removeEventListener('pointermove', handleMove)
						slider.removeEventListener('pointerup', handleUp)
						moveThumb.cancel()
					}
					slider.addEventListener('pointermove', handleMove, {
						passive: true,
					})
					slider.addEventListener('pointerup', handleUp)
				}),
				setStyle('--color-base', () => formatCss(el.color)),
				setStyle('--track-width', () => trackWidth.get() + 'px'),
				setAttribute('aria-valuenow', 'value'),
				setAttribute('aria-valuetext', () => {
					const v = formatNumber(el.value)
					return axis === 'l' ? v + '%' : axis === 'h' ? v + '°' : v
				}),
				() => {
					const setTrackWidthRaf = rafThrottle(w => {
						trackWidth.set(w)
					})
					const resizeObserver = new ResizeObserver(() => {
						setTrackWidthRaf(track.clientWidth)
					})
					resizeObserver.observe(track)
					return () => {
						resizeObserver.disconnect()
						setTrackWidthRaf.cancel()
					}
				},
			]),
			first('canvas', [
				setAttribute('width', () => String(trackWidth.get())),
				() =>
					effect((): undefined => {
						const ctx = track.getContext('2d', {
							colorSpace: 'display-p3',
						})
						if (!ctx) return
						ctx.clearRect(0, 0, 360, 1)
						const n = Math.round(trackWidth.get())
						for (let x = 0; x < n; x++) {
							ctx.fillStyle = formatCss(getColorFromPosition(x / n))
							ctx.fillRect(x, 0, 1, 1)
						}
					}),
			]),
			first(
				'.thumb',
				[
					setStyle(
						'left',
						() =>
							`${Math.round((el.value * trackWidth.get()) / max) + TRACK_OFFSET}px`,
					),
					setStyle('--color-border', () =>
						lightness.get() > CONTRAST_THRESHOLD ? 'black' : 'white',
					),
				],
				'Add a <.thumb> element as a drag knob to control the color.',
			),
			first(
				'button.decrement',
				[
					on('click', ({ event }) => {
						el.stepDown(event.shiftKey ? bigStep : step)
					}),
					setProperty('disabled', () => el.value <= 0),
				],
				'Add a <button.decrement> to decrement a value for a color channel.',
			),
			first(
				'button.increment',
				[
					on('click', ({ event }) => {
						el.stepUp(event.shiftKey ? bigStep : step)
					}),
					setProperty('disabled', () => el.value >= max),
				],
				'Add a <button.increment> to increment a value for a color channel.',
			),
			on('keyup', ({ event }) => {
				if ((event.target as HTMLElement)?.localName === 'input') return
				const { key, shiftKey } = event
				if ((key === 'ArrowLeft' || key === '-') && el.value > 0)
					el.stepDown(shiftKey ? bigStep : step)
				else if ((key === 'ArrowRight' || key === '+') && el.value < max)
					el.stepUp(shiftKey ? bigStep : step)
			}),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'form-colorslider': Component<FormColorsliderProps>
	}
	interface HTMLElementEventMap {
		'color-change': CustomEvent<Oklch>
	}
}
