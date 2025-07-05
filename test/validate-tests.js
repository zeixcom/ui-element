#!/usr/bin/env node

import { readFileSync, readdirSync } from 'fs'
import process from 'node:process'
import { join } from 'path'

/**
 * Validate test files for common syntax errors that cause timeouts
 */

const COMMON_ISSUES = {
	unclosedBrackets: {
		name: 'Unclosed brackets',
		check: content => {
			const brackets = { '(': ')', '[': ']', '{': '}' }
			const stack = []
			let inString = false
			let inComment = false
			let stringChar = ''

			for (let i = 0; i < content.length; i++) {
				const char = content[i]
				const nextChar = content[i + 1]

				// Handle comments
				if (!inString && char === '/' && nextChar === '/') {
					inComment = 'single'
					i++ // skip next char
					continue
				}
				if (!inString && char === '/' && nextChar === '*') {
					inComment = 'multi'
					i++ // skip next char
					continue
				}
				if (inComment === 'single' && char === '\n') {
					inComment = false
					continue
				}
				if (inComment === 'multi' && char === '*' && nextChar === '/') {
					inComment = false
					i++ // skip next char
					continue
				}
				if (inComment) continue

				// Handle strings
				if (
					!inString &&
					(char === '"' || char === "'" || char === '`')
				) {
					inString = true
					stringChar = char
					continue
				}
				if (
					inString &&
					char === stringChar &&
					content[i - 1] !== '\\'
				) {
					inString = false
					stringChar = ''
					continue
				}
				if (inString) continue

				// Handle brackets
				if (brackets[char]) {
					stack.push({
						char,
						line: content.slice(0, i).split('\n').length,
					})
				} else if (Object.values(brackets).includes(char)) {
					const last = stack.pop()
					if (!last || brackets[last.char] !== char) {
						return {
							issue: `Mismatched bracket: expected ${brackets[last?.char] || 'none'}, got ${char}`,
							line: content.slice(0, i).split('\n').length,
						}
					}
				}
			}

			if (stack.length > 0) {
				const unclosed = stack[stack.length - 1]
				return {
					issue: `Unclosed bracket: ${unclosed.char}`,
					line: unclosed.line,
				}
			}

			return null
		},
	},

	missingImports: {
		name: 'Missing imports',
		check: content => {
			const usedFunctions = new Set()
			const importedFunctions = new Set()

			// Test framework functions that are globally available
			const testFrameworkFunctions = new Set([
				'describe',
				'it',
				'before',
				'after',
				'beforeEach',
				'afterEach',
				'assert',
				'expect',
				'should',
			])

			// Find imported functions
			const importMatches = content.matchAll(/import\s*{([^}]+)}\s*from/g)
			for (const match of importMatches) {
				const imports = match[1].split(',').map(s => s.trim())
				imports.forEach(imp => importedFunctions.add(imp))
			}

			// Find used functions that should be imported (not test framework functions)
			const libraryFunctions = [
				'setText',
				'setProperty',
				'setAttribute',
				'toggleAttribute',
				'toggleClass',
				'setStyle',
				'show',
				'on',
				'emit',
				'pass',
				'state',
				'computed',
				'effect',
				'component',
				'updateElement',
				'insertOrRemoveElement',
				'dangerouslySetInnerHTML',
				'RESET',
				'UNSET',
				'asString',
				'asNumber',
				'asInteger',
				'asBoolean',
				'fromDescendants',
				'fromDescendant',
				'fromEvent',
				'fromSelector',
			]

			libraryFunctions.forEach(fn => {
				// Check if function is called but exclude DOM method calls like element.setAttribute()
				const regex = new RegExp(`(?<!\\.)\\b${fn}\\s*\\(`, 'g')
				if (regex.test(content)) {
					usedFunctions.add(fn)
				}
			})

			const missing = [...usedFunctions].filter(
				fn =>
					!importedFunctions.has(fn) &&
					!testFrameworkFunctions.has(fn),
			)

			if (missing.length > 0) {
				return {
					issue: `Missing imports: ${missing.join(', ')}`,
					line: 1,
				}
			}

			return null
		},
	},

	infiniteLoops: {
		name: 'Potential infinite loops',
		check: content => {
			// Look for suspicious patterns that might cause infinite loops
			const suspiciousPatterns = [
				/while\s*\(\s*true\s*\)/g,
				/for\s*\(\s*;\s*;\s*\)/g,
				/setInterval\s*\(/g,
				/setTimeout\s*\(\s*[^,)]+\s*,\s*0\s*\)/g,
			]

			for (const pattern of suspiciousPatterns) {
				const matches = [...content.matchAll(pattern)]
				if (matches.length > 0) {
					const line = content
						.slice(0, matches[0].index)
						.split('\n').length
					return {
						issue: `Potential infinite loop pattern: ${matches[0][0]}`,
						line,
					}
				}
			}

			return null
		},
	},

	unclosedAsyncBlocks: {
		name: 'Unclosed async blocks',
		check: content => {
			// Check for async functions without proper await or return
			const asyncFunctionMatches = content.matchAll(
				/async\s+function[^{]*{/g,
			)
			let asyncCount = 0
			let awaitCount = 0

			for (const _match of asyncFunctionMatches) {
				asyncCount++
			}

			const awaitMatches = content.matchAll(/await\s+/g)
			for (const _match of awaitMatches) {
				awaitCount++
			}

			// Simple heuristic: if we have async functions but no awaits, might be problematic
			if (asyncCount > 0 && awaitCount === 0) {
				return {
					issue: `Found ${asyncCount} async function(s) but no await statements`,
					line: 1,
				}
			}

			return null
		},
	},
}

function validateFile(filePath) {
	console.log(`\n📋 Validating ${filePath}...`)

	try {
		const content = readFileSync(filePath, 'utf-8')
		const issues = []

		// Run all checks
		for (const [_key, check] of Object.entries(COMMON_ISSUES)) {
			const result = check.check(content)
			if (result) {
				issues.push({
					type: check.name,
					...result,
				})
			}
		}

		// Check file size (very large files might cause timeouts)
		const sizeKB = Math.round(content.length / 1024)
		if (sizeKB > 500) {
			issues.push({
				type: 'File size',
				issue: `Large test file (${sizeKB}KB) - consider splitting`,
				line: 1,
			})
		}

		// Check test count (too many tests in one file can cause timeouts)
		const testCount = (content.match(/it\s*\(/g) || []).length
		if (testCount > 80) {
			issues.push({
				type: 'Test count',
				issue: `Many tests (${testCount}) in one file - consider splitting`,
				line: 1,
			})
		}

		if (issues.length === 0) {
			console.log('✅ No issues found')
			return true
		}

		console.log(`❌ Found ${issues.length} issue(s):`)
		issues.forEach(issue => {
			console.log(`   ${issue.type} (line ${issue.line}): ${issue.issue}`)
		})
		return false
	} catch (error) {
		console.log(`❌ Error reading file: ${error.message}`)
		return false
	}
}

function main() {
	console.log('🔍 Validating test files...')

	const testDir = '.'
	let allValid = true

	try {
		const files = readdirSync(testDir)
		const testFiles = files.filter(
			file => file.endsWith('-test.html') || file.endsWith('-test.js'),
		)

		if (testFiles.length === 0) {
			console.log('⚠️  No test files found in test directory')
			return
		}

		console.log(`Found ${testFiles.length} test file(s)`)

		for (const file of testFiles) {
			const filePath = join(testDir, file)
			const isValid = validateFile(filePath)
			if (!isValid) {
				allValid = false
			}
		}

		console.log('\n' + '='.repeat(50))
		if (allValid) {
			console.log('🎉 All test files passed validation!')
		} else {
			console.log(
				'⚠️  Some test files have issues that might cause timeouts',
			)
			console.log('💡 Fix these issues before running the test suite')
			process.exit(1)
		}
	} catch (error) {
		console.error(`❌ Error accessing test directory: ${error.message}`)
		process.exit(1)
	}
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main()
}

export { validateFile, COMMON_ISSUES }
