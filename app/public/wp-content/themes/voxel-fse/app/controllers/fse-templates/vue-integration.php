<?php
declare(strict_types=1);

/**
 * Vue.js Integration for FSE Templates
 *
 * Hooks into Voxel's Vue.js post type editor to change edit links from Elementor to FSE.
 *
 * Discovery findings:
 * - Voxel auto-creates Elementor templates in post-type-controller.php:30
 * - Voxel outputs Post_Type_Config in post-type-controller.php:254-256
 * - Post_Type_Config.templates contains Elementor template IDs
 * - Vue passes these IDs to editWithElementor($root.config.templates.single)
 * - We need to create FSE templates and override the template IDs
 *
 * @package VoxelFSE\Controllers\FSE_Templates
 * @since 1.0.5
 */

namespace VoxelFSE\Controllers\Templates;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Auto-create FSE templates when Voxel screen renders
 *
 * Based on discovery:
 * - Voxel calls $post_type->get_templates() at priority 30
 * - We hook at priority 29 to create FSE templates first
 * - URL format: edit.php?page=edit-post-type-{key}
 */
add_action( 'voxel/backend/post-types/screen:edit-type', function() {
	// Extract post type key from page parameter
	$page = $_GET['page'] ?? '';
	if ( strpos( $page, 'edit-post-type-' ) !== 0 ) {
		return;
	}

	$key = str_replace( 'edit-post-type-', '', $page );
	$post_type = \Voxel\Post_Type::get( $key );
	if ( ! $post_type ) {
		return;
	}

	// Create FSE templates for base template types (mimicking Voxel's approach)
	// ⭐ CRITICAL: Form templates are PAGES, not FSE templates!
	// Evidence: themes/voxel/app/controllers/templates/post-types/post-type-base-templates-controller.php:30-35
	// Only create FSE templates for: single, card, archive
	$template_types = [ 'single', 'card', 'archive' ];
	$fse_template_ids = [];

	// IMPORTANT: Only create FSE templates for types that Voxel has active
	// If Voxel has form: null, user deleted it - don't recreate!
	$voxel_templates = $post_type->get_templates();
	// error_log( 'FSE: Voxel current templates config: ' . wp_json_encode( $voxel_templates ) );

	foreach ( $template_types as $template_type ) {
		// Force creation of FSE templates even if Voxel hasn't created them yet
		// This fixes the "First Load" issue for new Post Types

		// Create template if it doesn't exist
		$template_id = Template_Manager::create_fse_template( $key, $template_type );

		if ( $template_id ) {
			$fse_template_ids[ $template_type ] = $template_id;

			// Save to config
			$template = get_post( $template_id );
			if ( $template ) {
				Template_Manager::save_template_to_config( $post_type, $template_type, $template->post_name );
			}
		}
	}

	// Update Voxel's templates config with FSE template IDs for active templates only
	if ( ! empty( $fse_template_ids ) ) {
		$updated = false;

		foreach ( $fse_template_ids as $template_type => $template_id ) {
			// Always update with FSE template ID (replaces Elementor IDs)
			$voxel_templates[ $template_type ] = $template_id;
			$updated = true;
		}

		if ( $updated ) {
			$post_type->repository->set_config( [
				'templates' => $voxel_templates,
			] );
			// error_log( 'FSE: Updated Voxel templates config with FSE template IDs: ' . wp_json_encode( $voxel_templates ) );
		}
	}

	// Build Site Editor URLs for base templates
	$fse_template_urls = [];
	foreach ( $fse_template_ids as $template_type => $template_id ) {
		$fse_template_urls[ $template_id ] = Template_Manager::get_site_editor_url( $template_id );
	}

	// Add custom template mappings
	// Use + operator instead of array_merge() to preserve integer keys
	$custom_template_mapping = get_option( 'mw_fse_custom_template_mapping', [] );
	if ( ! empty( $custom_template_mapping ) ) {
		$fse_template_urls = $fse_template_urls + $custom_template_mapping;
	}

	// Store FSE template IDs and URLs in globals for the JavaScript override
	global $mw_fse_template_ids, $mw_fse_template_urls, $mw_fse_template_id_map;
	$mw_fse_template_ids = $fse_template_ids;
	$mw_fse_template_urls = $fse_template_urls;
	
	// Create a mapping of template IDs to check if a post ID is an FSE template
	$mw_fse_template_id_map = [];
	foreach ( $fse_template_ids as $template_id ) {
		$mw_fse_template_id_map[ $template_id ] = true;
	}
	// Add custom template IDs to the map
	$custom_template_ids = array_keys( $custom_template_mapping );
	foreach ( $custom_template_ids as $template_id ) {
		$mw_fse_template_id_map[ $template_id ] = true;
	}

	// Debug output to verify templates were created
	?>
	<script type="text/javascript">
	// //console.log('FSE Templates: Created at priority 29:', <?php echo wp_json_encode( $fse_template_ids ); ?>);
	// //console.log('FSE Templates: URLs (object):', <?php echo wp_json_encode( $fse_template_urls, JSON_FORCE_OBJECT ); ?>);
	</script>
	<?php
}, 29 ); // Priority 29 - runs BEFORE Voxel's render_edit_screen (priority 30)

