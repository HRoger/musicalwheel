<?php
declare(strict_types=1);

/**
 * Paid Listings Settings Integration for FSE Templates
 *
 * Hooks into Voxel's Paid Listings Settings page to replace
 * Elementor template edit links with FSE Site Editor links.
 *
 * @package VoxelFSE\Controllers\FSE_Templates
 * @since 1.0.8
 */

namespace VoxelFSE\Controllers\Templates;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Auto-create FSE template for pricing template and build URL mapping
 *
 * Uses current_screen hook because get_current_screen() is only available AFTER admin_init
 */
add_action( 'current_screen', function( $screen ) {
	if ( ! $screen ) {
		return;
	}

	// Only run on Paid Listings Settings page
	// Relaxed check to ensure we catch it regardless of strict ID format
	if ( strpos( $screen->id, 'voxel-paid-listings-settings' ) === false ) {
		// error_log( 'FSE Paid Listings: Skipping screen ' . $screen->id );
		return;
	}

//	error_log( 'FSE Paid Listings: Processing screen ' . $screen->id );

	// Get pricing template ID from Voxel config
	$settings = \Voxel\get( 'paid_listings.settings', [] );
	$pricing_template_id = isset( $settings['templates']['pricing'] ) ? (int) $settings['templates']['pricing'] : null;

	if ( ! $pricing_template_id ) {
		// No pricing template set yet
		return;
	}

	// Verify it's a valid Elementor template
	if ( get_post_type( $pricing_template_id ) !== 'elementor_library' ) {
		return;
	}

	// Create FSE template for pricing template
	// Use stable slug: voxel-pricing (matches content map in template-manager.php)
	$fse_template_id = Template_Manager::create_fse_template_for_design_menu( 
		'pricing',
		'Paid Listings: Pricing Plans'
	);

	if ( ! $fse_template_id ) {
//		error_log( 'FSE: FAILED to create FSE template for Pricing Plans template' );
		return;
	}

	// Check if meta already exists for this FSE template
	$existing_elementor_id = get_post_meta( $fse_template_id, '_voxel_source_elementor_id', true );
	
	// Only update meta if:
	// 1. Meta doesn't exist yet, OR
	// 2. Meta exists but points to a different Elementor ID (Voxel changed it)
	if ( empty( $existing_elementor_id ) || $existing_elementor_id != $pricing_template_id ) {
		update_post_meta( $fse_template_id, '_voxel_source_elementor_id', $pricing_template_id );
//		error_log( "FSE: Updated meta for Pricing Plans template {$fse_template_id}: _voxel_source_elementor_id = {$pricing_template_id} (was: {$existing_elementor_id})" );
	} else {
        // error_log( "FSE: Pricing Plans template {$fse_template_id} already has correct meta: _voxel_source_elementor_id = {$pricing_template_id}" );
	}

	// Get FSE Site Editor URL
	$fse_template_url = Template_Manager::get_site_editor_url( $fse_template_id );

	// Store in global for JavaScript
	global $mw_fse_paid_listings_template_url;
	$mw_fse_paid_listings_template_url = [
		'elementor_id' => $pricing_template_id,
		'fse_url' => $fse_template_url,
	];

//	error_log( "FSE: Created/reused Pricing Plans template - Elementor ID: {$pricing_template_id}, FSE ID: {$fse_template_id}, URL: {$fse_template_url}" );
} );

	/**
	 * Output JavaScript to replace Edit Template links
	 *
	 * Uses admin_footer hook to output script before wp_footer where enqueued scripts load
	 * 
	 * Pattern: Replace action=elementor with action=fse, let PHP interceptor handle redirect
	 * (Same pattern as vue-integration.php for post types)
	 */
	add_action( 'admin_footer', function() {
		global $mw_fse_paid_listings_template_url;

		$screen = get_current_screen();
		if ( ! $screen || strpos( $screen->id, 'voxel-paid-listings-settings' ) === false ) {
			return;
		}

		// Note: We don't need the template URL mapping anymore
		// We just replace action=elementor with action=fse, and the PHP interceptor handles it
		?>
		<script type="text/javascript">
		(function() {
			/**
			 * Replace Elementor URLs with action=fse in edit template buttons
			 * Same pattern as vue-integration.php
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

					// Skip if already replaced
					if (button.getAttribute('data-fse-replaced') === 'true') {
						return;
					}

					// Simply replace action=elementor with action=fse
					// The PHP interceptor (fse-action-handler.php) will catch action=fse and redirect
					var newHref = currentHref.replace('action=elementor', 'action=fse');
					
					button.setAttribute('href', newHref);
					button.setAttribute('data-fse-replaced', 'true');
					replacedCount++;
				});

				return replacedCount;
			}

			/**
			 * Main replacement function - runs on container
			 */
			function replaceEditTemplateLink() {
				var container = document.getElementById('vx-settings-paid-listings');
				if (!container) {
					return;
				}

				replaceEditLinks(container);
			}

			// Run immediately (in case Vue has already rendered)
			replaceEditTemplateLink();

			// Watch for Vue.js DOM changes
			var observer = new MutationObserver(function(mutations) {
				replaceEditTemplateLink();
			});

			// Start observing when Vue app is ready
			var vueApp = document.querySelector('#vx-settings-paid-listings');
			if ( vueApp ) {
				observer.observe(vueApp, {
					childList: true,
					subtree: true,
					attributes: true,
					attributeFilter: ['href']
				});
			}

			// Also run after a short delay to catch late renders
			setTimeout(replaceEditTemplateLink, 500);
			setTimeout(replaceEditTemplateLink, 1000);
			setTimeout(replaceEditTemplateLink, 2000);
		})();
		</script>
		<?php
	} );

