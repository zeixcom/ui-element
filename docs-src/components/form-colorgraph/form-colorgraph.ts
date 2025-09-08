import { clampChroma, formatCss, inGamut, type Oklch } from 'culori/fn'
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
import { asOklch } from '../../functions/parser/asOklch'
import { getStepColor } from '../../functions/shared/getStepColor'
import { rafThrottle } from '../../functions/shared/rafThrottle'

export type FormColorgraphAxis = 'l' | 'c' | 'h'

export type FormColorgraphProps = {
	color: Oklch
	lightness: number
	chroma: number
	hue: number
	stepDown: (axis: FormColorgraphAxis, bigStep?: boolean) => void
	stepUp: (axis: FormColorgraphAxis, bigStep?: boolean) => void
}

const inP3Gamut = inGamut('p3')
const inRGBGamut = inGamut('rgb')
const fn2Digits = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
	.format
const fn4Digits = new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 })
	.format
const TRACK_OFFSET = 20 // pixels
const CONTRAST_THRESHOLD = 0.71 // lightness
const AXIS_MAX = { l: 1, c: 0.4, h: 360 }
const AXIS_STEP = { l: 0.0025, c: 0.001, h: 1 }
const AXIS_BIGSTEP = { l: 0.05, c: 0.02, h: 15 }
const getStep = (axis: FormColorgraphAxis, shiftKey: boolean) =>
	shiftKey ? AXIS_BIGSTEP[axis] : AXIS_STEP[axis]

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
		lInput.min = '0'
		lInput.max = '100'
		lInput.step = 'any'
		cInput.min = '0'
		cInput.max = '0.4'
		cInput.step = 'any'
		hInput.min = '0'
		hInput.max = '360'
		hInput.step = 'any'
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
		const commit = (color: Oklch) => {
			el.color = color
			emitEvent('color-change', 'color')
		}
		const setToNearestStep = (axis: FormColorgraphAxis, value: number) => {
			const nearest =
				Math.round(value / AXIS_STEP[axis]) * AXIS_STEP[axis]
			if (nearest >= 0 && nearest <= AXIS_MAX[axis])
				commit({ ...el.color, [axis]: nearest })
		}
		el.stepDown = (axis: FormColorgraphAxis, bigStep = false) => {
			setToNearestStep(axis, getValue(axis) - getStep(axis, bigStep))
		}
		el.stepUp = (axis: FormColorgraphAxis, bigStep = false) => {
			setToNearestStep(axis, getValue(axis) + getStep(axis, bigStep))
		}

		// Internal states
		const canvasSize = state(graph.getBoundingClientRect().width)
		const trackWidth = computed(() => canvasSize.get() - 2 * TRACK_OFFSET)

		// Helper functions
		const formatNumber = (axis: FormColorgraphAxis, value: number) => {
			const v = axis === 'l' ? value * 100 : value
			return axis === 'c' ? fn4Digits(v) : fn2Digits(v)
		}
		const moveKnob = rafThrottle((x, y, top, left, size) => {
			const color = {
				...el.color,
				c: Math.min(Math.max((x - left) / size, 0), 1) * AXIS_MAX.c,
				l: 1 - Math.min(Math.max((y - top) / size, 0), 1),
			}
			if (inP3Gamut(color)) commit(color)
		})
		const getColorFromPosition = (
			x: number,
			y: number,
			h: number,
			alpha: number = 1,
		) =>
			formatCss({
				mode: 'oklch',
				l: 1 - y,
				c: x * AXIS_MAX.c,
				h,
				alpha,
			})
		const setStepPosition = (target: HTMLLIElement, color: Oklch): void => {
			const size = canvasSize.get()
			const x = Math.round((color.c * size) / AXIS_MAX.c)
			const y = Math.round((1 - color.l) * size)
			target.style.setProperty('background-color', formatCss(color))
			target.style.setProperty(
				'border-color',
				color.l > CONTRAST_THRESHOLD ? 'black' : 'white',
			)
			target.style.setProperty('left', `${x}px`)
			target.style.setProperty('top', `${y}px`)
		}
		const moveThumb = rafThrottle((x, left, width) => {
			const color = {
				...el.color,
				h: Math.min(Math.max((x - left) / width, 0), 1) * AXIS_MAX.h,
			}
			if (inP3Gamut(color)) commit(color)
		})
		const getHueFromPosition = (x: number): Oklch => {
			const newColor = { ...el.color, h: x * AXIS_MAX.h }
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
						const maxChroma = (
							l: number,
							gamut: 'rgb' | 'p3' = 'rgb',
						) =>
							clampChroma(
								{ mode: 'oklch', l, c: AXIS_MAX.c, h },
								'oklch',
								gamut,
							).c / AXIS_MAX.c
						const gradientStops = (
							minX: number,
							maxX: number,
							y: number,
							alpha: number = 1,
						) => [
							getColorFromPosition(minX, y, h, alpha),
							getColorFromPosition(maxX, y, h, alpha),
						]
						const drawGradient = (
							minX: number,
							y: number,
							gamut: 'rgb' | 'p3' = 'rgb',
						): [number, string] => {
							const maxX = maxChroma(1 - y / n, gamut) * n
							const gradient = ctx.createLinearGradient(
								minX,
								0,
								maxX,
								0,
							)
							const stops = gradientStops(
								minX / n,
								maxX / n,
								y / n,
								gamut === 'p3' ? 0.5 : 1,
							)
							gradient.addColorStop(0, stops[0])
							gradient.addColorStop(1, stops[1])
							ctx.fillStyle = gradient
							ctx.fillRect(minX, y, maxX - minX, 1)
							return [maxX, stops[1]]
						}
						ctx.clearRect(0, 0, n, n)
						for (let y = 0; y < n; y++) {
							const [maxRgbX, maxRgbColor] = drawGradient(0, y)
							if (inP3Gamut(maxRgbColor))
								drawGradient(maxRgbX, y, 'p3')
						}
					}),
			]),
			first(
				'.knob',
				[
					setStyle(
						'top',
						() =>
							`${Math.round((1 - el.lightness) * canvasSize.get())}px`,
					),
					setStyle(
						'left',
						() =>
							`${Math.round((el.chroma * canvasSize.get()) / AXIS_MAX.c)}px`,
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
							`${Math.round((el.hue * trackWidth.get()) / AXIS_MAX.h) + TRACK_OFFSET}px`,
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
						if (axis) el.stepDown(axis, event.shiftKey)
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
						if (axis) el.stepUp(axis, event.shiftKey)
					}),
					setProperty('disabled', target => {
						const axis = getAxis(target)
						return !axis || (el.color[axis] ?? 0) >= AXIS_MAX[axis]
					}),
				],
				'Add a <button.increment> to increment a value for a color channel.',
			),
			on('keydown', ({ event }) => {
				const { key, shiftKey } = event
				const target = event.target as HTMLElement | null
				if (
					!target ||
					(target.localName === 'input' &&
						(key === 'ArrowLeft' || key === 'ArrowRight'))
				)
					return
				if (
					key.substring(0, 5) === 'Arrow' ||
					['+', '-'].includes(key)
				) {
					event.preventDefault()
					event.stopPropagation()
					const axis = getAxis(target)
					if (axis) {
						if (
							key === 'ArrowLeft' ||
							key === 'ArrowDown' ||
							key === '-'
						)
							el.stepDown(axis, shiftKey)
						else if (
							key === 'ArrowRight' ||
							key === 'ArrowUp' ||
							key === '+'
						)
							el.stepUp(axis, shiftKey)
					} else if (target.role === 'slider') {
						if (
							key === 'ArrowLeft' ||
							key === 'ArrowDown' ||
							key === '-'
						)
							el.stepDown('h', shiftKey)
						else if (
							key === 'ArrowRight' ||
							key === 'ArrowUp' ||
							key === '+'
						)
							el.stepUp('h', shiftKey)
					} else {
						switch (key) {
							case 'ArrowDown':
								el.stepDown('l', shiftKey)
								break
							case 'ArrowUp':
								el.stepUp('l', shiftKey)
								break
							case 'ArrowLeft':
								el.stepDown('c', shiftKey)
								break
							case 'ArrowRight':
								el.stepUp('c', shiftKey)
								break
							case '-':
								el.stepDown('h')
								break
							case '+':
								el.stepUp('h')
								break
						}
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