/**
 * Override Post_Type_Config.templates to use FSE template IDs
 *
 * Runs at priority 31 (after Voxel outputs Post_Type_Config at priority 30)
 */
add_action( 'voxel/backend/post-types/screen:edit-type', function() {
	global $mw_fse_template_ids, $mw_fse_template_urls, $mw_fse_template_id_map;

	// Always output the script, even if template IDs are empty
	// The replacement logic should work regardless
	?>
	<script type="text/javascript">
	// Store FSE template mapping for JavaScript
	window.VoxelFSE_TemplateMapping = <?php echo wp_json_encode( $mw_fse_template_urls, JSON_FORCE_OBJECT ); ?>;
	window.VoxelFSE_TemplateIDs = <?php echo wp_json_encode( isset( $mw_fse_template_id_map ) ? $mw_fse_template_id_map : [], JSON_FORCE_OBJECT ); ?>;
	// ⭐ TEST: This should always appear in console
	// //console.log('=== FSE Templates Script Starting ===');
	// //console.log('FSE Templates: Hook fired at priority 31');
	// //console.log('FSE Templates: Template IDs available:', <?php echo wp_json_encode( ! empty( $mw_fse_template_ids ) ); ?>);
	// //console.log('FSE Templates: Template URLs available:', <?php echo wp_json_encode( ! empty( $mw_fse_template_urls ) ); ?>);
	// //console.log('FSE Templates: Current page:', window.location.href);
	// //console.log('FSE Templates: Document ready state:', document.readyState);
	
	// ⭐ TEST: Try to find elementor links immediately
	// setTimeout(function() {
	// 	var elementorLinks = document.querySelectorAll('a[href*="action=elementor"]');
	// 	//console.log('FSE Templates: Found', elementorLinks.length, 'action=elementor links on page');
	// 	if (elementorLinks.length > 0) {
	// 		//console.log('FSE Templates: First link:', elementorLinks[0].href);
	// 	}
	// }, 100);
	
	(function() {
		// //console.log('FSE Templates: IIFE executing - Installing DOM mutation observer for href replacement...');

		// Always run the replacement logic, even if Post_Type_Config isn't available yet
		// This ensures links are replaced regardless of Vue state
		
		/**
		 * Replace Elementor URLs with action=fse in edit template buttons
		 */
		function replaceEditLinks(container) {
			if (!container) {
				container = document;
			}

			// Find all "Edit template" buttons with Elementor URLs
			var editButtons = container.querySelectorAll('a[href*="post.php"][href*="action=elementor"]');
			var replacedCount = 0;

			editButtons.forEach(function(button) {
				var currentHref = button.getAttribute('href');
				if (!currentHref) return;

				// ⭐ NEW: Simply replace action=elementor with action=fse
				var newHref = currentHref.replace('action=elementor', 'action=fse');
				
				// //console.log('FSE Templates: Replacing action=elementor with action=fse');
				// //console.log('  Old:', currentHref);
				// //console.log('  New:', newHref);
				
				button.setAttribute('href', newHref);
				replacedCount++;
			});

			// if (replacedCount > 0) {
			// 	//console.log('FSE Templates: Replaced', replacedCount, 'edit links with action=fse');
			// }

			return replacedCount;
		}

		/**
		 * Replace preview links (eye icons) by adding canvas=view parameter
		 * The PHP interceptor will handle the actual redirect to Site Editor
		 * This approach doesn't require the mapping to be ready - works immediately!
		 */
		function replacePreviewLinks(container) {
			if (!container) {
				container = document;
			}

			// Find all preview links (eye icons) that use ?p={id} format
			// These are typically: <a href="/?p=123" class="ts-button ts-outline icon-only">
			var previewLinks = container.querySelectorAll('a.ts-button.icon-only[href*="?p="], a.ts-button.ts-outline.icon-only[href*="?p="]');
			var replacedCount = 0;

			// Titles of templates that are actually PAGES (should be skipped)
			var pageTitles = [
				'Create Post', 
				'Login & registration', 
				'Current plan', 
				'Orders page', 
				'Cart summary', 
				'Stripe Connect account', 
				'Newsfeed', 
				'Inbox', 
				'Post statistics', 
				'Privacy Policy', 
				'Terms & Conditions'
			];

			previewLinks.forEach(function(link) {
				var currentHref = link.getAttribute('href');
				if (!currentHref) return;
				
				// Skip if already has canvas=view (already replaced)
				if (currentHref.indexOf('canvas=view') !== -1) {
					return;
				}

				// Extract post ID from URL like /?p=123 or ?p=123
				var postIdMatch = currentHref.match(/[?&]p=(\d+)/);
				if (!postIdMatch) return;

				// ⭐ Check if this is a known Page based on title
				var card = link.closest('.x-template');
				if (card) {
					var titleEl = card.querySelector('h3');
					if (titleEl) {
						var title = titleEl.innerText.trim();
						// Check if title matches any page title
						if (pageTitles.indexOf(title) !== -1) {
							return; // Skip known pages
						}
					}
				}

				// Simply add canvas=view parameter
				// The PHP interceptor will check if it's an FSE template and redirect accordingly
				var separator = currentHref.indexOf('?') !== -1 ? '&' : '?';
				var newHref = currentHref + separator + 'canvas=view';
				
				link.setAttribute('href', newHref);
				replacedCount++;
				
				// //console.log('FSE Templates: Added canvas=view to preview link');
				// //console.log('  Old:', currentHref);
				// //console.log('  New:', newHref);
			});

			// if (replacedCount > 0) {
			// 	//console.log('FSE Templates: Added canvas=view to', replacedCount, 'preview links');
			// }

			return replacedCount;
		}

		// ⭐ NEW: Debounced replacement function to avoid excessive calls
		var replaceDebounceTimer = null;
		function debouncedReplaceEditLinks() {
			if (replaceDebounceTimer) {
				clearTimeout(replaceDebounceTimer);
			}
			replaceDebounceTimer = setTimeout(function() {
				replaceEditLinks();
				replacePreviewLinks(); // Also replace preview links
			}, 100);
		}

		// ⭐ NEW: Periodic check to catch any missed links (runs every 1 second)
		var periodicCheckInterval = setInterval(function() {
			var hasElementorLinks = document.querySelector('a[href*="post.php"][href*="action=elementor"]');
			var hasPreviewLinks = document.querySelector('a.ts-button.icon-only[href*="?p="]');
			
			// Always replace edit links if found
			if (hasElementorLinks) {
				// //console.log('FSE Templates: Periodic check found edit links, replacing...');
				replaceEditLinks();
			}
			
			// ⭐ FIX: Always try to replace preview links if they exist
			// This ensures we catch them even if mapping wasn't ready on first try
			if (hasPreviewLinks) {
				// //console.log('FSE Templates: Periodic check found preview links, replacing...');
				replacePreviewLinks();
			}
		}, 1000);

		// ⭐ NEW: Run immediately on page load (multiple times to catch Vue rendering)
		function runInitialReplacement() {
			// //console.log('FSE Templates: Running initial href replacement...');
			replaceEditLinks();
			replacePreviewLinks();
			
			// Run again after delays to catch Vue rendering
			setTimeout(function() {
				replaceEditLinks();
				replacePreviewLinks();
			}, 100);
			setTimeout(function() {
				replaceEditLinks();
				replacePreviewLinks();
			}, 500);
			setTimeout(function() {
				replaceEditLinks();
				replacePreviewLinks();
			}, 1000);
			setTimeout(function() {
				replaceEditLinks();
				replacePreviewLinks();
			}, 2000);
		}

		// Run on DOMContentLoaded or immediately if already loaded
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', runInitialReplacement);
		} else {
			runInitialReplacement();
		}

		// ⭐ NEW: Listen for tab clicks as a fallback
		document.addEventListener('click', function(e) {
			var target = e.target.closest('.ts-nav-item a, .ts-tab-content a, [data-tab]');
			if (target) {
				// //console.log('FSE Templates: Tab click detected, replacing links...');
				setTimeout(function() {
					replaceEditLinks();
					replacePreviewLinks();
				}, 200);
				setTimeout(function() {
					replaceEditLinks();
					replacePreviewLinks();
				}, 500);
			}
		}, true); // Use capture phase to catch early

		// ⭐ IMPROVED: Watch for templates tab visibility changes
		var lastVisibleState = false;
		var visibilityCheckInterval = setInterval(function() {
			// Find templates tab content (Vue renders it dynamically)
			var templatesContent = document.querySelector('.x-templates, [v-if*="templates"], [v-show*="templates"], .ts-tab-content[data-tab*="template"]');
			
			// Also check by looking for edit buttons in templates context
			var hasTemplatesEditButtons = document.querySelector('.x-templates a[href*="action=elementor"], [v-if*="templates"] a[href*="action=elementor"]');
			
			var isVisible = false;
			if (templatesContent) {
				var style = window.getComputedStyle(templatesContent);
				isVisible = style.display !== 'none' && style.visibility !== 'hidden' && templatesContent.offsetParent !== null;
			} else if (hasTemplatesEditButtons) {
				// If we can see edit buttons with action=elementor in templates context, tab is visible
				isVisible = true;
			}
			
			// Trigger replacement when tab becomes visible OR if it's visible and has elementor links
			if (isVisible) {
				if (!lastVisibleState) {
					// //console.log('FSE Templates: Templates tab became visible');
					setTimeout(function() {
						replaceEditLinks();
						replacePreviewLinks();
					}, 300);
				} else {
					// ⭐ NEW: Also check if visible tab has elementor links or preview links
					var hasElementorLinks = document.querySelector('.x-templates a[href*="action=elementor"], [v-if*="templates"] a[href*="action=elementor"]');
					var hasPreviewLinks = document.querySelector('.x-templates a.ts-button.icon-only[href*="?p="]');
					if (hasElementorLinks || hasPreviewLinks) {
						// //console.log('FSE Templates: Visible tab has links, replacing...');
						debouncedReplaceEditLinks();
					}
				}
			}
			lastVisibleState = isVisible;
		}, 200);

		// ⭐ IMPROVED: Watch for DOM changes and replace links as Vue adds/updates them
		var observer = new MutationObserver(function(mutations) {
			var shouldReplace = false;

			mutations.forEach(function(mutation) {
				// Check if nodes were added (Vue rendered new templates)
				if (mutation.addedNodes.length > 0) {
					// Check if any added node contains action=elementor links or preview links
					for (var i = 0; i < mutation.addedNodes.length; i++) {
						var node = mutation.addedNodes[i];
						if (node.nodeType === 1) { // Element node
							if (node.matches && (node.matches('a[href*="action=elementor"]') || node.matches('a.ts-button.icon-only[href*="?p="]'))) {
								shouldReplace = true;
								break;
							}
							if (node.querySelector && (node.querySelector('a[href*="action=elementor"]') || node.querySelector('a.ts-button.icon-only[href*="?p="]'))) {
								shouldReplace = true;
								break;
							}
						}
					}
				}

				// Check if attributes changed (Vue updated href)
				if (mutation.type === 'attributes' && mutation.attributeName === 'href') {
					var target = mutation.target;
					if (target && target.href && (target.href.indexOf('action=elementor') !== -1 || target.href.indexOf('?p=') !== -1)) {
						shouldReplace = true;
					}
				}
			});

			if (shouldReplace) {
				// //console.log('FSE Templates: DOM mutation detected, replacing edit links...');
				debouncedReplaceEditLinks();
				// ⭐ FIX: Also call replacePreviewLinks directly when mutations are detected
				// This ensures preview links are replaced immediately when new post types are created
				// The function will check the mapping and only replace if available
				replacePreviewLinks();
			}
		});

		// Start observing the post type editor container
		var postTypeEditor = document.querySelector('.ts-form');
		if (postTypeEditor) {
			observer.observe(postTypeEditor, {
				childList: true,       // Watch for added/removed nodes
				subtree: true,          // Watch all descendants
				attributes: true,       // Watch for attribute changes
				attributeFilter: ['href'] // Only watch href attribute changes
			});
			// //console.log('FSE Templates: MutationObserver started on .ts-form');
		} else {
			// console.warn('FSE Templates: .ts-form element not found, watching document.body');
			observer.observe(document.body, {
				childList: true,
				subtree: true,
				attributes: true,
				attributeFilter: ['href']
			});
		}

		// Intercept AJAX responses to update mapping when new templates are created
		var originalXHROpen = XMLHttpRequest.prototype.open;
		var originalXHRSend = XMLHttpRequest.prototype.send;

		XMLHttpRequest.prototype.open = function(method, url) {
			this._url = url;
			return originalXHROpen.apply(this, arguments);
		};

		XMLHttpRequest.prototype.send = function() {
			var xhr = this;

			this.addEventListener('load', function() {
				// Check for custom template creation
				if (xhr._url && (xhr._url.indexOf('voxel_ajax_pte.create_custom_template') !== -1 || xhr._url.indexOf('action=pte.create_custom_template') !== -1)) {
					// //console.log('FSE Templates: Detected create_custom_template AJAX');
					try {
						var response = JSON.parse(xhr.responseText);
						// //console.log('FSE Templates: create_custom_template response:', response);

						if (response.success) {
							// Wait a moment for Vue to render, then replace links
							setTimeout(function() {
								replaceEditLinks();
								replacePreviewLinks();
							}, 500);
						}
					} catch (e) {
						// console.error('FSE Templates: Error parsing create_custom_template response:', e);
					}
				}

				// Check for base template creation
				if (xhr._url && (xhr._url.indexOf('voxel_ajax_pte.create_base_template') !== -1 || xhr._url.indexOf('action=pte.create_base_template') !== -1)) {
					// //console.log('FSE Templates: Detected create_base_template AJAX');
					try {
						var response = JSON.parse(xhr.responseText);
						// //console.log('FSE Templates: create_base_template response:', response);

						if (response.success) {
							// Wait longer for Vue to render new post types
							setTimeout(function() {
								replaceEditLinks();
								replacePreviewLinks();
							}, 1000);
							setTimeout(function() {
								replaceEditLinks();
								replacePreviewLinks();
							}, 2000);
						}
					} catch (e) {
						// console.error('FSE Templates: Error parsing create_base_template response:', e);
					}
				}

				// Check for base template deletion
				if (xhr._url && (xhr._url.indexOf('voxel_ajax_pte.delete_base_template') !== -1 || xhr._url.indexOf('action=pte.delete_base_template') !== -1)) {
					// //console.log('FSE Templates: Detected delete_base_template AJAX');
					try {
						var response = JSON.parse(xhr.responseText);
						// //console.log('FSE Templates: delete_base_template response:', response);
						// if (response.success) {
						// 	//console.log('FSE Templates: Base template deletion successful');
						// } else {
						// 	console.error('FSE Templates: Base template deletion failed:', response.message);
						// }
					} catch (e) {
						// console.error('FSE Templates: Error parsing delete_base_template response:', e);
					}
				}
			});

			return originalXHRSend.apply(this, arguments);
		};

		// Only override Post_Type_Config if it exists and we have template IDs
		<?php if ( ! empty( $mw_fse_template_ids ) && ! empty( $mw_fse_template_urls ) ) : ?>
		if ( window.Post_Type_Config && window.Post_Type_Config.templates && window.Post_Type_Options ) {
			// //console.log('FSE Templates: Original Voxel templates:', window.Post_Type_Config.templates);

			// Override template IDs with FSE template IDs
			var fseTemplateIds = <?php echo wp_json_encode( $mw_fse_template_ids ); ?>;
			var fseTemplateUrls = <?php echo wp_json_encode( $mw_fse_template_urls, JSON_FORCE_OBJECT ); ?>;

			// //console.log('FSE Templates: Initial mapping:', fseTemplateUrls);

			if ( fseTemplateIds.single ) {
				window.Post_Type_Config.templates.single = fseTemplateIds.single;
			}
			if ( fseTemplateIds.card ) {
				window.Post_Type_Config.templates.card = fseTemplateIds.card;
			}
			if ( fseTemplateIds.archive ) {
				window.Post_Type_Config.templates.archive = fseTemplateIds.archive;
			}
			if ( fseTemplateIds.form ) {
				window.Post_Type_Config.templates.form = fseTemplateIds.form;
			}

			// //console.log('FSE Templates: Overrode to FSE template IDs:', window.Post_Type_Config.templates);
		} else {
			// console.warn('FSE Templates: Post_Type_Config or Post_Type_Options not found - link replacement will still work');
		}
		<?php endif; ?>
		
		// //console.log('FSE Templates: All setup complete - link replacement active');
	})();
	</script>
	<?php
}, 31 ); // Priority 31 - runs AFTER Voxel's render_edit_screen (priority 30)

