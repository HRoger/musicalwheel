<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Data_Groups;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Post_Data_Group extends Base_Data_Group {

	protected $post_id;

	public function __construct( ?int $post_id = null ) {
		$this->post_id = $post_id ?: get_the_ID();
	}

	public function resolve_property( array $property_path, mixed $token = null ): ?string {
		if ( empty( $this->post_id ) ) {
			return '';
		}

		$post = get_post( $this->post_id );
		if ( ! $post ) {
			return '';
		}

		// Ensure property_path is valid and get first element
		if ( empty( $property_path ) || ! is_array( $property_path ) ) {
			return '';
		}

		$key = strtolower( trim( (string) ( $property_path[0] ?? '' ) ) );
		// Strip Voxel's native colon prefix for built-in fields (e.g. :title → title)
		$key = ltrim( $key, ':' );

		if ( empty( $key ) ) {
			return '';
		}

		switch ( $key ) {
			case 'id':
				return (string) absint( $this->post_id );
			case 'title':
				// Use post object property directly to avoid filter issues
				$title = isset( $post->post_title ) ? $post->post_title : '';
				// Apply the_title filter manually for consistency with WordPress
				if ( ! empty( $title ) ) {
					$title = apply_filters( 'the_title', $title, $this->post_id );
				}
				// Ensure it's a string
				if ( ! is_string( $title ) ) {
					if ( is_array( $title ) ) {
						// If somehow an array, join it
						$title = implode( '', $title );
					} else {
						$title = (string) $title;
					}
				}
				return $title;
			case 'content':
				// Use post object property directly
				$content = isset( $post->post_content ) ? $post->post_content : '';
				// Apply the_content filter, but temporarily remove block rendering to prevent recursion
				if ( ! empty( $content ) ) {
					// Remove do_blocks from the_content filter to prevent infinite loops
					$priority = has_filter( 'the_content', 'do_blocks' );
					if ( false !== $priority ) {
						remove_filter( 'the_content', 'do_blocks', $priority );
					}

					$content = apply_filters( 'the_content', $content );

					// Re-add do_blocks filter
					if ( false !== $priority ) {
						add_filter( 'the_content', 'do_blocks', $priority );
					}
				}
				// Ensure it's a string
				if ( ! is_string( $content ) ) {
					if ( is_array( $content ) ) {
						$content = implode( '', $content );
					} else {
						$content = (string) $content;
					}
				}
				return $content;
			case 'permalink':
			case 'url':
				$url = get_permalink( $this->post_id );
				if ( ! is_string( $url ) ) {
					$url = '';
				}
				return $url;
			case 'date':
				$date = isset( $post->post_date ) ? $post->post_date : '';
				return is_string( $date ) ? $date : '';
			case 'modified_date':
				$date = isset( $post->post_modified ) ? $post->post_modified : '';
				return is_string( $date ) ? $date : '';
			case 'status':
				$status = isset( $post->post_status ) ? $post->post_status : '';
				$sub_key = ! empty( $property_path[1] ) ? strtolower( trim( ltrim( (string) $property_path[1], ':' ) ) ) : '';
				if ( $sub_key === 'label' ) {
					// Return human-readable status label (e.g. "Published", "Draft")
					$status_obj = get_post_status_object( $status );
					return $status_obj ? $status_obj->label : ucfirst( $status );
				}
				return $status;
			case 'excerpt':
				$excerpt = isset( $post->post_excerpt ) ? $post->post_excerpt : '';
				if ( empty( $excerpt ) && ! empty( $post->post_content ) ) {
					$excerpt = wp_trim_words( $post->post_content, 55, '...' );
				}
				return is_string( $excerpt ) ? $excerpt : '';
			case 'author':
				$author_id = isset( $post->post_author ) ? (int) $post->post_author : 0;
				if ( ! $author_id ) {
					return '';
				}
				$author = get_userdata( $author_id );
				return $author ? $author->display_name : '';
			case 'slug':
				return isset( $post->post_name ) ? $post->post_name : '';
			default:
				// Voxel custom post fields — stored as post meta.
				// Supports sub-properties like @post(gallery.ids), @post(gallery.url), @post(gallery.id)
				//
				// How Voxel stores file/image/gallery fields:
				//   update_post_meta($post_id, $field_key, join(',', $file_ids))
				//   e.g. get_post_meta($id, 'gallery', true) → "96,97,98"
				//
				// Evidence: themes/voxel/app/post-types/fields/file-field.php:77 (update)
				// Evidence: themes/voxel/app/post-types/fields/file-field.php:89-93 (get_value_from_post)
				// Evidence: themes/voxel/app/post-types/fields/file-field.php:139-184 (dynamic_data exports)
				return $this->resolve_voxel_field( $key, array_slice( $property_path, 1 ) );
		}
	}

	/**
	 * Resolve a Voxel custom post field with optional sub-property.
	 *
	 * Matches Voxel's dynamic_data() exports for File_Field (file/image/gallery):
	 *   - ids  → comma-separated attachment IDs (e.g. "96,97,98")
	 *   - id   → first attachment ID
	 *   - url  → URL of first attachment
	 *   - name → filename of first attachment
	 *   - (no sub-property) → raw meta value
	 *
	 * Also handles any other post meta field as a simple string fallback.
	 *
	 * @param string $field_key  The field key (e.g. "gallery", "logo", "cover_image").
	 * @param array  $sub_path   Remaining property path after the field key (e.g. ["ids"]).
	 * @return string Resolved value.
	 */
	protected function resolve_voxel_field( string $field_key, array $sub_path ): string {
		// Try resolving through Voxel's field API for complex fields.

		// 1. Product field addons: @post(product.addon_key.price)
		// Evidence: themes/voxel/app/post-types/fields/product-field/exports.php:109-168
		if ( count( $sub_path ) >= 2 && class_exists( '\\Voxel\\Post' ) ) {
			$result = $this->resolve_product_field_addon( $field_key, $sub_path );
			if ( $result !== null ) {
				return $result;
			}
		}

		// 2. Taxonomy field sub-properties: @post(amenities.icon), @post(amenities.label)
		// Evidence: themes/voxel/app/post-types/fields/taxonomy-field/exports.php:14-24
		if ( ! empty( $sub_path ) && class_exists( '\\Voxel\\Post' ) ) {
			$result = $this->resolve_taxonomy_field( $field_key, $sub_path );
			if ( $result !== null ) {
				return $result;
			}
		}

		// 3. Location field sub-properties: @post(location.address), @post(location.lat)
		// Evidence: themes/voxel/app/post-types/fields/location-field.php:169-233
		if ( ! empty( $sub_path ) && class_exists( '\\Voxel\\Post' ) ) {
			$result = $this->resolve_location_field( $field_key, $sub_path );
			if ( $result !== null ) {
				return $result;
			}
		}

		// 4. Post relation field: @post(related_posts.title), @post(author_relation.permalink)
		// Evidence: themes/voxel/app/post-types/fields/post-relation-field/exports.php:15-90
		if ( ! empty( $sub_path ) && class_exists( '\\Voxel\\Post' ) ) {
			$result = $this->resolve_post_relation_field( $field_key, $sub_path );
			if ( $result !== null ) {
				return $result;
			}
		}

		// 5. Work hours field: @post(work_hours.status), @post(work_hours.status_label)
		// Evidence: themes/voxel/app/post-types/fields/work-hours-field.php:262-350
		if ( ! empty( $sub_path ) && class_exists( '\\Voxel\\Post' ) ) {
			$result = $this->resolve_work_hours_field( $field_key, $sub_path );
			if ( $result !== null ) {
				return $result;
			}
		}

		// 6. Date field sub-properties: @post(event_date.date), @post(event_date.is_finished)
		// Evidence: themes/voxel/app/post-types/fields/date-field.php:108-131
		if ( ! empty( $sub_path ) && class_exists( '\\Voxel\\Post' ) ) {
			$result = $this->resolve_date_field( $field_key, $sub_path );
			if ( $result !== null ) {
				return $result;
			}
		}

		// 7. Recurring date field: @post(event_dates.upcoming.start)
		// Evidence: themes/voxel/app/post-types/fields/recurring-date-field.php:344-427
		if ( ! empty( $sub_path ) && class_exists( '\\Voxel\\Post' ) ) {
			$result = $this->resolve_recurring_date_field( $field_key, $sub_path );
			if ( $result !== null ) {
				return $result;
			}
		}

		$meta_value = get_post_meta( $this->post_id, $field_key, true );

		if ( $meta_value === '' || $meta_value === false ) {
			return '';
		}

		$sub_key = ! empty( $sub_path ) ? strtolower( trim( (string) $sub_path[0] ) ) : '';

		switch ( $sub_key ) {
			case 'ids':
				// Return all attachment IDs as comma-separated string
				// Evidence: file-field.php:156-163
				$ids = array_filter( array_map( 'absint', explode( ',', (string) $meta_value ) ) );
				return ! empty( $ids ) ? implode( ',', $ids ) : '';

			case 'id':
				// Return first attachment ID
				// Evidence: file-field.php:146-148 (loopable), 169-171 (single)
				$ids = array_filter( array_map( 'absint', explode( ',', (string) $meta_value ) ) );
				return ! empty( $ids ) ? (string) $ids[0] : '';

			case 'url':
				// Return URL of first attachment
				// Evidence: file-field.php:149-151 (loopable), 173-175 (single)
				$ids = array_filter( array_map( 'absint', explode( ',', (string) $meta_value ) ) );
				if ( empty( $ids ) ) {
					return '';
				}
				$url = wp_get_attachment_url( $ids[0] );
				return $url ? $url : '';

			case 'name':
				// Return filename of first attachment
				// Evidence: file-field.php:152-155 (loopable), 177-180 (single)
				$ids = array_filter( array_map( 'absint', explode( ',', (string) $meta_value ) ) );
				if ( empty( $ids ) ) {
					return '';
				}
				$attachment = get_post( $ids[0] );
				if ( ! $attachment ) {
					return '';
				}
				$file = get_attached_file( $attachment->ID );
				return $file ? wp_basename( $file ) : '';

			default:
				// No sub-property — return raw meta value as string
				return (string) $meta_value;
		}
	}

	/**
	 * Resolve product field addon properties via Voxel's API.
	 *
	 * Handles paths like: @post(product_field.addon_key.property)
	 * where property is one of: label, price, min, max
	 *
	 * Evidence: themes/voxel/app/post-types/fields/product-field/exports.php:109-168
	 *
	 * @param string $field_key The product field key.
	 * @param array  $sub_path  Remaining path: ['addon_key', 'property'].
	 * @return string|null Resolved value, or null if not a product field addon.
	 */
	protected function resolve_product_field_addon( string $field_key, array $sub_path ): ?string {
		try {
			$post = \Voxel\Post::get( $this->post_id );
			if ( ! $post ) {
				return null;
			}

			$field = $post->get_field( $field_key );
			if ( ! ( $field instanceof \Voxel\Post_Types\Fields\Product_Field ) ) {
				return null;
			}

			$addon_key = $sub_path[0];
			$property  = strtolower( trim( (string) ( $sub_path[1] ?? '' ) ) );

			$addons_field = $field->get_product_field( 'addons' );
			if ( ! $addons_field ) {
				return '';
			}

			$addon = $addons_field->get_addon( $addon_key );
			if ( ! $addon || $addon->get_type() !== 'numeric' || ! $addon->is_active() ) {
				return '';
			}

			if ( $property === 'label' ) {
				return (string) $addon->get_label();
			}

			$value = $addon->get_value();
			if ( ! is_array( $value ) ) {
				return '';
			}

			switch ( $property ) {
				case 'price':
					return (string) ( $value['price'] ?? '' );
				case 'min':
					return (string) ( $value['min'] ?? '' );
				case 'max':
					return (string) ( $value['max'] ?? '' );
				default:
					return '';
			}
		} catch ( \Throwable $e ) {
			return null;
		}
	}

	/**
	 * Resolve taxonomy field sub-properties via Voxel's field API.
	 *
	 * Handles paths like: @post(amenities.icon), @post(categories.label)
	 * Taxonomy fields in Voxel store terms via WordPress taxonomy API (get_the_terms).
	 * Each term has properties (icon, label, slug, color, etc.) exposed via Term_Data_Group.
	 *
	 * Returns the first term's sub-property value (matching Voxel's non-loop behavior).
	 * In a loop context, the loop system iterates over all terms.
	 *
	 * Evidence: themes/voxel/app/post-types/fields/taxonomy-field/exports.php:14-24
	 * Evidence: themes/voxel/app/post-types/fields/taxonomy-field.php:239-251
	 *
	 * @param string $field_key The taxonomy field key (e.g. "amenities").
	 * @param array  $sub_path  Remaining path after the field key (e.g. ["icon"]).
	 * @return string|null Resolved value, or null if not a taxonomy field.
	 */
	protected function resolve_taxonomy_field( string $field_key, array $sub_path ): ?string {
		try {
			$post = \Voxel\Post::get( $this->post_id );
			if ( ! $post ) {
				return null;
			}

			$field = $post->get_field( $field_key );
			if ( ! ( $field instanceof \Voxel\Post_Types\Fields\Taxonomy_Field ) ) {
				return null;
			}

			// Get terms assigned to this post for this taxonomy field
			$taxonomy_key = $field->get_prop( 'taxonomy' );
			if ( empty( $taxonomy_key ) ) {
				return null;
			}

			$terms = get_the_terms( $this->post_id, $taxonomy_key );
			if ( empty( $terms ) || is_wp_error( $terms ) ) {
				return '';
			}

			// Use first term's sub-property (non-loop context)
			$first_term = $terms[0];
			$term_group = Term_Data_Group::get( $first_term->term_id, $first_term->taxonomy );
			$result = $term_group->resolve_property( $sub_path );
			return $result;
		} catch ( \Throwable $e ) {
			return null;
		}
	}

	/**
	 * Resolve location field sub-properties.
	 *
	 * Handles: @post(location.address), @post(location.lat), @post(location.lng),
	 *          @post(location.short_address), @post(location.medium_address), @post(location.long_address)
	 *
	 * Evidence: themes/voxel/app/post-types/fields/location-field.php:169-233
	 *
	 * @param string $field_key The location field key.
	 * @param array  $sub_path  Remaining path (e.g. ["address"]).
	 * @return string|null Resolved value, or null if not a location field.
	 */
	protected function resolve_location_field( string $field_key, array $sub_path ): ?string {
		try {
			$post = \Voxel\Post::get( $this->post_id );
			if ( ! $post ) {
				return null;
			}

			$field = $post->get_field( $field_key );
			if ( ! ( $field instanceof \Voxel\Post_Types\Fields\Location_Field ) ) {
				return null;
			}

			$meta_value = get_post_meta( $this->post_id, $field_key, true );
			$value = is_array( $meta_value ) ? $meta_value : (array) json_decode( (string) $meta_value, true );
			if ( empty( $value ) ) {
				return '';
			}

			$sub_key = strtolower( trim( (string) ( $sub_path[0] ?? '' ) ) );

			switch ( $sub_key ) {
				case 'address':
					return (string) ( $value['address'] ?? '' );
				case 'lat':
				case 'latitude':
					return (string) ( $value['latitude'] ?? '' );
				case 'lng':
				case 'longitude':
					return (string) ( $value['longitude'] ?? '' );
				case 'short_address':
					$parts = explode( ',', (string) ( $value['address'] ?? '' ) );
					return trim( $parts[0] ?? '' );
				case 'medium_address':
					$parts = explode( ',', (string) ( $value['address'] ?? '' ) );
					return implode( ', ', array_map( 'trim', array_slice( $parts, 0, 2 ) ) );
				case 'long_address':
					$parts = explode( ',', (string) ( $value['address'] ?? '' ) );
					return implode( ', ', array_map( 'trim', array_slice( $parts, 0, -1 ) ) );
				default:
					return '';
			}
		} catch ( \Throwable $e ) {
			return null;
		}
	}

	/**
	 * Resolve post relation field sub-properties.
	 *
	 * Handles: @post(related_field.title), @post(related_field.permalink)
	 * Returns the first related post's property (non-loop context).
	 *
	 * Evidence: themes/voxel/app/post-types/fields/post-relation-field/exports.php:15-90
	 *
	 * @param string $field_key The relation field key.
	 * @param array  $sub_path  Remaining path (e.g. [":title"]).
	 * @return string|null Resolved value, or null if not a post relation field.
	 */
	protected function resolve_post_relation_field( string $field_key, array $sub_path ): ?string {
		try {
			$post = \Voxel\Post::get( $this->post_id );
			if ( ! $post ) {
				return null;
			}

			$field = $post->get_field( $field_key );
			if ( ! ( $field instanceof \Voxel\Post_Types\Fields\Post_Relation_Field ) ) {
				return null;
			}

			// Get related post IDs from meta
			$related_ids = $field->get_value();
			if ( empty( $related_ids ) || ! is_array( $related_ids ) ) {
				return '';
			}

			// Use first related post (non-loop context)
			$related_id = (int) $related_ids[0];
			if ( $related_id <= 0 ) {
				return '';
			}

			$related_group = new self( $related_id );
			return $related_group->resolve_property( $sub_path );
		} catch ( \Throwable $e ) {
			return null;
		}
	}

	/**
	 * Resolve work hours field sub-properties.
	 *
	 * Handles: @post(work_hours.status), @post(work_hours.status_label)
	 *
	 * Evidence: themes/voxel/app/post-types/fields/work-hours-field.php:262-350
	 *
	 * @param string $field_key The work hours field key.
	 * @param array  $sub_path  Remaining path (e.g. ["status"]).
	 * @return string|null Resolved value, or null if not a work hours field.
	 */
	protected function resolve_work_hours_field( string $field_key, array $sub_path ): ?string {
		try {
			$post = \Voxel\Post::get( $this->post_id );
			if ( ! $post ) {
				return null;
			}

			$field = $post->get_field( $field_key );
			if ( ! ( $field instanceof \Voxel\Post_Types\Fields\Work_Hours_Field ) ) {
				return null;
			}

			$meta_value = get_post_meta( $this->post_id, $field_key, true );
			$groups = is_array( $meta_value ) ? $meta_value : (array) json_decode( (string) $meta_value, true );
			if ( empty( $groups ) ) {
				return '';
			}

			$sub_key = strtolower( trim( (string) ( $sub_path[0] ?? '' ) ) );

			// Build daily schedule from groups
			$schedule = [];
			foreach ( $groups as $group ) {
				if ( ! is_array( $group ) || empty( $group['days'] ) ) {
					continue;
				}
				foreach ( (array) $group['days'] as $day ) {
					$schedule[ $day ] = [
						'status' => $group['status'] ?? 'closed',
						'hours'  => $group['hours'] ?? [],
					];
				}
			}

			// Weekday keys indexed by PHP's date('w') (0=Sun, 1=Mon, ...)
			$weekday_keys = [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ];

			if ( $sub_key === 'status' || $sub_key === 'status_label' ) {
				// Determine current day's status
				$timezone = wp_timezone();
				$now      = new \DateTime( 'now', $timezone );
				$today    = $weekday_keys[ (int) $now->format( 'w' ) ];
				$today_schedule = $schedule[ $today ] ?? null;

				if ( ! $today_schedule ) {
					$status = 'not_available';
				} else {
					$raw_status = $today_schedule['status'];
					if ( $raw_status === 'hours' ) {
						// Check if currently within any hour range
						$current_time = $now->format( 'H:i' );
						$is_open = false;
						foreach ( (array) $today_schedule['hours'] as $slot ) {
							$from = $slot['from'] ?? '';
							$to   = $slot['to'] ?? '';
							if ( $from && $to && $current_time >= $from && $current_time <= $to ) {
								$is_open = true;
								break;
							}
						}
						$status = $is_open ? 'open' : 'closed';
					} else {
						$status = $raw_status;
					}
				}

				if ( $sub_key === 'status' ) {
					return $status;
				}

				// status_label: human-readable version
				$labels = [
					'open'              => __( 'Open', 'voxel' ),
					'closed'            => __( 'Closed', 'voxel' ),
					'appointments_only' => __( 'Appointments only', 'voxel' ),
					'not_available'     => __( 'Not available', 'voxel' ),
				];
				return $labels[ $status ] ?? ucfirst( str_replace( '_', ' ', $status ) );
			}

			// Per-weekday access: @post(work_hours.mon.schedule_key)
			$day_keys = array_flip( $weekday_keys );
			if ( isset( $schedule[ $sub_key ] ) ) {
				$day_data = $schedule[ $sub_key ];
				$day_sub  = strtolower( trim( (string) ( $sub_path[1] ?? '' ) ) );

				if ( $day_sub === 'schedule_key' ) {
					return (string) ( $day_data['status'] ?? '' );
				}
				if ( $day_sub === 'schedule_label' ) {
					$s = $day_data['status'] ?? '';
					$labels = [
						'hours'             => __( 'Hours', 'voxel' ),
						'open'              => __( 'Open', 'voxel' ),
						'closed'            => __( 'Closed', 'voxel' ),
						'appointments_only' => __( 'Appointments only', 'voxel' ),
					];
					return $labels[ $s ] ?? ucfirst( str_replace( '_', ' ', $s ) );
				}

				return '';
			}

			return '';
		} catch ( \Throwable $e ) {
			return null;
		}
	}

	/**
	 * Resolve date field sub-properties.
	 *
	 * Handles: @post(event_date.date), @post(event_date.is_finished)
	 *
	 * Evidence: themes/voxel/app/post-types/fields/date-field.php:108-131
	 *
	 * @param string $field_key The date field key.
	 * @param array  $sub_path  Remaining path (e.g. ["is_finished"]).
	 * @return string|null Resolved value, or null if not a date field.
	 */
	protected function resolve_date_field( string $field_key, array $sub_path ): ?string {
		try {
			$post = \Voxel\Post::get( $this->post_id );
			if ( ! $post ) {
				return null;
			}

			$field = $post->get_field( $field_key );
			if ( ! ( $field instanceof \Voxel\Post_Types\Fields\Date_Field ) ) {
				return null;
			}

			$meta_value = get_post_meta( $this->post_id, $field_key, true );
			if ( empty( $meta_value ) ) {
				return '';
			}

			$sub_key = strtolower( trim( (string) ( $sub_path[0] ?? '' ) ) );

			if ( $sub_key === 'date' ) {
				return (string) $meta_value;
			}

			if ( $sub_key === 'is_finished' ) {
				$timestamp = strtotime( (string) $meta_value );
				if ( ! $timestamp ) {
					return '';
				}
				$timezone = wp_timezone();
				$date_obj = new \DateTime( gmdate( 'Y-m-d H:i:s', $timestamp ), $timezone );
				$now      = new \DateTime( 'now', $timezone );
				return $date_obj < $now ? '1' : '';
			}

			return '';
		} catch ( \Throwable $e ) {
			return null;
		}
	}

	/**
	 * Resolve recurring date field sub-properties.
	 *
	 * Handles: @post(event_dates.upcoming.start), @post(event_dates.upcoming.end)
	 *
	 * Evidence: themes/voxel/app/post-types/fields/recurring-date-field.php:344-427
	 *
	 * @param string $field_key The recurring date field key.
	 * @param array  $sub_path  Remaining path (e.g. ["upcoming", "start"]).
	 * @return string|null Resolved value, or null if not a recurring date field.
	 */
	protected function resolve_recurring_date_field( string $field_key, array $sub_path ): ?string {
		try {
			$post = \Voxel\Post::get( $this->post_id );
			if ( ! $post ) {
				return null;
			}

			$field = $post->get_field( $field_key );
			if ( ! ( $field instanceof \Voxel\Post_Types\Fields\Recurring_Date_Field ) ) {
				return null;
			}

			$meta_value = get_post_meta( $this->post_id, $field_key, true );
			$dates = is_array( $meta_value ) ? $meta_value : (array) json_decode( (string) $meta_value, true );
			if ( empty( $dates ) ) {
				return '';
			}

			$group_key = strtolower( trim( (string) ( $sub_path[0] ?? '' ) ) );
			$prop_key  = strtolower( trim( (string) ( $sub_path[1] ?? '' ) ) );
			$now       = time();

			// Filter dates by group
			$filtered = [];
			foreach ( $dates as $date ) {
				if ( ! is_array( $date ) || empty( $date['start'] ) ) {
					continue;
				}
				$start_ts = strtotime( $date['start'] );
				$end_ts   = ! empty( $date['end'] ) ? strtotime( $date['end'] ) : $start_ts;

				if ( $group_key === 'upcoming' && $end_ts >= $now ) {
					$filtered[] = $date;
				} elseif ( $group_key === 'previous' && $end_ts < $now ) {
					$filtered[] = $date;
				} elseif ( $group_key === 'all' ) {
					$filtered[] = $date;
				}
			}

			if ( empty( $filtered ) ) {
				return '';
			}

			// Use first matching date (non-loop context)
			$entry    = $filtered[0];
			$start_ts = strtotime( $entry['start'] );
			$end_ts   = ! empty( $entry['end'] ) ? strtotime( $entry['end'] ) : $start_ts;

			switch ( $prop_key ) {
				case 'start':
					return (string) ( $entry['start'] ?? '' );
				case 'end':
					return (string) ( $entry['end'] ?? '' );
				case 'is_multiday':
					$is_multiday = ! empty( $entry['multiday'] )
						|| ( $start_ts && $end_ts && gmdate( 'Y-m-d', $start_ts ) !== gmdate( 'Y-m-d', $end_ts ) );
					return $is_multiday ? '1' : '';
				case 'is_happening_now':
					return ( $start_ts <= $now && $end_ts >= $now ) ? '1' : '';
				case 'is_allday':
					return ! empty( $entry['allday'] ) ? '1' : '';
				default:
					return '';
			}
		} catch ( \Throwable $e ) {
			return null;
		}
	}

	/**
	 * Get the data group type/key.
	 *
	 * @return string
	 */
	public function get_type(): string {
		return 'post';
	}
}


