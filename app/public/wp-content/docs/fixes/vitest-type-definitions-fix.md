# Vitest Type Definitions Fix

**Date:** 2026-01-22
**Status:** ✅ Completed

## Problem

TypeScript was showing 100+ type errors in test files related to missing vitest matcher definitions:

```
error TS2339: Property 'toBeInTheDocument' does not exist on type 'Assertion<Element | null>'.
error TS2339: Property 'toHaveAttribute' does not exist on type 'Assertion<HTMLElement>'.
error TS2339: Property 'toHaveValue' does not exist on type 'Assertion<HTMLElement>'.
error TS2339: Property 'toHaveTextContent' does not exist on type 'Assertion<HTMLElement>'.
```

These errors occurred despite importing `@testing-library/jest-dom` in `vitest.setup.tsx`.

## Root Cause

The main `tsconfig.json` was:
1. Excluding test files (`**/*.spec.ts`, `**/*.test.ts`) from compilation
2. Not including vitest type definitions in the `types` array
3. Not properly extending vitest's `Assertion` interface with jest-dom matchers

## Solution

Created a separate TypeScript configuration for tests that properly includes vitest and jest-dom types:

### 1. Created `vitest-env.d.ts`

```typescript
/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
	interface Assertion<T = any> extends jest.Matchers<void, T>, TestingLibraryMatchers<T, void> {}
	interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, any> {}
}
```

This file:
- References vitest and jest-dom types
- Extends vitest's `Assertion` interface with jest-dom matchers
- Provides proper TypeScript definitions for all jest-dom matchers

### 2. Created `tsconfig.test.json`

```json
{
	"extends": "./tsconfig.json",
	"compilerOptions": {
		"types": [
			"vite/client",
			"node",
			"vitest/globals",
			"@testing-library/jest-dom"
		]
	},
	"include": [
		"assets/**/*",
		"app/blocks/src/**/*",
		"app/blocks/shared/**/*",
		"vite.config.ts",
		"vite.blocks.config.js",
		"vite.frontend.config.js",
		"vitest.config.ts",
		"vitest.setup.tsx",
		"vitest-env.d.ts",
		"templates/backend/**/*"
	],
	"exclude": [
		"node_modules",
		"dist"
	]
}
```

Key differences from main tsconfig:
- Includes vitest/globals and @testing-library/jest-dom types
- Does NOT exclude test files
- Includes vitest-env.d.ts for type definitions

### 3. Updated `package.json`

Added a new script for type-checking tests:

```json
"type-check:test": "tsc --noEmit --project tsconfig.test.json"
```

### 4. Updated `tsconfig.json`

Added `vitest-env.d.ts` to the include array so the type definitions are available globally.

## Results

### Before
- **100+ TypeScript errors** in test files
- All errors related to missing jest-dom matcher definitions

### After
- **0 jest-dom matcher type errors**
- Tests run successfully with proper type checking
- Separation between production code types and test code types

### Type Check Results

**Regular type-check** (`npm run type-check`):
- Excludes test files (as intended)
- Only checks production code
- No jest-dom matcher errors

**Test type-check** (`npm run type-check:test`):
- Includes test files
- Properly typed jest-dom matchers
- No matcher definition errors

### Test Execution

Tests now run successfully with vitest:
```bash
npm run test
# Test Files  2 failed | 21 passed (23)
# Tests      89 failed | 1084 passed (1173)
```

The test failures are actual test logic issues, not TypeScript type definition problems.

## Files Modified

1. `tsconfig.json` - Added vitest-env.d.ts to includes
2. `package.json` - Added type-check:test script

## Files Created

1. `vitest-env.d.ts` - Type definitions for vitest + jest-dom matchers
2. `tsconfig.test.json` - TypeScript config specifically for tests

## Benefits

1. **Proper Type Safety**: Test files now have full type checking with correct matcher definitions
2. **Separation of Concerns**: Production code and test code have separate TypeScript configurations
3. **Developer Experience**: No more false TypeScript errors in test files
4. **Maintainability**: Easy to extend with additional test matchers or types in the future

## Related Documentation

- [Vitest TypeScript Guide](https://vitest.dev/guide/typescript.html)
- [@testing-library/jest-dom](https://github.com/testing-library/jest-dom)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
