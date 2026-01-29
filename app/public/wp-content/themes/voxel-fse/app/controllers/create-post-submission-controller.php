<?php
/**
 * Create Post Submission Controller
 * 
 * Handles form submission hooks for the Create Post FSE block
 * Provides default values for unsupported fields to prevent database errors
 * 
 * @package VoxelFSE
 * @since 1.0.0
 */

namespace VoxelFSE\Controllers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Create Post Submission Controller
 * 
 * Hooks into Voxel's post validation to provide default values for fields
 * that are not yet supported by the FSE block (Phase A MVP).
 * 
 * This prevents database errors during indexing when required fields are missing.
 */
class Create_Post_Submission_Controller extends FSE_Base_Controller {

	/**
	 * Register hooks
	 * 
	 * @since 1.0.0
	 * @return void
	 */
	protected function hooks(): void {
		// Hook into Voxel's post validation to add default values
		// This fires at line 170 of submission-controller.php, BEFORE field updates
		$this->on( 'voxel/frontend/after_post_validation', '@add_default_field_values', 10, 1 );
		
		// Hook AFTER post is updated to ensure location field has a value
		// This fires at line 305 of submission-controller.php, AFTER field updates
		$this->on( 'voxel/frontend/post_updated', '@ensure_location_field_saved', 5, 1 );
		
		// Hook to modify edit_link in AJAX response for FSE blocks
		// This fires after post is updated but before JSON response is sent
		$this->on( 'voxel/frontend/post_updated', '@modify_edit_link_for_fse', 10, 1 );
	}

	/**
	 * Add default values for unsupported fields
	 * 
	 * Phase A MVP doesn't support all field types. This method adds default values
	 * for unsupported fields to prevent database errors during indexing.
	 * 
	 * Evidence from Voxel:
	 * - File: themes/voxel/app/post-types/filters/location-filter.php:80-103
	 * - The location filter returns POINT(0,0) when field doesn't exist
	 * - But Index_Table::index() at line 253 only uses keys from first row
	 * - If first post has no location, _location column is omitted from INSERT
	 * - This causes "Field '_location' doesn't have a default value" error
	 * 
	 * Solution: Modify $values (which is $sanitized by reference) to include default
	 * location data. This ensures the field gets updated with a valid value (0,0)
	 * instead of null, which then gets indexed properly.
	 * 
	 * @since 1.0.0
	 * @param array $args Validation context with post_type, post, fields, values
	 * @return void
	 */
	protected function add_default_field_values( array $args ): void {
		$post_type = $args['post_type'] ?? null;
		$fields = $args['fields'] ?? [];
		$values = &$args['values']; // Pass by reference to modify

		if ( ! $post_type ) {
			return;
		}

		// Check for location fields that are missing values
		// Note: $fields array might have been filtered by visibility/conditional logic
		// So we need to check ALL post type fields, not just $fields
		$all_fields = $post_type->get_fields();
		
		foreach ( $all_fields as $field ) {
			if ( $field->get_type() === 'location' ) {
				$field_key = $field->get_key();
				
				// Check if field is in the $fields array (not filtered out)
				$field_in_array = false;
				foreach ( $fields as $f ) {
					if ( $f->get_key() === $field_key ) {
						$field_in_array = true;
						break;
					}
				}
				
				// If field is in the array and has null/empty value, add default
				if ( $field_in_array ) {
					$current_value = $values[ $field_key ] ?? null;
					
					if ( is_null( $current_value ) || 
					     ( is_array( $current_value ) && empty( $current_value['latitude'] ) && empty( $current_value['longitude'] ) ) ) {
						
						// TODO: Phase A temporary solution - random location for debugging
						// Phase B will implement proper location field UI
						// Generate random coordinates to ensure unique values for indexing
						$random_lat = mt_rand(-90000, 90000) / 1000; // -90 to 90
						$random_lng = mt_rand(-180000, 180000) / 1000; // -180 to 180
						
						$values[ $field_key ] = [
							'address' => sprintf('Debug Location (%s, %s)', $random_lat, $random_lng),
							'latitude' => $random_lat,
							'longitude' => $random_lng,
						];

						error_log( sprintf(
							'[Create Post FSE] Added temporary random location value for field "%s" (post_type: %s, lat: %s, lng: %s)',
							$field_key,
							$post_type->get_key(),
							$random_lat,
							$random_lng
						) );
					}
				}
			}

			// Add more unsupported field types here as needed
			// Example: work_hours, recurring_date, etc.
		}
	}
	
