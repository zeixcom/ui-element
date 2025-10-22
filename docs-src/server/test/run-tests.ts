#!/usr/bin/env bun

/**
 * Comprehensive Test Runner for Dev Server
 */

import { existsSync, rmSync } from 'fs'
import { resolve } from 'path'

interface TestResults {
	passed: number
	failed: number
	total: number
	duration: number
	coverage?: {
		lines: number
		functions: number
		branches: number
		statements: number
	}
}

interface TestSuite {
	name: string
	pattern: string
	timeout?: number
	coverage?: boolean
}

const TEST_SUITES: TestSuite[] = [
	{
		name: 'Configuration System',
		pattern: 'config.test.ts',
		timeout: 30000,
		coverage: true,
	},
	{
		name: 'Event Emitter',
		pattern: 'event-emitter.test.ts',
		timeout: 15000,
		coverage: true,
	},
	{
		name: 'Smart File Watcher',
		pattern: 'smart-file-watcher.test.ts',
		timeout: 45000,
		coverage: true,
	},
	{
		name: 'Modular SSG',
		pattern: 'modular-ssg.test.ts',
		timeout: 30000,
		coverage: true,
	},
	{
		name: 'Dev Server',
		pattern: 'dev-server.test.ts',
		timeout: 60000,
		coverage: true,
	},
	{
		name: 'Integration Tests',
		pattern: 'integration.test.ts',
		timeout: 90000,
		coverage: true,
	},
]

class TestRunner {
	private testDir = resolve('./docs-src/server/test')
	private tempDirs: string[] = []

	async runAllTests(
		options: {
			coverage?: boolean
			watch?: boolean
			verbose?: boolean
			pattern?: string
		} = {},
	): Promise<TestResults> {
		console.log('🧪 Dev Server Test Suite')
		console.log('========================\n')

		if (options.coverage) {
			console.log('📊 Coverage reporting enabled')
		}

		if (options.watch) {
			console.log('👀 Watch mode enabled')
		}

		console.log('')

		const startTime = Date.now()
		let totalPassed = 0
		let totalFailed = 0
		let totalTests = 0

		// Filter test suites based on pattern
		const suitesToRun = options.pattern
			? TEST_SUITES.filter(suite =>
					suite.pattern.includes(options.pattern!),
				)
			: TEST_SUITES

		if (suitesToRun.length === 0) {
			console.error(`❌ No test suites match pattern: ${options.pattern}`)
			process.exit(1)
		}

		// Clean up any existing temp directories
		await this.cleanupTempDirs()

		for (const suite of suitesToRun) {
			const result = await this.runTestSuite(suite, options)
			totalPassed += result.passed
			totalFailed += result.failed
			totalTests += result.total
		}

		const duration = Date.now() - startTime

		// Print summary
		console.log('\n📋 Test Summary')
		console.log('================')
		console.log(`Total Tests: ${totalTests}`)
		console.log(`✅ Passed: ${totalPassed}`)
		console.log(`❌ Failed: ${totalFailed}`)
		console.log(`⏱️  Duration: ${duration}ms`)
		console.log(
			`📈 Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`,
		)

		// Clean up temp directories
		await this.cleanupTempDirs()

		return {
			passed: totalPassed,
			failed: totalFailed,
			total: totalTests,
			duration,
		}
	}

	private async runTestSuite(
		suite: TestSuite,
		options: { coverage?: boolean; verbose?: boolean },
	): Promise<TestResults> {
		console.log(`🔬 Running: ${suite.name}`)
		console.log(`   File: ${suite.pattern}`)

		const testFile = resolve(this.testDir, suite.pattern)

		if (!existsSync(testFile)) {
			console.error(`❌ Test file not found: ${testFile}`)
			return { passed: 0, failed: 1, total: 1, duration: 0 }
		}

		const startTime = Date.now()

		try {
			// Build test command
			const cmd = ['bun', 'test']

			if (options.coverage) {
				cmd.push('--coverage')
			}

			if (options.verbose) {
				cmd.push('--verbose')
			}

			// Set timeout
			if (suite.timeout) {
				process.env.BUN_TEST_TIMEOUT = suite.timeout.toString()
			}

			cmd.push(testFile)

			const proc = Bun.spawn(cmd, {
				stdout: 'pipe',
				stderr: 'pipe',
				env: {
					...process.env,
					NODE_ENV: 'test',
					BUN_TEST_TIMEOUT: suite.timeout?.toString() || '30000',
				},
			})

			const [stdout, stderr] = await Promise.all([
				new Response(proc.stdout).text(),
				new Response(proc.stderr).text(),
			])

			const exitCode = await proc.exited

			const duration = Date.now() - startTime

			// Parse test results from output
			const results = this.parseTestResults(stdout, stderr)

			if (exitCode === 0) {
				console.log(
					`   ✅ Passed: ${results.passed}/${results.total} tests`,
				)
			} else {
				console.log(
					`   ❌ Failed: ${results.failed}/${results.total} tests`,
				)
				if (options.verbose && stderr) {
					console.log(`   Error output:`)
					console.log(`   ${stderr.replace(/\n/g, '\n   ')}`)
				}
			}

			console.log(`   ⏱️  Duration: ${duration}ms\n`)

			return {
				...results,
				duration,
			}
		} catch (error) {
			console.error(`   💥 Error running test: ${error.message}\n`)
			return {
				passed: 0,
				failed: 1,
				total: 1,
				duration: Date.now() - startTime,
			}
		}
	}

