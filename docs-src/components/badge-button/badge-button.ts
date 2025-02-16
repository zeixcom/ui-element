import { setText, UIElement } from "../../../index"

export class BadgeButton extends UIElement {
	connectedCallback() {
		this.first('.badge').sync(setText('badge'))
	}
}
BadgeButton.define('badge-button')