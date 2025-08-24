import { asInteger, type Component, component, setText, show } from '../../..'

export type BasicPluralizeProps = {
	count: number
}

const FALLBACK_LOCALE = 'en'

export default component(
	'basic-pluralize',
	{ count: asInteger() },
	(el, { first }) => {
		const pluralizer = new Intl.PluralRules(
			el.closest('[lang]')?.getAttribute('lang') || FALLBACK_LOCALE,
			el.hasAttribute('ordinal') ? { type: 'ordinal' } : undefined,
		)

		// Subset of plural categories for applicable pluralizer: ['zero', 'one', 'two', 'few', 'many', 'other']
		const categories = pluralizer.resolvedOptions().pluralCategories
		const effects = [
			first('.count', [setText(() => String(el.count))]),
			first('.none', [show(() => el.count === 0)]),
			first('.some', [show(() => el.count > 0)]),
		]
		for (const category of categories)
			effects.push(
				first(`.${category}`, [
					show(() => pluralizer.select(el.count) === category),
				]),
			)
		return effects
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'basic-pluralize': Component<BasicPluralizeProps>
	}
}
