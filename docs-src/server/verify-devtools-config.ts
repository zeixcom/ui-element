#!/usr/bin/env bun

import { resolve } from 'path'

/**
 * Verification script for Chrome DevTools workspace configuration
 * Checks if the dev server is running and DevTools config is accessible
 */

const DEV_SERVER_URL = 'http://localhost:3000'
const DEVTOOLS_CONFIG_PATH = '/.well-known/appspecific/com.chrome.devtools.json'

async function checkDevServer(): Promise<boolean> {
	try {
		const response = await fetch(DEV_SERVER_URL)
		return response.ok
	} catch {
		return false
	}
}

async function checkDevToolsConfig(): Promise<{
	success: boolean
	config?: any
	error?: string
}> {
	try {
		const response = await fetch(`${DEV_SERVER_URL}${DEVTOOLS_CONFIG_PATH}`)
		if (!response.ok) {
			return {
				success: false,
				error: `HTTP ${response.status}: ${response.statusText}`,
			}
		}

		const config = await response.json()
		return { success: true, config }
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}

function printInstructions() {
	console.log('\n📋 Chrome DevTools Workspace Setup Instructions:')
	console.log('1. Start your dev server: bun run serve:docs')
	console.log('2. Open Chrome and navigate to http://localhost:3000')
	console.log('3. Open DevTools (F12)')
	console.log('4. Go to Sources tab → Workspace (left sidebar)')
	console.log('5. Click "Connect"')
	console.log('6. Allow access when Chrome prompts for permissions')
	console.log('\n✨ Once set up, you can edit files directly in DevTools!')
	console.log(
		'   Changes will be saved to your source files and hot-reloaded.\n',
	)
}

async function main() {
	console.log('🔍 Verifying Chrome DevTools workspace configuration...\n')

	// Check if dev server is running
	console.log('🚀 Checking dev server...')
	const serverRunning = await checkDevServer()

	if (!serverRunning) {
		console.log('❌ Dev server is not running at http://localhost:3000')
		console.log('   Run: bun run serve:docs')
		process.exit(1)
	}

	console.log('✅ Dev server is running at http://localhost:3000')

	// Check DevTools configuration
	console.log('🔧 Checking DevTools configuration...')
	const configResult = await checkDevToolsConfig()

	if (!configResult.success) {
		console.log(
			`❌ DevTools configuration not accessible: ${configResult.error}`,
		)
		process.exit(1)
	}

	console.log('✅ DevTools configuration is accessible')

	// Validate configuration structure
	const config = configResult.config
	const projectRoot = resolve('.')

	console.log('\n📊 Configuration details:')
	console.log(`   Version: ${config.version}`)
	console.log(`   Project root: ${config.workspace?.root}`)
	console.log(`   Workspace UUID: ${config.workspace?.uuid}`)

	// Verify the root path matches current directory
	if (config.workspace?.root !== projectRoot) {
		console.log(
			`⚠️  Warning: Configured root (${config.workspace?.root}) doesn't match current directory (${projectRoot})`,
		)
	} else {
		console.log('✅ Project root matches current directory')
	}

	// Check required fields
	const hasRequiredFields =
		config.version && config.workspace?.root && config.workspace?.uuid

	if (!hasRequiredFields) {
		console.log('❌ Configuration is missing required fields')
		console.log('   Required: version, workspace.root, workspace.uuid')
		process.exit(1)
	}

	console.log('✅ All required configuration fields are present')

	// Success message
	console.log('\n🎉 Chrome DevTools workspace configuration is ready!')
	printInstructions()
}

// Run the verification
main().catch(error => {
	console.error('💥 Verification failed:', error.message)
	process.exit(1)
})