/**
 * Ensure icon picker loads on post type editor pages even without Elementor
 * 
 * Voxel's icon picker is only loaded when Elementor is active (priority 100),
 * but the post type editor needs it regardless. We load it at priority 50
 * (before Elementor's hook) to ensure it's available.
 * 
 * Evidence: themes/voxel/app/modules/elementor/controllers/elementor-controller.php:230-235
 * The icon picker template requires $config variable from Elementor\Icons_Manager
 * 
 * When Elementor is not active, we provide a fallback config that includes Line Awesome
 * if it's enabled in Voxel settings.
 */
add_action( 'admin_footer', function() {
	// Run on post type edit pages OR Gutenberg block editor pages
	$page = $_GET['page'] ?? '';
	$is_post_type_editor = strpos( $page, 'edit-post-type-' ) === 0;
	
	// Check if we're on a Gutenberg block editor page
	$screen = get_current_screen();
	$is_block_editor = $screen && method_exists( $screen, 'is_block_editor' ) && $screen->is_block_editor();
	
	// Only proceed if on post type editor or block editor
	if ( ! $is_post_type_editor && ! $is_block_editor ) {
		return;
	}
	
	// Check if icon picker was already loaded (avoid duplicates)
	static $icon_picker_loaded = false;
	if ( $icon_picker_loaded ) {
		return;
	}
	
	// Check if icon picker config already exists (loaded by Elementor controller)
	// Elementor's hook runs at priority 100, so if it already ran, skip
	if ( ! isset( $GLOBALS['voxel_icon_picker_loaded'] ) ) {
		// Get icon config - try Elementor first, fallback to Line Awesome config
		$config = [];
		if ( class_exists( '\Elementor\Plugin' ) ) {
			$config = \Elementor\Icons_Manager::get_icon_manager_tabs();
		} else {
			// Fallback: Build config with Line Awesome if enabled
			// Evidence: themes/voxel/app/modules/elementor/controllers/elementor-controller.php:237-280
			if ( \Voxel\get('settings.icons.line_awesome.enabled') ) {
				$base_url = trailingslashit( get_template_directory_uri() ) . 'assets/icons/line-awesome/';
				
				$config['la-regular'] = [
					'name' => 'la-regular',
					'label' => __( 'Line Awesome - Regular', 'voxel-backend' ),
					'url' => $base_url . 'line-awesome.css',
					'enqueue' => [ $base_url . 'line-awesome.css' ],
					'prefix' => 'la-',
					'displayPrefix' => 'lar',
					'labelIcon' => 'fab fa-font-awesome-alt',
					'ver' => '1.3.0',
					'fetchJson' => $base_url . 'line-awesome-regular.js',
					'native' => false,
				];
				
				$config['la-solid'] = [
					'name' => 'la-solid',
					'label' => __( 'Line Awesome - Solid', 'voxel-backend' ),
					'url' => $base_url . 'line-awesome.css',
					'enqueue' => [ $base_url . 'line-awesome.css' ],
					'prefix' => 'la-',
					'displayPrefix' => 'las',
					'labelIcon' => 'fab fa-font-awesome-alt',
					'ver' => '1.3.0',
					'fetchJson' => $base_url . 'line-awesome-solid.js',
					'native' => false,
				];
				
				$config['la-brands'] = [
					'name' => 'la-brands',
					'label' => __( 'Line Awesome - Brands', 'voxel-backend' ),
					'url' => $base_url . 'line-awesome.css',
					'enqueue' => [ $base_url . 'line-awesome.css' ],
					'prefix' => 'la-',
					'displayPrefix' => 'lab',
					'labelIcon' => 'fab fa-font-awesome-alt',
					'ver' => '1.3.0',
					'fetchJson' => $base_url . 'line-awesome-brands.js',
					'native' => false,
				];
			}
		}
		
		// Load icon picker template (requires $config variable)
		$template_path = locate_template( 'templates/backend/icon-picker.php' );
		if ( $template_path ) {
			require $template_path;
			$GLOBALS['voxel_icon_picker_loaded'] = true;
			$icon_picker_loaded = true;
		}
	}
}, 50 ); // Priority 50 - before Elementor's hook (priority 100), ensures it loads even without Elementor

