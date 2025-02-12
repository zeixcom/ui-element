import { setText, UIElement } from "@zeix/ui-element"

export class BadgeButton extends UIElement {
	connectedCallback() {
		this.first('.badge').sync(setText('badge'))
	}
}
BadgeButton.define('badge-button')