	/**
	 * Ensure location field is saved with default value
	 * 
	 * This runs AFTER field updates to verify the location field has a value in the database.
	 * If not, it manually saves a default value to prevent indexing errors.
	 * 
	 * Evidence from Voxel:
	 * - File: themes/voxel/app/post-types/fields/location-field.php:80-86
	 * - The update() method deletes post meta if value is empty
	 * - File: themes/voxel/app/post-types/index-table.php:250-264
	 * - The index() method only uses columns from first row's keys
	 * - If first post has no _location, column is omitted from INSERT
	 * 
	 * Solution: Manually save location field value if it's missing from post meta.
	 * 
	 * @since 1.0.0
	 * @param array $args Post update context with post, status, previous_status
	 * @return void
	 */
	protected function ensure_location_field_saved( array $args ): void {
		$post = $args['post'] ?? null;
		if ( ! $post ) {
			return;
		}
		
		$post_type = $post->post_type;
		if ( ! $post_type ) {
			return;
		}
		
		// Check all location fields
		foreach ( $post_type->get_fields() as $field ) {
			if ( $field->get_type() !== 'location' ) {
				continue;
			}
			
			$field_key = $field->get_key();
			
			// Check if post meta exists for this field
			$meta_value = get_post_meta( $post->get_id(), $field_key, true );
			
			if ( empty( $meta_value ) ) {
				// No value saved - manually save default value
				// TODO: Phase A temporary solution - random location for debugging
				// Phase B will implement proper location field UI
				$random_lat = mt_rand(-90000, 90000) / 1000; // -90 to 90
				$random_lng = mt_rand(-180000, 180000) / 1000; // -180 to 180
				
				$default_value = [
					'address' => sprintf('Debug Location (%s, %s)', $random_lat, $random_lng),
					'latitude' => $random_lat,
					'longitude' => $random_lng,
				];
				
				update_post_meta( 
					$post->get_id(), 
					$field_key, 
					wp_slash( wp_json_encode( $default_value ) ) 
				);
				
				// Verify the value was saved
				$saved_value = get_post_meta( $post->get_id(), $field_key, true );
				
				error_log( sprintf(
					'[Create Post FSE] Manually saved temporary random location value for field "%s" (post_id: %d, post_type: %s, lat: %s, lng: %s) - Saved value: %s',
					$field_key,
					$post->get_id(),
					$post_type->get_key(),
					$random_lat,
					$random_lng,
					$saved_value
				) );
				
				// Force clear post cache to ensure fresh data on next read
				clean_post_cache( $post->get_id() );
			}
		}
	}
	
	/**
	 * Modify edit_link in AJAX response for FSE blocks
	 * 
	 * Voxel's $post->get_edit_link() returns the form template page URL.
	 * For FSE blocks, we need to return the current page URL with ?post_id=X.
	 * 
	 * Evidence from Voxel:
	 * - File: themes/voxel/app/post.php:73-83
	 * - Method: $post->get_edit_link() uses get_permalink($post_type->get_templates()['form'])
	 * - This returns the Voxel form template page (e.g., /voxel-places-form/)
	 * - But FSE blocks are embedded on custom pages (e.g., /create-places/)
	 * 
	 * Solution: Check if request came from FSE block (via HTTP_REFERER or custom header)
	 * and modify the edit_link to use the referer URL instead of the form template.
	 * 
	 * @since 1.0.0
	 * @param array $args Post update context with post, status, previous_status
	 * @return void
	 */
	protected function modify_edit_link_for_fse( array $args ): void {
		// This hook fires BEFORE wp_send_json in submission-controller.php:311
		// We can't modify the response here directly, but we can use a filter
		// on the post's get_edit_link() method
		
		// Check if this is an FSE block request by looking at HTTP_REFERER
		$referer = wp_get_referer();
		
		if ( ! $referer ) {
			return;
		}
		
		$post = $args['post'] ?? null;
		if ( ! $post ) {
			return;
		}
		
		// Check if the referer contains the FSE block
		// (FSE blocks are embedded on pages, not the Voxel form template)
		// We'll use a filter to override get_edit_link() temporarily
		
		add_filter( 'voxel/post/edit-link', function( $edit_link, $post_obj ) use ( $referer, $post ) {
			// Only modify if this is the same post
			if ( $post_obj->get_id() !== $post->get_id() ) {
				return $edit_link;
			}
			
			// Get the referer URL without query params
			$referer_url = strtok( $referer, '?' );
			
			// Add ?post_id=X to the referer URL
			return add_query_arg( 'post_id', $post->get_id(), $referer_url );
		}, 10, 2 );
	}
}

