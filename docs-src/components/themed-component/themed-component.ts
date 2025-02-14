import { UIElement } from '@zeix/ui-element';
import { Context } from '@zeix/ui-element/src/core/context';

const MEDIA_THEME = 'media-theme' as Context<string, string>

export class ThemedComponent extends UIElement {
	static consumedContexts = [MEDIA_THEME];

	connectedCallback() {
		super.connectedCallback();

        const THEME_LIGHT = 'light'
		const THEME_DARK = 'dark'

        const colorScheme = matchMedia('(prefers-color-scheme: dark)')

        this.set(MEDIA_THEME, colorScheme.matches ? THEME_DARK : THEME_LIGHT)
        this.setAttribute('media-theme', this.get(MEDIA_THEME) ?? '');

        colorScheme.addEventListener(
			'change',
			e => {
				this.set(MEDIA_THEME, e.matches ? THEME_DARK : THEME_LIGHT);
				this.setAttribute('media-theme', this.get(MEDIA_THEME) ?? '');
			}
		)
		
		this.first('button').on('click', () => {
			const currentTheme = this.get(MEDIA_THEME);
			const newTheme = currentTheme === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;
			this.set(MEDIA_THEME, newTheme);
			this.setAttribute('media-theme', newTheme);
		});
	}
}

ThemedComponent.define('themed-component');