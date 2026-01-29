<?php
/**
 * Unit Tests for Icon_Processor
 *
 * Tests the Elementor-independent icon processing functionality.
 *
 * @package VoxelFSE\Tests\Unit\Utils
 */

namespace VoxelFSE\Tests\Unit\Utils;

use PHPUnit\Framework\TestCase;
use VoxelFSE\Utils\Icon_Processor;
use Brain\Monkey;
use Brain\Monkey\Functions;

class IconProcessorTest extends TestCase {

	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();
	}

	protected function tearDown(): void {
		Monkey\tearDown();
		parent::tearDown();
	}

	/**
	 * Test parsing an empty icon string returns empty values
	 */
	public function test_parse_icon_string_empty(): void {
		$result = Icon_Processor::parse_icon_string( '' );

		$this->assertIsArray( $result );
		$this->assertEmpty( $result['library'] );
		$this->assertEmpty( $result['value'] );
	}

	/**
	 * Test parsing a Font Awesome icon string
	 */
	public function test_parse_icon_string_font_awesome(): void {
		$result = Icon_Processor::parse_icon_string( 'fa-solid:fas fa-heart' );

		$this->assertEquals( 'fa-solid', $result['library'] );
		$this->assertEquals( 'fas fa-heart', $result['value'] );
	}

	/**
	 * Test parsing a Line Awesome icon string
	 */
	public function test_parse_icon_string_line_awesome(): void {
		$result = Icon_Processor::parse_icon_string( 'la-regular:lar la-arrow-alt-circle-right' );

		$this->assertEquals( 'la-regular', $result['library'] );
		$this->assertEquals( 'lar la-arrow-alt-circle-right', $result['value'] );
	}

	/**
	 * Test parsing an SVG icon string
	 */
	public function test_parse_icon_string_svg(): void {
		Functions\when( 'wp_get_attachment_url' )->justReturn( 'https://example.com/test.svg' );

		$result = Icon_Processor::parse_icon_string( 'svg:1705' );

		$this->assertEquals( 'svg', $result['library'] );
		$this->assertIsArray( $result['value'] );
		$this->assertEquals( 1705, $result['value']['id'] );
		$this->assertEquals( 'https://example.com/test.svg', $result['value']['url'] );
	}

	/**
	 * Test get_icon_markup returns empty string for empty icon
	 */
	public function test_get_icon_markup_empty(): void {
		$result = Icon_Processor::get_icon_markup( '' );

		$this->assertEmpty( $result );
	}

	/**
	 * Test get_icon_markup returns <i> tag for font icons
	 */
	public function test_get_icon_markup_font_awesome(): void {
		$result = Icon_Processor::get_icon_markup( 'fa-solid:fas fa-heart' );

		$this->assertStringContainsString( '<i', $result );
		$this->assertStringContainsString( 'aria-hidden="true"', $result );
		$this->assertStringContainsString( 'fas fa-heart', $result );
		$this->assertStringContainsString( '</i>', $result );
	}

	/**
	 * Test get_icon_markup returns <i> tag for Line Awesome icons
	 */
	public function test_get_icon_markup_line_awesome(): void {
		$result = Icon_Processor::get_icon_markup( 'la-regular:lar la-bell' );

		$this->assertStringContainsString( '<i', $result );
		$this->assertStringContainsString( 'lar la-bell', $result );
	}

	/**
	 * Test get_icon_markup returns SVG content for SVG icons
	 */
	public function test_get_icon_markup_svg(): void {
		$svg_content = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';

		// Create temp SVG file
		$temp_file = sys_get_temp_dir() . '/test-icon.svg';
		file_put_contents( $temp_file, $svg_content );

		Functions\when( 'wp_get_attachment_url' )->justReturn( 'https://example.com/test.svg' );
		Functions\when( 'get_attached_file' )->justReturn( $temp_file );

		$result = Icon_Processor::get_icon_markup( 'svg:123' );

		$this->assertStringContainsString( '<svg', $result );
		$this->assertStringContainsString( 'aria-hidden="true"', $result );

		// Cleanup
		unlink( $temp_file );
	}

	/**
	 * Test get_icon_markup handles non-SVG file gracefully
	 */
	public function test_get_icon_markup_svg_with_non_svg_extension(): void {
		Functions\when( 'wp_get_attachment_url' )->justReturn( 'https://example.com/test.png' );
		Functions\when( 'get_attached_file' )->justReturn( '/fake/path/test.png' );

		$result = Icon_Processor::get_icon_markup( 'svg:123' );

		$this->assertEmpty( $result );
	}

	/**
	 * Test get_icon_markup handles missing SVG file gracefully
	 */
	public function test_get_icon_markup_svg_missing_file(): void {
		Functions\when( 'wp_get_attachment_url' )->justReturn( 'https://example.com/test.svg' );
		Functions\when( 'get_attached_file' )->justReturn( '/nonexistent/path/test.svg' );

		$result = Icon_Processor::get_icon_markup( 'svg:123' );

		$this->assertEmpty( $result );
	}

	/**
	 * Test process_choice_icons processes array of choices
	 */
	public function test_process_choice_icons(): void {
		$choices = [
			[
				'label' => 'Option 1',
				'icon'  => 'fa-solid:fas fa-star',
			],
			[
				'label' => 'Option 2',
				'icon'  => 'la-regular:lar la-heart',
			],
			[
				'label' => 'Option 3',
				// No icon
			],
		];

		$result = Icon_Processor::process_choice_icons( $choices );

		$this->assertCount( 3, $result );
		$this->assertStringContainsString( '<i', $result[0]['icon'] );
		$this->assertStringContainsString( 'fas fa-star', $result[0]['icon'] );
		$this->assertStringContainsString( '<i', $result[1]['icon'] );
		$this->assertStringContainsString( 'lar la-heart', $result[1]['icon'] );
		$this->assertArrayNotHasKey( 'icon', $result[2] );
	}

	/**
	 * Test process_choice_icons handles non-array input
	 */
	public function test_process_choice_icons_non_array(): void {
		$result = Icon_Processor::process_choice_icons( 'not an array' );

		$this->assertIsArray( $result );
		$this->assertEmpty( $result );
	}

	/**
	 * Test that icon markup is properly escaped to prevent XSS
	 */
	public function test_icon_classes_are_escaped(): void {
		// Attempt XSS through icon classes
		$malicious_icon = 'fa-solid:fas fa-heart" onclick="alert(1)';
		$result = Icon_Processor::get_icon_markup( $malicious_icon );

		// The onclick should be escaped, not executable
		$this->assertStringNotContainsString( 'onclick="alert(1)"', $result );
		$this->assertStringContainsString( 'onclick=', $result ); // Escaped version
	}

	/**
	 * Test icon markup with already-parsed icon array
	 */
	public function test_get_icon_markup_with_parsed_array(): void {
		$parsed_icon = [
			'library' => 'fa-solid',
			'value'   => 'fas fa-check',
		];

		$result = Icon_Processor::get_icon_markup( $parsed_icon );

		$this->assertStringContainsString( '<i', $result );
		$this->assertStringContainsString( 'fas fa-check', $result );
	}
}
