import { playwrightLauncher } from '@web/test-runner-playwright'

export default {
	files: ['test/*-test.html'],
	nodeResolve: true,
	browsers: [
		playwrightLauncher({ product: 'chromium' }),
		playwrightLauncher({ product: 'firefox' }),
		playwrightLauncher({ product: 'webkit' }),
	],
	testsStartTimeout: 60000,
	testsFinishTimeout: 120000,
	browserStartTimeout: 60000,
	concurrency: 1,
	watch: false,
}
