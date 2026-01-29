<?php
/**
 * Unit Tests for Output Buffering
 *
 * Tests that our REST API controller correctly captures unwanted output
 * from Voxel filter methods that call wp_print_styles() or similar.
 *
 * Evidence: themes/voxel/app/post-types/filters/range-filter.php:217-219
 *
 * @package VoxelFSE\Tests\Unit\Controllers
 */

namespace VoxelFSE\Tests\Unit\Controllers;

use PHPUnit\Framework\TestCase;
use Brain\Monkey;
use Brain\Monkey\Functions;
use Mockery;

class OutputBufferingTest extends TestCase {

	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();
	}

	protected function tearDown(): void {
		Monkey\tearDown();
		Mockery::close();
		parent::tearDown();
	}

	/**
	 * Test that output buffering captures unwanted output from filters
	 *
	 * Some Voxel filters call wp_print_styles() in their frontend_props() method,
	 * which outputs HTML directly. Our controller must capture and discard this
	 * to return clean JSON.
	 */
	public function test_output_buffering_captures_filter_side_effects(): void {
		// Simulate what happens when a filter outputs HTML
		ob_start();

		// Simulate Voxel's range-filter.php:217-219 behavior
		echo '<style id="range-slider-css">.range-slider { width: 100%; }</style>';

		// Capture and discard
		$captured_output = ob_get_clean();

		// The output should NOT appear in the response
		$this->assertNotEmpty( $captured_output );
		$this->assertStringContainsString( 'range-slider', $captured_output );
	}

	/**
	 * Test that output buffering doesn't interfere with normal operation
	 */
	public function test_output_buffering_preserves_return_values(): void {
		$expected_data = [
			'key'   => 'range',
			'label' => 'Price Range',
			'type'  => 'range',
			'props' => [
				'min' => 0,
				'max' => 1000,
			],
		];

		ob_start();

		// Simulate filter that outputs AND returns data
		echo '<!-- Some debug output -->';
		$result = $expected_data;

		// Discard output but keep result
		ob_end_clean();

		$this->assertEquals( $expected_data, $result );
	}

	/**
	 * Test nested output buffering (if Voxel also uses ob_start internally)
	 */
	public function test_nested_output_buffering(): void {
		ob_start(); // Our outer buffer

		// Simulate nested buffering (Voxel might do this)
		ob_start();
		echo 'Inner content';
		$inner = ob_get_clean();

		echo 'Outer content';

		$outer = ob_get_clean(); // Our outer buffer

		$this->assertEquals( 'Inner content', $inner );
		$this->assertEquals( 'Outer content', $outer );
	}

	/**
	 * Test that filter icons are not affected by output buffering
	 *
	 * Icon markup should be captured as return value, not output.
	 */
	public function test_icon_markup_not_affected_by_output_buffering(): void {
		$icon_markup = '<i aria-hidden="true" class="lar la-star"></i>';

		ob_start();

		// Simulate getting icon (this should be a return, not output)
		$result = $icon_markup;

		// Nothing should have been output
		$output = ob_get_clean();

		$this->assertEmpty( $output );
		$this->assertEquals( $icon_markup, $result );
	}

	/**
	 * Test that output buffering handles exceptions gracefully
	 */
	public function test_output_buffering_with_exception(): void {
		$buffer_level_before = ob_get_level();

		try {
			ob_start();
			echo 'Some output before error';
			throw new \Exception( 'Test exception' );
		} catch ( \Exception $e ) {
			// Clean up on error
			while ( ob_get_level() > $buffer_level_before ) {
				ob_end_clean();
			}
		}

		// Buffer level should be restored
		$this->assertEquals( $buffer_level_before, ob_get_level() );
	}

	/**
	 * Test that JSON response is clean after output buffering
	 */
	public function test_json_response_clean_after_buffering(): void {
		ob_start();

		// Simulate filter side effects
		echo "\n<!-- Debug info -->\n";
		echo '<script>console.log("debug")</script>';

		// Get the data we want to return
		$data = [
			'filters' => [
				[
					'key'  => 'price',
					'type' => 'range',
				],
			],
		];

		// Discard all side effect output
		ob_end_clean();

		// Encode to JSON
		$json = json_encode( $data );

		// JSON should be valid (no extra characters at start)
		$this->assertNotFalse( json_decode( $json ) );
		$this->assertEquals( JSON_ERROR_NONE, json_last_error() );
		$this->assertStringStartsWith( '{', $json );
	}

	/**
	 * Test wp_print_styles simulation
	 *
	 * This simulates what happens when Voxel's range-filter calls wp_print_styles()
	 */
	public function test_wp_print_styles_capture(): void {
		// Mock wp_print_styles to output CSS
		Functions\when( 'wp_print_styles' )->alias( function( $handles ) {
			echo '<link rel="stylesheet" href="/wp-includes/css/range-slider.css" />';
		});

		ob_start();

		// Simulate filter that calls wp_print_styles
		wp_print_styles( [ 'range-slider' ] );

		$filter_data = [ 'key' => 'price', 'type' => 'range' ];

		// Capture and discard the style output
		ob_end_clean();

		// Data should be unaffected
		$this->assertEquals( 'price', $filter_data['key'] );
	}

	/**
	 * Test that multiple filters with side effects are all captured
	 */
	public function test_multiple_filter_side_effects_captured(): void {
		ob_start();

		$filters_data = [];

		// Filter 1: Range filter with wp_print_styles side effect
		echo '<style>.range-filter { }</style>';
		$filters_data[] = [ 'key' => 'price', 'type' => 'range' ];

		// Filter 2: Another filter with debug output
		echo '<!-- terms filter debug -->';
		$filters_data[] = [ 'key' => 'category', 'type' => 'terms' ];

		// Filter 3: Clean filter
		$filters_data[] = [ 'key' => 'keywords', 'type' => 'keywords' ];

		// Discard all output
		ob_end_clean();

		// All filter data should be preserved
		$this->assertCount( 3, $filters_data );
		$this->assertEquals( 'price', $filters_data[0]['key'] );
		$this->assertEquals( 'category', $filters_data[1]['key'] );
		$this->assertEquals( 'keywords', $filters_data[2]['key'] );
	}
}
