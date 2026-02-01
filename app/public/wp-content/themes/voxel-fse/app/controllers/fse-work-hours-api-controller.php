<?php

namespace VoxelFSE\Controllers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FSE_Work_Hours_API_Controller extends FSE_Base_Controller {

	protected function hooks(): void {
		$this->on( 'rest_api_init', '@register_routes' );
		// Note: CSS loading is handled by Block_Loader.php (Plan C+ headless-ready pattern)
		// Block_Loader adds 'vx:work-hours.css' dependency for both editor and frontend
	}

	public function register_routes() {
		// PARITY FIX: Work hours are publicly visible - no auth required
		// Reference: themes/voxel/app/widgets/work-hours.php renders to all visitors
		register_rest_route(
			'voxel-fse/v1',
			'/work-hours/(?P<post_id>\d+)',
			[
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => [ $this, 'get_work_hours_data' ],
				'permission_callback' => '__return_true',
			]
		);

		// Get work-hours fields for a post type (for editor dropdown)
		register_rest_route(
			'voxel-fse/v1',
			'/work-hours-fields/(?P<post_type>[a-zA-Z0-9_-]+)',
			[
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => [ $this, 'get_work_hours_fields' ],
				'permission_callback' => function() {
					return current_user_can( 'edit_posts' );
				},
			]
		);
	}

	/**
	 * Get work-hours fields for a specific post type
	 * Used by the editor to populate the field dropdown
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public function get_work_hours_fields( \WP_REST_Request $request ) {
		$post_type_key = sanitize_text_field( $request->get_param( 'post_type' ) );

		// Get Voxel post type
		$post_type = \Voxel\Post_Type::get( $post_type_key );
		if ( ! $post_type ) {
			return new \WP_REST_Response(
				[ 'error' => 'Post type not found' ],
				404
			);
		}

		// Build options array matching Elementor format
		// First option is empty value with "Choose field" label
		$fields = [];

		foreach ( $post_type->get_fields() as $field ) {
			if ( $field->get_type() === 'work-hours' ) {
				$fields[] = [
					'value' => $field->get_key(),
					'label' => $field->get_label(),
				];
			}
		}

		return new \WP_REST_Response(
			[
				'fields' => $fields,
			],
			200
		);
	}

	/**
	 * Get work-hours data for a specific post and field
	 *
	 * PARITY NOTE: This endpoint is publicly accessible (no auth required) because
	 * Voxel's work-hours widget displays to all visitors, not just logged-in users.
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public function get_work_hours_data( \WP_REST_Request $request ) {
		$post_id  = absint( $request->get_param( 'post_id' ) );
		$field_key = sanitize_text_field( $request->get_param( 'field' ) ?? 'work-hours' );

		$post = \Voxel\get_post( $post_id );
		if ( ! $post ) {
			return new \WP_REST_Response(
				[ 'error' => 'Post not found' ],
				404
			);
		}

		$field = $post->get_field( $field_key );
		if ( ! ( $field && $field->get_type() === 'work-hours' ) ) {
			return new \WP_REST_Response(
				[ 'error' => 'Work hours field not found' ],
				404
			);
		}

		$schedule = $field->get_schedule();
		if ( ! $schedule ) {
			return new \WP_REST_Response(
				[ 'error' => 'No schedule data' ],
				404
			);
		}

		// Get current state
		$is_open_now = $field->is_open_now();
		$local_time  = $post->get_local_time();
		$weekdays    = \Voxel\get_weekdays();
		$keys        = array_flip( \Voxel\get_weekday_indexes() );
		array_unshift( $keys, array_pop( $keys ) );
		$today = $keys[ $local_time->format( 'w' ) ];

		// PARITY FIX: Format times using Voxel's time_format() which respects WP site settings
		// Reference: themes/voxel/templates/widgets/work-hours.php:63-68
		$formatted_schedule = [];
		foreach ( $schedule as $day_key => $day_data ) {
			$formatted_schedule[ $day_key ] = [
				'status' => $day_data['status'],
				'hours'  => [],
			];

			if ( $day_data['status'] === 'hours' && ! empty( $day_data['hours'] ) ) {
				foreach ( $day_data['hours'] as $slot ) {
					$from_ts = strtotime( $slot['from'] );
					$to_ts   = strtotime( $slot['to'] );

					$formatted_schedule[ $day_key ]['hours'][] = [
						'from'          => $slot['from'],
						'to'            => $slot['to'],
						'fromFormatted' => \Voxel\time_format( $from_ts ),
						'toFormatted'   => \Voxel\time_format( $to_ts ),
					];
				}
			}
		}

		// PARITY FIX: Format local time using Voxel's datetime_format()
		// Reference: themes/voxel/templates/widgets/work-hours.php:105-107
		$local_time_formatted = \Voxel\datetime_format( $local_time );

		return new \WP_REST_Response(
			[
				'schedule'   => $formatted_schedule,
				'isOpenNow'  => $is_open_now,
				'weekdays'   => $weekdays,
				'today'      => $today,
				'localTime'  => $local_time_formatted,
			],
			200
		);
	}
}
