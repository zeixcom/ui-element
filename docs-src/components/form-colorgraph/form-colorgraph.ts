import { formatCss, inGamut, type Oklch } from 'culori/fn'
import {
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
import { asOklch } from '../../functions/parser/as-oklch'
import { getStepColor } from '../../functions/shared/get-step-color'
import { rafThrottle } from '../../functions/shared/raf-throttle'

export type FormColorgraphAxis = 'l' | 'c' | 'h'

export type FormColorgraphProps = {
	color: Oklch
	lightness: number
	chroma: number
	hue: number
	stepDown: (axis: FormColorgraphAxis, stepDecrement?: number) => void
	stepUp: (axis: FormColorgraphAxis, stepIncrement?: number) => void
}

const inP3Gamut = inGamut('p3')
const inRGBGamut = inGamut('rgb')
const TRACK_OFFSET = 20 // pixels
const CONTRAST_THRESHOLD = 0.71 // lightness

export default component<FormColorgraphProps>(
	'form-colorgraph',
	{
		color: asOklch(),
		lightness: (el: HTMLElement & { color: Oklch }) => () => el.color.l,
		chroma: (el: HTMLElement & { color: Oklch }) => () => el.color.c,
		hue: (el: HTMLElement & { color: Oklch }) => () => el.color.h ?? 0,
		stepDown: () => {},
		stepUp: () => {},
	},
	(el, { all, first, useElement }) => {
		// Required elements
		const lInput = useElement(
			'input[name="lightness"]',
			'Add an <input[name="lightness"]> element to control the lightness of the color.',
		)
		const cInput = useElement(
			'input[name="chroma"]',
			'Add an <input[name="chroma"]> element to control the chroma of the color.',
		)
		const hInput = useElement(
			'input[name="hue"]',
			'Add an <input[name="hue"]> element to control the hue of the color.',
		)
		const graph = useElement(
			'.graph',
			'Add a <.graph> element as a container for the color graph.',
		)
		const canvas = useElement<HTMLCanvasElement>(
			'.graph canvas',
			'Add a <canvas> element inside the graph to display the lightness/chroma graph.',
		)
		const slider = useElement(
			'.slider',
			'Add a <.slider> element as a container for track and thumb.',
		)
		const track = useElement<HTMLCanvasElement>(
			'.slider canvas',
			'Add a <canvas> element inside the slider to display the hue slider track.',
		)

		// Initialize
		const max = { l: 1, c: 0.4, h: 360 }
		const step = { l: 0.0025, c: 0.001, h: 1 }
		const bigStep = { l: 0.05, c: 0.02, h: 15 }
		lInput.min = '0'
		lInput.max = '100'
		cInput.min = '0'
		cInput.max = '0.4'
		hInput.min = '0'
		hInput.max = '360'
		slider.setAttribute('aria-valuemin', '0')
		slider.setAttribute('aria-valuemax', '360')

		// Step methods
		const getValue = (axis: FormColorgraphAxis) => {
			return axis === 'l'
				? el.lightness
				: axis === 'c'
					? el.chroma
					: el.hue
		}
		const setToNearestStep = (axis: FormColorgraphAxis, value: number) => {
			const nearest = Math.round(value / step[axis]) * step[axis]
			if (nearest >= 0 && nearest <= max[axis]) {
				el.color = { ...el.color, [axis]: nearest }
				emitEvent('color-change', 'color')
			}
		}
		el.stepDown = (axis: FormColorgraphAxis, stepDecrement?: number) => {
			setToNearestStep(
				axis,
				getValue(axis) - (stepDecrement ?? step[axis]),
			)
		}
		el.stepUp = (axis: FormColorgraphAxis, stepIncrement?: number) => {
			setToNearestStep(
				axis,
				getValue(axis) + (stepIncrement ?? step[axis]),
			)
		}

		// Internal states
		const canvasSize = state(graph.getBoundingClientRect().width)
		const trackWidth = computed(() => canvasSize.get() - 2 * TRACK_OFFSET)

		// Helper functions
		const formatNumber = (axis: FormColorgraphAxis, value: number) => {
			const v = axis === 'l' ? value * 100 : value
			return v.toFixed(
				Math.min(
					String(v).split('.')[1]?.length || 0,
					axis === 'c' ? 4 : 2,
				),
			)
		}
		const commit = (color: Oklch) => {
			el.color = color
			emitEvent('color-change', 'color')
		}
		const moveKnob = rafThrottle((clientX, clientY, top, left, size) => {
			const color = {
				...el.color,
				c: Math.min(Math.max((clientX - left) / size, 0), 1) * max.c,
				l:
					(1 - Math.min(Math.max((clientY - top) / size, 0), 1)) *
					max.l,
			}
			if (inP3Gamut(color)) commit(color)
		})
		const getColorFromPosition = (
			x: number,
			y: number,
			h: number,
		): Oklch | undefined => {
			const newColor: Oklch = {
				mode: 'oklch',
				l: (1 - y) * max.l,
				c: x * max.c,
				h: h,
			}
			if (inRGBGamut(newColor)) return newColor
			if (inP3Gamut(newColor)) newColor.alpha = 0.5
			else return
			return newColor
		}
		const setStepPosition = (target: HTMLLIElement, color: Oklch): void => {
			const size = canvasSize.get()
			const x = Math.round((color.c * size) / max.c)
			const y = Math.round(((1 - color.l) * size) / max.l)
			target.style.setProperty('background-color', formatCss(color))
			target.style.setProperty(
				'border-color',
				color.l > CONTRAST_THRESHOLD ? 'black' : 'white',
			)
			target.style.setProperty('left', `${x}px`)
			target.style.setProperty('top', `${y}px`)
		}
		const moveThumb = rafThrottle((clientX, left, width) => {
			const color = {
				...el.color,
				h: Math.min(Math.max((clientX - left) / width, 0), 1) * max.h,
			}
			if (inP3Gamut(color)) commit(color)
		})
		const getHueFromPosition = (x: number): Oklch => {
			const newColor = {
				...el.color,
				h: x * max.h,
			}
			if (inRGBGamut(newColor)) return newColor
			if (inP3Gamut(newColor)) newColor.alpha = 0.5
			else newColor.alpha = 0
			return newColor
		}
		const getAxis = (target: HTMLElement): FormColorgraphAxis | null => {
			if (target.closest('.lightness')) return 'l'
			if (target.closest('.chroma')) return 'c'
			if (target.closest('.hue')) return 'h'
			return null
		}

		// Effects
		const effects = [
			setStyle('--color-base', () => formatCss(el.color)),
			() => {
				const setCanvasSize = rafThrottle(w => {
					canvasSize.set(w)
				})
				const resizeObserver = new ResizeObserver(() => {
					setCanvasSize(graph.clientWidth)
				})
				resizeObserver.observe(graph)
				return () => {
					resizeObserver.disconnect()
					setCanvasSize.cancel()
				}
			},
			all('input', [
				setProperty('value', target => {
					const axis = getAxis(target)
					return axis ? formatNumber(axis, el.color[axis] ?? 0) : '0'
				}),
				on('change', ({ target }) => {
					const axis = getAxis(target)
					if (!axis) return
					const value = target.valueAsNumber
					const newColor = { ...el.color, [axis]: value }
					if (inP3Gamut(newColor)) commit(newColor)
				}),
			]),
			first('.graph', [
				on('pointerdown', ({ event }) => {
					const { top, left } = canvas.getBoundingClientRect()
					const size = canvasSize.get()
					graph.setPointerCapture(event.pointerId)
					const handleMove = (e: PointerEvent) => {
						const last = (e.getCoalescedEvents?.() || []).pop() || e
						moveKnob(last.clientX, last.clientY, top, left, size)
					}
					const handleUp = () => {
						graph.removeEventListener('pointermove', handleMove)
						graph.removeEventListener('pointerup', handleUp)
						moveThumb.cancel()
					}
					graph.addEventListener('pointermove', handleMove, {
						passive: true,
					})
					graph.addEventListener('pointerup', handleUp)
				}),
				setStyle('--canvas-size', () => canvasSize.get() + 'px'),
			]),
			first('.graph canvas', [
				setAttribute('width', () => String(canvasSize.get())),
				setAttribute('height', () => String(canvasSize.get())),
				() =>
					effect((): undefined => {
						const ctx = canvas.getContext('2d', {
							colorSpace: 'display-p3',
						})
						if (!ctx) return
						const h = el.hue
						const n = Math.round(canvasSize.get())
						ctx.clearRect(0, 0, n, n)
						for (let y = 0; y < n; y++) {
							for (let x = 0; x < n; x++) {
								const col = formatCss(
									getColorFromPosition(x / n, y / n, h),
								)
								if (col) {
									ctx.fillStyle = col
									ctx.fillRect(x, y, 1, 1)
								} else {
									x = n
								}
							}
						}
					}),
			]),
			first(
				'.knob',
				[
					setStyle(
						'top',
						() =>
							`${Math.round(((1 - el.lightness) * canvasSize.get()) / max.l)}px`,
					),
					setStyle(
						'left',
						() =>
							`${Math.round((el.chroma * canvasSize.get()) / max.c)}px`,
					),
					setStyle('--color-border', () =>
						el.lightness > CONTRAST_THRESHOLD ? 'black' : 'white',
					),
				],
				'Add a <.knob> element as a drag knob to control lightness and chroma.',
			),
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
				setStyle('--track-width', () => trackWidth.get() + 'px'),
				setAttribute('aria-valuenow', 'hue'),
				setAttribute(
					'aria-valuetext',
					() => formatNumber('h', el.hue) + '°',
				),
			]),
			first('.slider canvas', [
				setAttribute('width', () => String(trackWidth.get())),
				() =>
					effect((): undefined => {
						const ctx = track.getContext('2d', {
							colorSpace: 'display-p3',
						})
						if (!ctx) return
						const n = Math.round(trackWidth.get())
						ctx.clearRect(0, 0, n, 1)
						for (let x = 0; x < n; x++) {
							ctx.fillStyle = formatCss(getHueFromPosition(x / n))
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
							`${Math.round((el.hue * trackWidth.get()) / max.h) + TRACK_OFFSET}px`,
					),
					setStyle('--color-border', () =>
						el.lightness > CONTRAST_THRESHOLD ? 'black' : 'white',
					),
				],
				'Add a <.thumb> element as a drag knob to control the hue.',
			),
			all(
				'button.decrement',
				[
					on('click', ({ event, target }) => {
						const axis = getAxis(target)
						if (axis)
							el.stepDown(
								axis,
								event.shiftKey ? bigStep[axis] : step[axis],
							)
					}),
					setProperty('disabled', target => {
						const axis = getAxis(target)
						return !axis || (el.color[axis] ?? 0) <= 0
					}),
				],
				'Add a <button.decrement> to decrement a value for a color channel.',
			),
			all(
				'button.increment',
				[
					on('click', ({ event, target }) => {
						const axis = getAxis(target)
						if (axis)
							el.stepUp(
								axis,
								event.shiftKey ? bigStep[axis] : step[axis],
							)
					}),
					setProperty('disabled', target => {
						const axis = getAxis(target)
						return !axis || (el.color[axis] ?? 0) >= max[axis]
					}),
				],
				'Add a <button.increment> to increment a value for a color channel.',
			),
			on('keydown', ({ event }) => {
				const target = event.target as HTMLElement
				if (target?.localName === 'input') return
				const { key, shiftKey } = event
				if (
					key.substring(0, 5) === 'Arrow' ||
					['+', '-'].includes(key)
				) {
					event.preventDefault()
					event.stopImmediatePropagation()
					const axis = getAxis(target)
					if (axis) {
						if (key === 'ArrowLeft' || key === '-')
							el.stepDown(
								axis,
								shiftKey ? bigStep[axis] : step[axis],
							)
						else if (key === 'ArrowRight' || key === '+')
							el.stepUp(
								axis,
								shiftKey ? bigStep[axis] : step[axis],
							)
					} else {
						if (key === 'ArrowDown')
							el.stepDown(
								'l',
								shiftKey ? bigStep['l'] : step['l'],
							)
						else if (key === 'ArrowUp')
							el.stepUp('l', shiftKey ? bigStep['l'] : step['l'])
						else if (key === 'ArrowLeft')
							el.stepDown(
								'c',
								shiftKey ? bigStep['c'] : step['c'],
							)
						else if (key === 'ArrowRight')
							el.stepUp('c', shiftKey ? bigStep['c'] : step['c'])
						else if (key === '-')
							el.stepDown(
								'h',
								shiftKey ? bigStep['h'] : step['h'],
							)
						else if (key === '+')
							el.stepUp('h', shiftKey ? bigStep['h'] : step['h'])
					}
				}
			}),
		]
		for (let i = 1; i < 5; i++)
			effects.push(
				first(`li.lighten${(5 - i) * 20}`, [
					(_, target) =>
						effect((): undefined => {
							setStepPosition(
								target,
								getStepColor(el.color, 1 - i / 10),
							)
						}),
				]),
			)
		for (let i = 1; i < 5; i++)
			effects.push(
				first(`li.darken${i * 20}`, [
					(_, target) =>
						effect((): undefined => {
							setStepPosition(
								target,
								getStepColor(el.color, 1 - (i + 5) / 10),
							)
						}),
				]),
			)
		return effects
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'form-colorgraph': Component<FormColorgraphProps>
	}
}
