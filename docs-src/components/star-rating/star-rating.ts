import { asNumber, component } from "../../..";

export const StarRating = component('star-rating', {
	value: asNumber
}, (host, { value }) => {
	host.all('button').on('click', (_target, index) => () => {
        value.set(index + 1)
		host.self.emit('change-rating', index + 1)
	})
})