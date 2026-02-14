(function () {
	'use strict';

	const LOG_PREFIX = '[Voxel FSE]';
	console.log(`${LOG_PREFIX} Shim loaded`);

	// Flag to prevent double-patching
	let patched = false;

	/**
	 * Patch Voxel.mixins.base to handle FSE blocks
	 * @returns {boolean} True if patched successfully
	 */
	function patchVoxelMixin() {
		if (patched) return true;

		// Check if Voxel exists and has the base mixin
		if (!window.Voxel || !window.Voxel.mixins || !window.Voxel.mixins.base) {
			return false;
		}

		// Check if already patched
		if (window.Voxel.mixins.base._fsePatched) {
			patched = true;
			return true;
		}

		const originalMixin = window.Voxel.mixins.base;

		// Create patched version that handles missing Elementor wrappers
		window.Voxel.mixins.base = {
			...originalMixin,
			_fsePatched: true,
			mounted() {
				// Try to get widget_id and post_id from Elementor (original behavior)
				try {
					// Safety check - ensure $el exists and has required methods
					if (!this.$el || typeof this.$el.closest !== 'function') {
						this.widget_id = 'fse-' + Math.random().toString(36).substr(2, 9);
						this.post_id = document.body?.dataset?.postId || '0';
						return;
					}

					const parentElement = this.$el.parentElement;
					if (!parentElement) {
						this.widget_id = 'fse-' + Math.random().toString(36).substr(2, 9);
						this.post_id = document.body?.dataset?.postId || '0';
						return;
					}

					const elementorElement = parentElement.closest('.elementor-element');
					const elementorRoot = parentElement.closest('.elementor');

					if (elementorElement?.dataset && elementorRoot?.dataset) {
						this.widget_id = elementorElement.dataset.id;
						this.post_id = elementorRoot.dataset.elementorId;
					} else {
						// FSE context - find closest block wrapper or generate fallback
						const fseBlock = this.$el.closest('[data-id]');
						if (fseBlock?.dataset) {
							this.widget_id = fseBlock.dataset.id || fseBlock.id;
							this.post_id = fseBlock.dataset.elementorId || document.body?.dataset?.postId || '0';
						} else {
							// Fallback: generate unique ID
							this.widget_id = 'fse-' + Math.random().toString(36).substr(2, 9);
							this.post_id = document.body?.dataset?.postId || '0';
						}
					}
				} catch (error) {
					// Graceful fallback prevents the crash
					console.warn(`${LOG_PREFIX} ID extraction failed:`, error);
					this.widget_id = 'fse-' + Math.random().toString(36).substr(2, 9);
					this.post_id = document.body?.dataset?.postId || '0';
				}
			},
		};

		patched = true;
		console.log(`${LOG_PREFIX} Voxel.mixins.base patched successfully.`);
		return true;
	}

	// ===========================================================================
	// LAYER 1: Event-based patching (Adjusted for Voxel's dispatch timing)
	// ===========================================================================
	// Voxel dispatches 'voxel/commons/init' BEFORE defining mixins.
	// We must wait a tick (setTimeout 0) to allow the definition to complete.
	document.addEventListener('voxel/commons/init', function () {
		console.log(`${LOG_PREFIX} voxel/commons/init fired. Scheduling patch.`);
		setTimeout(() => {
			if (patchVoxelMixin()) {
				console.log(`${LOG_PREFIX} Patched via event + timeout.`);
			} else {
				console.warn(`${LOG_PREFIX} Failed to patch via event (mixin likely still missing).`);
			}
		}, 0);
	});

	// ===========================================================================
	// LAYER 2: Polling fallback
	// ===========================================================================
	let attempts = 0;
	function pollAndPatch() {
		attempts++;
		if (patchVoxelMixin()) return;
		if (attempts < 100) setTimeout(pollAndPatch, 10);
	}
	pollAndPatch();

	// ===========================================================================
	// LAYER 3: Vue Interception (Global + CreateApp)
	// ===========================================================================
	// Intercept Vue.createApp (Vue 3) to patch components in isolated apps
	// This is the most robust method for Voxel's static popups
	function interceptVue(Vue) {
		if (!Vue || Vue._fseIntercepted) return;
		Vue._fseIntercepted = true;

		console.log(`${LOG_PREFIX} Intercepting Vue.createApp`);

		const originalCreateApp = Vue.createApp;
		Vue.createApp = function (...args) {
			const app = originalCreateApp.apply(this, args);

			// Intercept app.component to catch registrations
			const originalComponent = app.component;
			app.component = function (name, definition) {
				// Just-In-Time Patching: Check if this component uses Voxel mixins
				if (definition && definition.mixins && window.Voxel?.mixins?.base) {
					if (!window.Voxel.mixins.base._fsePatched) {
						console.log(`${LOG_PREFIX} JIT Patching Voxel mixin for component: ${name}`);
						patchVoxelMixin();
					}
				}
				return originalComponent.call(this, name, definition);
			};

			return app;
		};

		// Also try to patch global Vue.component if it exists
		if (Vue.component) {
			const globalComponent = Vue.component;
			Vue.component = function (name, definition) {
				if (definition && definition.mixins && window.Voxel?.mixins?.base) {
					if (!window.Voxel.mixins.base._fsePatched) {
						patchVoxelMixin();
					}
				}
				return globalComponent.call(this, name, definition);
			};
		}
	}

	// Try to intercept global Vue immediately or via setter
	if (window.Vue) {
		interceptVue(window.Vue);
	} else {
		let _vue;
		Object.defineProperty(window, 'Vue', {
			configurable: true,
			enumerable: true,
			get: () => _vue,
			set: (val) => {
				_vue = val;
				interceptVue(val);
			}
		});
	}

	// ===========================================================================
	// LAYER 4: Carousel Navigation Fix (FSE)
	// ===========================================================================
	// Voxel's nav logic looks for .elementor-element wrappers. FSE blocks lack specific wrapper classes
	// so we must attach our own listeners to the arrows.
	function fixCarouselNavigation() {
		// Only run if jQuery is available
		if (typeof jQuery === 'undefined') return;

		const $ = jQuery;

		// Find post feed nav arrows that Voxel hasn't successfully attached to
		// We use a custom class .vx-fse-nav-patched to avoid double binding.
		$('.post-feed-nav a:not(.vx-fse-nav-patched)').each(function () {
			const $btn = $(this);
			// Find the closest FSE block wrapper (using data-id which Voxel blocks usually have)
			const $block = $btn.closest('[data-id]');

			// If it's found AND it's NOT an elementor element (so original Voxel script failed)
			// AND it's likely a post feed block
			if ($block.length && !$btn.closest('.elementor-element').length) {
				$btn.addClass('vx-fse-nav-patched');
				$btn.removeClass('disabled'); // Enable it visually

				// Attach click handler
				$btn.on('click', function (e) {
					e.preventDefault();

					const direction = $btn.hasClass('ts-prev-page') ? 'prev' : 'next';
					// Handle RTL support
					const isRtl = window.Voxel_Config?.is_rtl;
					const finalDir = (isRtl && direction === 'next') ? 'prev' :
						(isRtl && direction === 'prev') ? 'next' : direction;

					// Scroll logic adapted from commons.js
					const container = $block[0].querySelector('.post-feed-grid');
					if (container) {
						const preview = container.querySelector('.ts-preview');

						if (preview) {
							// Determine scroll amount (width of one item)
							const scrollAmount = preview.scrollWidth;
							const signedScrollAmount = finalDir === 'prev' ? -scrollAmount : scrollAmount;

							container.scrollBy({ left: signedScrollAmount, behavior: 'smooth' });
						}
					}
				});

				console.log(`${LOG_PREFIX} Fixed navigation arrows for block`, $block.data('id'));
			}
		});
	}

	// Run Navigation Fix on Init and Markup Updates
	const navInterval = setInterval(() => {
		if (typeof jQuery !== 'undefined') {
			clearInterval(navInterval);
			jQuery(document).on('voxel:markup-update', fixCarouselNavigation);
			jQuery(document).ready(fixCarouselNavigation);
			// Also run immediately just in case
			fixCarouselNavigation();
			// And periodically for good measure
			setInterval(fixCarouselNavigation, 2000);
		}
	}, 100);


	// ===========================================================================
	// LAYER 5: Google Maps Patch
	// ===========================================================================
	function patchGoogleMaps() {
		if (window.Voxel && window.Voxel.Maps && !window.Voxel.Maps.CircleOverlay) {
			window.Voxel.Maps.CircleOverlay = class StubCircleOverlay {
				update() { }
				remove() { }
			};
		}
		if (!window.google || !window.google.maps) return;
		if (window.google.maps.importLibrary && !window.google.maps._importLibraryPatched) {
			const originalImportLibrary = window.google.maps.importLibrary;
			window.google.maps.importLibrary = function (name) {
				return originalImportLibrary.apply(this, arguments).catch((err) => {
					if (name === 'places') {
						console.warn(`${LOG_PREFIX} Mocking Google Maps Places lib`);
						return {
							Autocomplete: class MockAC { addListener() { return { remove: () => { } } } getPlace() { return {} } },
							AutocompleteService: class MockACS { getPlacePredictions(r, c) { c([], 'OK') } },
							PlacesService: class MockPS { findPlaceFromQuery(r, c) { c([], 'OK') } getDetails(r, c) { c({}, 'OK') } nearbySearch(r, c) { c([], 'OK') } },
							SearchBox: class MockSB { addListener() { return { remove: () => { } } } getPlaces() { return [] } }
						};
					}
					throw err;
				});
			};
			window.google.maps._importLibraryPatched = true;
		}
	}
	patchGoogleMaps();
	const gmInterval = setInterval(() => { if (window.google) patchGoogleMaps(); }, 100);
	setTimeout(() => clearInterval(gmInterval), 10000);

})();