/**
 * Fallback: Also hook into admin_footer to ensure script runs on all admin pages
 * This catches cases where the specific hook might not fire
 */
add_action( 'admin_footer', function() {
	// Only run on post type edit pages
	$page = $_GET['page'] ?? '';
	if ( strpos( $page, 'edit-post-type-' ) !== 0 ) {
		return;
	}
	
	// Check if script was already output (avoid duplicates)
	static $script_output = false;
	if ( $script_output ) {
		return;
	}
	
	// Only output if the main hook didn't fire (check if Post_Type_Config exists)
	// If it doesn't exist, output a minimal version
	?>
	<script type="text/javascript">
	if (typeof window.FSE_Templates_Loaded === 'undefined') {
		// //console.log('FSE Templates: Fallback script loading (admin_footer hook)');
		window.FSE_Templates_Loaded = true;
		
		// Minimal replacement function for edit links
		function replaceEditLinksFSE() {
			var editButtons = document.querySelectorAll('a[href*="post.php"][href*="action=elementor"]');
			var replacedCount = 0;
			editButtons.forEach(function(button) {
				var currentHref = button.getAttribute('href');
				if (currentHref) {
					var newHref = currentHref.replace('action=elementor', 'action=fse');
					button.setAttribute('href', newHref);
					replacedCount++;
				}
			});
			// if (replacedCount > 0) {
			// 	//console.log('FSE Templates (fallback): Replaced', replacedCount, 'edit links');
			// }
		}
		
		// ⭐ NEW: Minimal replacement function for preview links
		// Simply adds canvas=view parameter - no mapping needed!
		function replacePreviewLinksFSE() {
			var previewLinks = document.querySelectorAll('a.ts-button.icon-only[href*="?p="], a.ts-button.ts-outline.icon-only[href*="?p="]');
			var replacedCount = 0;
			
			// Titles of templates that are actually PAGES (should be skipped)
			var pageTitles = [
				'Create Post', 
				'Login & registration', 
				'Current plan', 
				'Orders page', 
				'Cart summary', 
				'Stripe Connect account', 
				'Newsfeed', 
				'Inbox', 
				'Post statistics', 
				'Privacy Policy', 
				'Terms & Conditions'
			];
			
			previewLinks.forEach(function(link) {
				var currentHref = link.getAttribute('href');
				if (!currentHref) return;
				
				// Skip if already has canvas=view
				if (currentHref.indexOf('canvas=view') !== -1) {
					return;
				}
				
				// Extract post ID
				var postIdMatch = currentHref.match(/[?&]p=(\d+)/);
				if (!postIdMatch) return;
				
				// ⭐ Check if this is a known Page based on title
				var card = link.closest('.x-template');
				if (card) {
					var titleEl = card.querySelector('h3');
					if (titleEl) {
						var title = titleEl.innerText.trim();
						if (pageTitles.indexOf(title) !== -1) {
							return; // Skip known pages
						}
					}
				}
				
				// Simply add canvas=view parameter
				var separator = currentHref.indexOf('?') !== -1 ? '&' : '?';
				var newHref = currentHref + separator + 'canvas=view';
				
				link.setAttribute('href', newHref);
				replacedCount++;
			});
			
			// if (replacedCount > 0) {
			// 	//console.log('FSE Templates (fallback): Added canvas=view to', replacedCount, 'preview links');
			// }
		}
		
		// Run immediately and periodically for both edit and preview links
		setTimeout(function() {
			replaceEditLinksFSE();
			replacePreviewLinksFSE();
		}, 100);
		setTimeout(function() {
			replaceEditLinksFSE();
			replacePreviewLinksFSE();
		}, 500);
		setTimeout(function() {
			replaceEditLinksFSE();
			replacePreviewLinksFSE();
		}, 1000);
		setInterval(function() {
			replaceEditLinksFSE();
			replacePreviewLinksFSE(); // Keep retrying until mapping is ready
		}, 2000);
		
		// Watch for clicks
		document.addEventListener('click', function(e) {
			if (e.target.closest('.ts-nav-item a, [data-tab]')) {
				setTimeout(function() {
					replaceEditLinksFSE();
					replacePreviewLinksFSE();
				}, 300);
			}
		}, true);
	}
	</script>
	<?php
}, 999 ); // Very late priority to run after everything else
