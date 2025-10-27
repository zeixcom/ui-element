import { type Cleanup, isFunction } from '@zeix/cause-effect'

type PluginEffect = () => Cleanup | void
type PluginEffects = PluginEffect[]
type PluginSetup = () => PluginEffects

const plugin = (name: string, setup: PluginSetup) => {
	const cleanups: Cleanup[] = [() => console.log('Plugin cleaned up:', name)]

	console.log('Plugin initialized:', name)

	// Initialize plugin effects
	for (const effect of setup()) {
		const cleanup = effect()
		if (isFunction(cleanup)) {
			cleanups.push(cleanup)
		}
	}

	// Return cleanup function
	return () => {
		for (const cleanup of cleanups) {
			cleanup()
		}
	}
}

export { type PluginSetup, plugin }
