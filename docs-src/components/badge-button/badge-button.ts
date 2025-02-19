import { component, setText } from "../../../index"

export const BadgeButton = component('badge-button', {}, host => {
	host.first('.badge').sync(setText('badge'))
})