	private parseTestResults(
		stdout: string,
		stderr: string,
	): { passed: number; failed: number; total: number } {
		// Parse Bun test output to extract results
		// This is a simplified parser - Bun's output format may vary
		const output = stdout + stderr

		// Look for test result patterns
		const passedMatch = output.match(/(\d+)\s+pass/i)
		const failedMatch = output.match(/(\d+)\s+fail/i)
		const totalMatch = output.match(/(\d+)\s+test/i)

		const passed = passedMatch ? parseInt(passedMatch[1], 10) : 0
		const failed = failedMatch ? parseInt(failedMatch[1], 10) : 0
		const total = totalMatch ? parseInt(totalMatch[1], 10) : passed + failed

		return { passed, failed, total: Math.max(total, passed + failed) }
	}

	private async cleanupTempDirs(): Promise<void> {
		const tempPatterns = ['test-temp-*']

		for (const pattern of tempPatterns) {
			try {
				// Find directories matching pattern
				const proc = Bun.spawn(
					['find', '.', '-name', pattern, '-type', 'd'],
					{
						stdout: 'pipe',
						stderr: 'pipe',
					},
				)

				const stdout = await new Response(proc.stdout).text()
				const dirs = stdout
					.trim()
					.split('\n')
					.filter(dir => dir.length > 0)

				for (const dir of dirs) {
					if (existsSync(dir)) {
						rmSync(dir, { recursive: true, force: true })
					}
				}
			} catch (error) {
				// Ignore cleanup errors
			}
		}
	}

	async watchTests(pattern?: string): Promise<void> {
		console.log('👀 Starting test watch mode...')
		console.log('Press Ctrl+C to stop\n')

		const watchPattern = pattern || '**/*.test.ts'

		// Use Bun's built-in watch mode
		const proc = Bun.spawn(
			['bun', 'test', '--watch', resolve(this.testDir, watchPattern)],
			{
				stdout: 'inherit',
				stderr: 'inherit',
				env: {
					...process.env,
					NODE_ENV: 'test',
				},
			},
		)

		// Handle graceful shutdown
		process.on('SIGINT', async () => {
			console.log('\n🛑 Stopping test watcher...')
			proc.kill()
			await this.cleanupTempDirs()
			process.exit(0)
		})

		await proc.exited
	}
}

// CLI Interface
async function main() {
	const args = process.argv.slice(2)

	const options = {
		coverage: args.includes('--coverage'),
		watch: args.includes('--watch'),
		verbose: args.includes('--verbose'),
		help: args.includes('--help'),
		pattern: args.find(arg => arg.startsWith('--pattern='))?.split('=')[1],
	}

	if (options.help) {
		console.log(`
Dev Server Test Runner

USAGE:
    bun run docs-src/server/test/run-tests.ts [OPTIONS]

OPTIONS:
    --coverage          Enable coverage reporting
    --watch            Run tests in watch mode
    --verbose          Enable verbose output
    --pattern=PATTERN  Run tests matching pattern
    --help             Show this help message

EXAMPLES:
    # Run all tests
    bun run docs-src/server/test/run-tests.ts

    # Run with coverage
    bun run docs-src/server/test/run-tests.ts --coverage

    # Watch mode
    bun run docs-src/server/test/run-tests.ts --watch

    # Run specific test suite
    bun run docs-src/server/test/run-tests.ts --pattern=config

    # Verbose output with coverage
    bun run docs-src/server/test/run-tests.ts --coverage --verbose

TEST SUITES:
${TEST_SUITES.map(suite => `    ${suite.name} (${suite.pattern})`).join('\n')}
`)
		process.exit(0)
	}

	const runner = new TestRunner()

	if (options.watch) {
		await runner.watchTests(options.pattern)
	} else {
		const results = await runner.runAllTests(options)

		// Exit with appropriate code
		process.exit(results.failed > 0 ? 1 : 0)
	}
}

// Handle errors
process.on('uncaughtException', error => {
	console.error('💥 Uncaught Exception:', error)
	process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
	console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason)
	process.exit(1)
})

// Run if this is the main module
if (import.meta.main) {
	main().catch(error => {
		console.error('💥 Fatal error:', error)
		process.exit(1)
	})
}

export { TestRunner }
