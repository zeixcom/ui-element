import {
	asBoolean,
	type Component,
	component,
	on,
	toggleAttribute,
} from '../../..'
import { copyToClipboard } from '../basic-button/copyToClipboard'

export type ModuleCodeblockProps = {
	collapsed: boolean
}

export default component<ModuleCodeblockProps>(
	'module-codeblock',
	{ collapsed: asBoolean() },
	(el, { first, useElement }) => {
		const code = useElement(
			'code',
			'Needed as source container to copy from.',
		)

		return [
			toggleAttribute('collapsed'),
			first(
				'.overlay',
				on('click', () => {
					el.collapsed = false
				}),
			),
			first(
				'.copy',
				copyToClipboard(code, {
					success: el.getAttribute('copy-success') || 'Copied!',
					error:
						el.getAttribute('copy-success') ||
						'Error trying to copy to clipboard!',
				}),
			),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'module-codeblock': Component<ModuleCodeblockProps>
	}
}
