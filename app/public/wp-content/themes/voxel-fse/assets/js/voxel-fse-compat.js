/**
 * Voxel FSE Compatibility Shim
 *
 * Patches Voxel's base mixin to work with FSE blocks instead of Elementor widgets.
 * This prevents "Cannot read properties of null (reading 'dataset')" errors
 * when Voxel popup components try to find Elementor parent elements.
 *
 * Also handles Google Maps BillingNotEnabledMapError by mocking missing libraries.
 *
 * Evidence: themes/voxel/assets/dist/commons.js lines 1486-1487
 * Voxel's base mixin expects .elementor-element and .elementor parents
 */
(function () {
	'use strict';

	console.log('[Voxel FSE] Compatibility shim loading...');

	// Flag to prevent double-patching
	let patched = false;

	/**
	 * Patch Voxel.mixins.base to handle FSE blocks
	 * @returns {boolean} True if patched successfully
	 */
	function patchVoxelMixin() {
		// Prevent double patching
		if (patched) {
			return true;
		}

		if (!window.Voxel || !window.Voxel.mixins || !window.Voxel.mixins.base) {
			return false;
		}

		// Check if already patched by another mechanism
		if (window.Voxel.mixins.base._fsePatched) {
			patched = true;
			return true;
		}

		// Store original mixin
		const originalMixin = window.Voxel.mixins.base;

		// Create patched version
		window.Voxel.mixins.base = {
			...originalMixin,
			_fsePatched: true, // Marker to prevent double-patching
			mounted() {
				// Try to get widget_id and post_id from Elementor (original behavior)
				try {
					// CRITICAL: Use optional chaining to prevent null errors
					const parentElement = this.$el?.parentElement;
					const elementorElement = parentElement?.closest?.('.elementor-element');
					const elementorRoot = parentElement?.closest?.('.elementor');

					if (
						elementorElement &&
						elementorRoot &&
						elementorElement.dataset &&
						elementorRoot.dataset
					) {
						// Elementor context - use original logic
						this.widget_id = elementorElement.dataset.id;
						this.post_id = elementorRoot.dataset.elementorId;
					} else {
						// FSE context - find closest block wrapper or generate fallback
						const fseBlock = this.$el?.closest?.('[data-id]');
						if (fseBlock && fseBlock.dataset) {
							this.widget_id = fseBlock.dataset.id || fseBlock.id;
							this.post_id = fseBlock.dataset.elementorId || document.body.dataset?.postId || '0';
						} else {
							// Fallback: generate unique ID
							this.widget_id = 'fse-' + Math.random().toString(36).substr(2, 9);
							this.post_id = document.body.dataset?.postId || '0';
						}
					}
				} catch (error) {
					// Graceful fallback
					console.warn('[Voxel FSE] Could not extract widget/post IDs:', error);
					this.widget_id = 'fse-' + Math.random().toString(36).substr(2, 9);
					this.post_id = document.body.dataset?.postId || '0';
				}

				// NOTE: We do NOT call originalMixin.mounted.call(this) here
				// because the original mounted() ONLY contains the problematic Elementor code
				// that we've already replaced above. Calling it would cause the error again.
			},
		};

		patched = true;
		console.log(
			'[Voxel FSE] Compatibility shim applied - Voxel.mixins.base patched for FSE blocks'
		);
		return true;
	}

	// ===========================================================================
	// APPROACH 1: Event-based patching (PREFERRED - most reliable timing)
	// ===========================================================================
	// Listen for 'voxel/commons/init' event that commons.js dispatches
	// right after creating mixins but BEFORE rendering static popups.
	// This is the CRITICAL window to patch the mixin.
	document.addEventListener('voxel/commons/init', function onCommonsInit() {
		console.log('[Voxel FSE] Received voxel/commons/init event - patching immediately');
		patchVoxelMixin();
		// Remove listener after first invocation
		document.removeEventListener('voxel/commons/init', onCommonsInit);
	});

	// ===========================================================================
	// APPROACH 2: Polling fallback (in case event already fired)
	// ===========================================================================
	// If this script loads after commons.js (shouldn't happen, but safety first),
	// poll for the Voxel object and patch it.
	let attempts = 0;
	const maxAttempts = 100; // 100 * 5ms = 500ms max wait

	function pollAndPatch() {
		attempts++;

		if (patchVoxelMixin()) {
			// Success!
			return;
		}

		if (attempts >= maxAttempts) {
			console.warn('[Voxel FSE] Voxel.mixins.base not found after 500ms - may cause errors');
			return;
		}

		// Use shorter interval for faster patching
		setTimeout(pollAndPatch, 5);
	}

	// Start polling immediately (runs in parallel with event listener)
	pollAndPatch();

	// ===========================================================================
	// APPROACH 3: Immediate check on script load
	// ===========================================================================
	// In case commons.js already loaded synchronously before this script
	if (window.Voxel && window.Voxel.mixins && window.Voxel.mixins.base) {
		console.log('[Voxel FSE] Voxel already exists on script load - patching immediately');
		patchVoxelMixin();
	}

	// ===========================================================================
	// GOOGLE MAPS PATCH: Handle BillingNotEnabledMapError & Race Conditions
	// ===========================================================================
	/**
	 * Layer 4: Google Maps Billing Error & Missing Places Shim
	 *
	 * Handles "BillingNotEnabledMapError" which prevents "places" library from loading.
	 * We shim importLibrary to return a mock Places object so Voxel/Google code doesn't crash.
	 */
	function patchGoogleMaps() {
		// Stub Voxel.Maps.CircleOverlay to survive Adapter Crash (Race Condition)
		if (window.Voxel && window.Voxel.Maps && !window.Voxel.Maps.CircleOverlay) {
			window.Voxel.Maps.CircleOverlay = class StubCircleOverlay {
				constructor() {
					console.log('[Voxel FSE] Using Stub CircleOverlay');
				}
				update() {}
				remove() {}
			};
		}

		if (!window.google || !window.google.maps) {
			return;
		}

		// Patch importLibrary
		if (window.google.maps.importLibrary) {
			// Check if already patched to avoid recursion
			if (window.google.maps._importLibraryPatched) {
				return;
			}

			const originalImportLibrary = window.google.maps.importLibrary;
			window.google.maps.importLibrary = function (name) {
				return originalImportLibrary.apply(this, arguments).catch((err) => {
					console.warn(`[Voxel FSE] Caught Google Maps import error for '${name}':`, err);

					if (name === 'places') {
						console.log('[Voxel FSE] Providing mock Places library to prevent crash');
						// Return mock Places library
						return {
							Autocomplete: class MockAutocomplete {
								constructor() {
									console.log('[Voxel FSE] Mock Autocomplete initialized');
								}
								addListener() {
									return { remove: () => {} };
								}
								getPlace() {
									return {};
								}
								setBounds() {}
								setComponentRestrictions() {}
								setFields() {}
								setOptions() {}
								setTypes() {}
								bindTo() {}
								unbind() {}
							},
							AutocompleteService: class MockAutocompleteService {
								getPlacePredictions(req, cb) {
									cb([], 'OK');
								}
							},
							PlacesService: class MockPlacesService {
								findPlaceFromQuery(req, cb) {
									cb([], 'OK');
								}
								getDetails(req, cb) {
									cb({}, 'OK');
								}
								nearbySearch(req, cb) {
									cb([], 'OK');
								}
							},
							SearchBox: class MockSearchBox {
								addListener() {
									return { remove: () => {} };
								}
								getPlaces() {
									return [];
								}
							},
						};
					}
					throw err;
				});
			};
			window.google.maps._importLibraryPatched = true;
			console.log('[Voxel FSE] Patched google.maps.importLibrary');
		}
	}

	// Watch for Google Maps availability
	// 1. Check immediately
	patchGoogleMaps();

	// 2. Poll for it (since it loads async)
	const gmInterval = setInterval(() => {
		if (window.google && window.google.maps) {
			patchGoogleMaps();
			// Keep checking for a bit in case it reloads or wasn't fully ready
		}
	}, 100);

	// Stop polling after 10 seconds
	setTimeout(() => clearInterval(gmInterval), 10000);

	// 3. Listen for Voxel map events
	document.addEventListener('maps:loaded', patchGoogleMaps);

	// 4. Trap window.google definition just in case
	let googleValue = window.google;
	Object.defineProperty(window, 'google', {
		configurable: true,
		enumerable: true,
		get() {
			return googleValue;
		},
		set(newValue) {
			googleValue = newValue;
			patchGoogleMaps();
		},
	});
})();
