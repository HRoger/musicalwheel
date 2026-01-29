/**
 * Voxel Vue Compatibility Shim
 *
 * Patches Voxel's Vue mixins to add null checks, preventing crashes when
 * Gutenberg blocks (which lack Elementor DOM structure) coexist with Voxel
 * Vue components on the same page.
 *
 * PROBLEM:
 * Voxel's `mixins.base.mounted()` assumes all Vue components run inside Elementor:
 * ```javascript
 * mounted() {
 *   this.widget_id = this.$root.$options.el.closest(".elementor-element").dataset.id;
 *   this.post_id = this.$root.$options.el.closest(".elementor").dataset.elementorId;
 * }
 * ```
 *
 * When `.closest(".elementor-element")` returns null (no Elementor structure),
 * accessing `.dataset` throws:
 *   TypeError: Cannot read properties of null (reading 'dataset')
 *
 * SOLUTION:
 * This shim patches `Voxel.mixins.base.mounted` to add null checks, allowing
 * Vue components to gracefully handle missing Elementor structure.
 *
 * USAGE:
 * Import and call `initVoxelShim()` early in your frontend.tsx:
 * ```typescript
 * import { initVoxelShim } from '@shared/utils/voxelShim';
 * initVoxelShim();
 * ```
 *
 * Or use the auto-initializing version by importing the module:
 * ```typescript
 * import '@shared/utils/voxelShim';
 * ```
 *
 * @package VoxelFSE
 */

/**
 * Extended Voxel type with mixins
 */
interface VoxelWithMixins {
	mixins?: {
		base?: {
			mounted?: () => void;
			_originalMounted?: () => void;
		};
	};
	Maps?: unknown;
}

declare global {
	interface Window {
		Voxel?: VoxelWithMixins;
	}
}

/**
 * Flag to prevent double patching
 */
let isPatched = false;

/**
 * Apply the shim patch to Voxel.mixins.base
 */
function applyPatch(): boolean {
	if (isPatched) {
		return true;
	}

	if (!window.Voxel?.mixins?.base) {
		return false;
	}

	const base = window.Voxel.mixins.base;

	// Store original mounted function if exists
	if (base.mounted && !base._originalMounted) {
		base._originalMounted = base.mounted;

		// Replace with null-safe version
		base.mounted = function (this: {
			widget_id?: string;
			post_id?: string;
			$root?: {
				$options?: {
					el?: HTMLElement;
				};
			};
			$el?: HTMLElement;
		}) {
			try {
				// Try to get element from $root.$options.el or $el
				const el = this.$root?.$options?.el || this.$el;

				if (el) {
					// Find Elementor widget element (with null check)
					const elementorElement = el.closest?.('.elementor-element');
					if (elementorElement) {
						this.widget_id = (elementorElement as HTMLElement).dataset?.id || '';
					} else {
						// Fallback: use data-block-id if available (Gutenberg blocks)
						const blockElement = el.closest?.('[data-block-id]');
						this.widget_id = blockElement
							? (blockElement as HTMLElement).dataset?.blockId || ''
							: '';
					}

					// Find Elementor container (with null check)
					const elementorContainer = el.closest?.('.elementor');
					if (elementorContainer) {
						this.post_id = (elementorContainer as HTMLElement).dataset?.elementorId || '';
					} else {
						// Fallback: try to get post ID from body class or data attribute
						const postIdMatch = document.body.className.match(/postid-(\d+)/);
						this.post_id = postIdMatch ? postIdMatch[1] : '';
					}
				}

				// Call original mounted if it exists and isn't the same function
				if (base._originalMounted && base._originalMounted !== base.mounted) {
					base._originalMounted.call(this);
				}
			} catch (error) {
				console.warn('[VoxelShim] Error in patched mounted():', error);
				// Set empty values to prevent downstream errors
				this.widget_id = '';
				this.post_id = '';
			}
		};

		isPatched = true;
		console.log('[VoxelShim] Successfully patched Voxel.mixins.base.mounted');
		return true;
	}

	return false;
}

/**
 * Initialize the Voxel shim
 *
 * Attempts to patch immediately, and sets up retries if Voxel isn't loaded yet.
 * Safe to call multiple times.
 */
export function initVoxelShim(): void {
	// Try immediate patch
	if (applyPatch()) {
		return;
	}

	// Set up polling for Voxel object
	let attempts = 0;
	const maxAttempts = 50; // 5 seconds max
	const pollInterval = 100; // 100ms

	const poll = setInterval(() => {
		attempts++;

		if (applyPatch()) {
			clearInterval(poll);
			return;
		}

		if (attempts >= maxAttempts) {
			clearInterval(poll);
			console.warn('[VoxelShim] Voxel.mixins.base not found after 5 seconds');
		}
	}, pollInterval);

	// Also listen for Voxel ready event if available
	if (typeof document !== 'undefined') {
		document.addEventListener(
			'voxel:ready',
			() => {
				applyPatch();
				clearInterval(poll);
			},
			{ once: true }
		);
	}
}

/**
 * Check if the shim has been applied
 */
export function isVoxelShimApplied(): boolean {
	return isPatched;
}

// Auto-initialize when module is imported
if (typeof window !== 'undefined') {
	// Run on next tick to allow other scripts to load
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initVoxelShim, { once: true });
	} else {
		// DOM already loaded, run immediately
		initVoxelShim();
	}
}
