import {
	type Component,
	asEnum,
	component,
	setText,
	toggleClass,
} from '../../..'

export type BasicStatusProps = {
	status: string
}

const STATUS_OPTIONS: [string, ...string[]] = ['success', 'warning', 'error']

export default component(
	'basic-status',
	{
		status: asEnum(STATUS_OPTIONS),
	},
	el => [
		setText('status'),
		...STATUS_OPTIONS.map(status =>
			toggleClass<BasicStatusProps>(status, () => el.status === status),
		),
	],
)

declare global {
	interface HTMLElementTagNameMap {
		'basic-status': Component<BasicStatusProps>
	}
}
