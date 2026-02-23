#!/usr/bin/env node
/**
 * TypeScript Error Count Gate
 *
 * This script runs `tsc --noEmit` and compares the error count against a baseline.
 * If the error count INCREASES, the build fails.
 * If it DECREASES, update the baseline file.
 *
 * Purpose: Prevent TypeScript errors from increasing while allowing incremental fixes.
 *
 * Usage:
 *   node scripts/type-check-gate.js
 *
 * Exit codes:
 *   0 - Success (errors <= baseline)
 *   1 - Failure (errors > baseline)
 *
 * @package VoxelFSE
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASELINE_FILE = path.join(__dirname, 'type-check-baseline.txt');

/**
 * Run tsc --noEmit and count errors
 */
function getErrorCount() {
	try {
		// Run tsc (will exit with code 1 if errors exist, but we catch that)
		execSync('npx tsc --noEmit', { stdio: 'pipe', encoding: 'utf-8' });
		return 0; // No errors
	} catch (error) {
		// tsc exits with non-zero when errors exist
		const output = error.stdout || '';
		const lines = output.split('\n');
		const errorLines = lines.filter((line) => /error TS\d+:/.test(line));
		return errorLines.length;
	}
}

/**
 * Read baseline error count from file
 */
function getBaseline() {
	if (!fs.existsSync(BASELINE_FILE)) {
		console.warn(`⚠️  Baseline file not found: ${BASELINE_FILE}`);
		console.warn('Creating baseline with current error count...');
		return null; // Will trigger baseline creation
	}

	const content = fs.readFileSync(BASELINE_FILE, 'utf-8').trim();
	const baseline = parseInt(content, 10);

	if (isNaN(baseline)) {
		console.error(`❌ Invalid baseline file content: "${content}"`);
		process.exit(1);
	}

	return baseline;
}

/**
 * Update baseline file with new error count
 */
function updateBaseline(count) {
	fs.writeFileSync(BASELINE_FILE, count.toString(), 'utf-8');
	console.log(`✅ Baseline updated: ${count} errors`);
}

/**
 * Main gate logic
 */
function main() {
	console.log('🔍 Running TypeScript type check...\n');

	const currentErrors = getErrorCount();
	const baseline = getBaseline();

	console.log(`Current errors: ${currentErrors}`);

	// First run - create baseline
	if (baseline === null) {
		updateBaseline(currentErrors);
		console.log('✅ Type check gate PASSED (baseline created)\n');
		process.exit(0);
	}

	console.log(`Baseline:       ${baseline}`);

	// Compare
	if (currentErrors > baseline) {
		const diff = currentErrors - baseline;
		console.error(`\n❌ TYPE CHECK GATE FAILED`);
		console.error(`Error count INCREASED by ${diff} (${baseline} → ${currentErrors})`);
		console.error('\nFix the new TypeScript errors before building.\n');
		process.exit(1);
	} else if (currentErrors < baseline) {
		const diff = baseline - currentErrors;
		console.log(`\n🎉 Great! Error count DECREASED by ${diff} (${baseline} → ${currentErrors})`);
		updateBaseline(currentErrors);
		console.log('✅ Type check gate PASSED\n');
		process.exit(0);
	} else {
		console.log('\n✅ Type check gate PASSED (no change)\n');
		process.exit(0);
	}
}

main();
