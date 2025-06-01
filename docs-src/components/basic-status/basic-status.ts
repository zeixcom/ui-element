import {
	type Component,
	asEnum,
	component,
	setText,
	toggleClass,
} from '../../../'

export type BasicStatusProps = {
	status: string
}

const basicStatusOptions: [string, ...string[]] = [
	'success',
	'warning',
	'error',
]

export default component(
	'basic-status',
	{
		status: asEnum(basicStatusOptions),
	},
	el => [
		setText('status'),
		...basicStatusOptions.map(status =>
			toggleClass<BasicStatusProps>(status, () => el.status === status)
		),
	]
)

declare global {
	interface HTMLElementTagNameMap {
		'basic-status': Component<BasicStatusProps>
	}
}
