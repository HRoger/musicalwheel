<?php
/**
 * Icon Processor for FSE - Elementor-independent
 *
 * Processes Voxel icon strings without requiring Elementor to be active.
 * Handles the same icon formats as Voxel's get_icon_markup() function.
 *
 * Icon string formats:
 * - svg:1705 - SVG from media library (attachment ID)
 * - la-regular:lar la-arrow-alt-circle-right - Line Awesome icon
 * - fa-solid:fas fa-heart - Font Awesome icon
 *
 * @since 1.0.0
 */

namespace VoxelFSE\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Icon_Processor {

	/**
	 * Parse icon string into library and value
	 *
	 * @param string $string Icon string (e.g., "svg:1705" or "la-regular:lar la-arrow")
	 * @return array ['library' => string, 'value' => mixed]
	 */
	public static function parse_icon_string( $string ) {
		$string = (string) $string;

		// Empty icon
		if ( empty( $string ) ) {
			return [
				'library' => '',
				'value' => '',
			];
		}

		$library = substr( $string, 0, strpos( $string, ':') );
		$icon = substr( $string, strpos( $string, ':') + 1 );

		// Handle SVG from media library
		if ( $library === 'svg' && is_numeric( $icon ) ) {
			$icon = [
				'id' => absint( $icon ),
				'url' => wp_get_attachment_url( $icon ),
			];
		}

		return [
			'value' => $icon,
			'library' => $library,
		];
	}

	/**
	 * Get icon markup HTML (Elementor-independent version)
	 *
	 * @param string|array $icon Icon string or parsed icon array
	 * @return string HTML markup for the icon
	 */
	public static function get_icon_markup( $icon ) {
		// Parse icon string if needed
		if ( ! is_array( $icon ) ) {
			$icon = self::parse_icon_string( $icon );
		}

		// Empty icon
		if ( empty( $icon['library'] ) || empty( $icon['value'] ) ) {
			return '';
		}

		// Handle SVG from media library
		if ( $icon['library'] === 'svg' && is_array( $icon['value'] ) ) {
			return self::render_svg_icon( $icon['value'] );
		}

		// Handle icon font classes (Line Awesome, Font Awesome, etc.)
		return self::render_font_icon( $icon['value'] );
	}

	/**
	 * Render SVG icon from media library
	 *
	 * @param array $svg_data ['id' => int, 'url' => string]
	 * @return string SVG markup or empty string
	 */
	private static function render_svg_icon( $svg_data ) {
		if ( empty( $svg_data['url'] ) ) {
			return '';
		}

		// Verify it's an SVG file
		$extension = pathinfo( $svg_data['url'], PATHINFO_EXTENSION );
		if ( ! str_starts_with( $extension, 'svg' ) ) {
			return '';
		}

		// Get SVG file content
		$svg_path = get_attached_file( $svg_data['id'] );
		if ( ! $svg_path || ! file_exists( $svg_path ) ) {
			return '';
		}

		$svg_content = file_get_contents( $svg_path );
		if ( ! $svg_content || ! str_contains( $svg_content, '<svg' ) ) {
			return '';
		}

		// Add aria-hidden to SVG
		if ( ! str_contains( $svg_content, 'aria-hidden' ) ) {
			$svg_content = str_replace( '<svg', '<svg aria-hidden="true"', $svg_content );
		}

		return $svg_content;
	}

	/**
	 * Render icon font (Line Awesome, Font Awesome, etc.)
	 *
	 * @param string $classes Icon classes (e.g., "lar la-bell" or "fas fa-heart")
	 * @return string <i> tag markup
	 */
	private static function render_font_icon( $classes ) {
		if ( empty( $classes ) ) {
			return '';
		}

		return sprintf(
			'<i aria-hidden="true" class="%s"></i>',
			esc_attr( $classes )
		);
	}

	/**
	 * Process icons in field choices array
	 *
	 * Used by select/multiselect fields to process icon data
	 *
	 * @param array $choices Array of choices with 'icon' property
	 * @return array Choices with processed icon markup
	 */
	public static function process_choice_icons( $choices ) {
		if ( ! is_array( $choices ) ) {
			return [];
		}

		foreach ( $choices as &$choice ) {
			if ( isset( $choice['icon'] ) && ! empty( $choice['icon'] ) ) {
				$choice['icon'] = self::get_icon_markup( $choice['icon'] );
			}
		}

		return $choices;
	}
}
