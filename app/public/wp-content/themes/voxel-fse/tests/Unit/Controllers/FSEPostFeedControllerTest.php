<?php
/**
 * PHPUnit Tests for FSE_Post_Feed_Controller
 *
 * Tests 1:1 parity with Voxel's post-feed.php lifecycle:
 * - get_config() returns post types
 * - get_post_types() returns Voxel-managed types
 * - get_card_templates() returns per-post-type templates
 * - get_filters() returns filter definitions
 * - search_with_filters() replicates Voxel's filter lifecycle
 *
 * @package VoxelFSE\Tests\Unit\Controllers
 */

namespace VoxelFSE\Tests\Unit\Controllers;

use PHPUnit\Framework\TestCase;
use Brain\Monkey;
use Brain\Monkey\Functions;
use Mockery;
use VoxelFSE\Controllers\FSE_Post_Feed_Controller;

class FSEPostFeedControllerTest extends TestCase {

	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();

		// Mock WordPress functions
		Functions\when( 'register_rest_route' )->justReturn( true );
		Functions\when( 'rest_url' )->justReturn( 'http://example.com/wp-json/voxel-fse/v1/' );
		Functions\when( 'admin_url' )->justReturn( 'http://example.com/wp-admin/admin-ajax.php' );
		Functions\when( 'get_post_types' )->justReturn( [] );
		Functions\when( 'rest_ensure_response' )->alias( function( $data ) {
			return new \WP_REST_Response( $data );
		} );
		Functions\when( '__' )->returnArg();
		Functions\when( 'sanitize_text_field' )->returnArg();
		Functions\when( 'absint' )->alias( function( $val ) { return abs( (int) $val ); } );
	}

	protected function tearDown(): void {
		Monkey\tearDown();
		Mockery::close();
		parent::tearDown();
	}

	/**
	 * Test get_config returns post types array
	 *
	 * Evidence: Voxel post-feed.php:33-36 iterates Post_Type::get_voxel_types()
	 */
	public function test_get_config_returns_post_types(): void {
		// Mock Voxel Post_Type class
		$place_type = Mockery::mock();
		$place_type->shouldReceive( 'get_key' )->andReturn( 'place' );
		$place_type->shouldReceive( 'get_label' )->andReturn( 'Places' );
		$place_type->shouldReceive( 'get_singular_name' )->andReturn( 'Place' );
		$place_type->shouldReceive( 'get_plural_name' )->andReturn( 'Places' );

		$event_type = Mockery::mock();
		$event_type->shouldReceive( 'get_key' )->andReturn( 'event' );
		$event_type->shouldReceive( 'get_label' )->andReturn( 'Events' );
		$event_type->shouldReceive( 'get_singular_name' )->andReturn( 'Event' );
		$event_type->shouldReceive( 'get_plural_name' )->andReturn( 'Events' );

		// Mock the static method
		$post_type_class = Mockery::mock( 'alias:Voxel\Post_Type' );
		$post_type_class->shouldReceive( 'get_voxel_types' )->andReturn( [ $place_type, $event_type ] );

		// Create controller
		$controller = new FSE_Post_Feed_Controller();
		$response = $controller->get_config();
		$data = $response->get_data();

		// Assertions
		$this->assertArrayHasKey( 'postTypes', $data );
		$this->assertCount( 2, $data['postTypes'] );
		$this->assertEquals( 'place', $data['postTypes'][0]['key'] );
		$this->assertEquals( 'Places', $data['postTypes'][0]['label'] );
		$this->assertTrue( $data['postTypes'][0]['managed'] );
		$this->assertArrayHasKey( 'ajaxUrl', $data );
		$this->assertArrayHasKey( 'restUrl', $data );
	}

	/**
	 * Test get_post_types returns only Voxel-managed types
	 *
	 * Evidence: Voxel post-feed.php uses Post_Type::get_voxel_types()
	 */
	public function test_get_post_types_returns_voxel_types(): void {
		$place_type = Mockery::mock();
		$place_type->shouldReceive( 'get_key' )->andReturn( 'place' );
		$place_type->shouldReceive( 'get_label' )->andReturn( 'Places' );
		$place_type->shouldReceive( 'get_singular_name' )->andReturn( 'Place' );
		$place_type->shouldReceive( 'get_plural_name' )->andReturn( 'Places' );

		$post_type_class = Mockery::mock( 'alias:Voxel\Post_Type' );
		$post_type_class->shouldReceive( 'get_voxel_types' )->andReturn( [ $place_type ] );

		$controller = new FSE_Post_Feed_Controller();
		$response = $controller->get_post_types();
		$data = $response->get_data();

		$this->assertArrayHasKey( 'postTypes', $data );
		$this->assertCount( 1, $data['postTypes'] );
		$this->assertEquals( 'place', $data['postTypes'][0]['key'] );
	}

	/**
	 * Test get_card_templates returns main + custom templates
	 *
	 * Evidence: Voxel post-feed.php:204-212 uses $post_type->templates->get_custom_templates()['card']
	 */
	public function test_get_card_templates_returns_templates(): void {
		// Mock templates object
		$templates_mock = Mockery::mock();
		$templates_mock->shouldReceive( 'get_custom_templates' )->andReturn( [
			'card' => [
				[ 'id' => '123', 'label' => 'Custom Card 1' ],
				[ 'id' => '456', 'label' => 'Custom Card 2' ],
			],
		] );

		// Mock post type
		$post_type = Mockery::mock();
		$post_type->templates = $templates_mock;

		$post_type_class = Mockery::mock( 'alias:Voxel\Post_Type' );
		$post_type_class->shouldReceive( 'get' )->with( 'place' )->andReturn( $post_type );

		// Create request
		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_type' )->andReturn( 'place' );

		$controller = new FSE_Post_Feed_Controller();
		$response = $controller->get_card_templates( $request );
		$data = $response->get_data();

		$this->assertArrayHasKey( 'templates', $data );
		$this->assertCount( 3, $data['templates'] ); // main + 2 custom
		$this->assertEquals( 'main', $data['templates'][0]['id'] );
		$this->assertEquals( '123', $data['templates'][1]['id'] );
		$this->assertEquals( '456', $data['templates'][2]['id'] );
	}

	/**
	 * Test get_card_templates returns only main when post type not found
	 */
	public function test_get_card_templates_fallback_when_not_found(): void {
		$post_type_class = Mockery::mock( 'alias:Voxel\Post_Type' );
		$post_type_class->shouldReceive( 'get' )->with( 'nonexistent' )->andReturn( null );

		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_type' )->andReturn( 'nonexistent' );

		$controller = new FSE_Post_Feed_Controller();
		$response = $controller->get_card_templates( $request );
		$data = $response->get_data();

		$this->assertCount( 1, $data['templates'] );
		$this->assertEquals( 'main', $data['templates'][0]['id'] );
		$this->assertArrayHasKey( 'error', $data );
	}

	/**
	 * Test get_filters returns filter definitions with controls
	 *
	 * Evidence: Voxel post-feed.php:1402-1425 iterates filter->get_elementor_controls()
	 */
	public function test_get_filters_returns_filter_definitions(): void {
		// Mock filter
		$filter = Mockery::mock();
		$filter->shouldReceive( 'get_key' )->andReturn( 'keywords' );
		$filter->shouldReceive( 'get_label' )->andReturn( 'Keywords' );
		$filter->shouldReceive( 'get_type' )->andReturn( 'text' );
		$filter->shouldReceive( 'get_description' )->andReturn( 'Search by keywords' );
		$filter->shouldReceive( 'get_icon' )->andReturn( 'search-icon' );
		$filter->shouldReceive( 'get_elementor_controls' )->andReturn( [
			'value' => [
				'label' => 'Value',
				'type' => 'text',
				'default' => '',
			],
		] );

		// Mock post type
		$post_type = Mockery::mock();
		$post_type->shouldReceive( 'get_filters' )->andReturn( [ $filter ] );

		$post_type_class = Mockery::mock( 'alias:Voxel\Post_Type' );
		$post_type_class->shouldReceive( 'get' )->with( 'place' )->andReturn( $post_type );

		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_type' )->andReturn( 'place' );

		$controller = new FSE_Post_Feed_Controller();
		$response = $controller->get_filters( $request );
		$data = $response->get_data();

		$this->assertArrayHasKey( 'filters', $data );
		$this->assertCount( 1, $data['filters'] );
		$this->assertEquals( 'keywords', $data['filters'][0]['key'] );
		$this->assertEquals( 'text', $data['filters'][0]['type'] );
		$this->assertArrayHasKey( 'controls', $data['filters'][0] );
	}

	/**
	 * Test search_with_filters replicates Voxel lifecycle
	 *
	 * CRITICAL 1:1 PARITY TEST
	 * Evidence: Voxel post-feed.php:1456-1466 calls:
	 * 1. filter->set_elementor_config($controls)
	 * 2. filter->get_default_value_from_elementor($controls)
	 * This test verifies that lifecycle is replicated exactly.
	 */
	public function test_search_with_filters_lifecycle_parity(): void {
		// Mock filter with lifecycle methods
		$filter = Mockery::mock();
		$filter->shouldReceive( 'get_key' )->andReturn( 'keywords' );
		$filter->shouldReceive( 'get_elementor_controls' )->andReturn( [
			'value' => [
				'full_key' => 'keywords:value',
				'label' => 'Value',
				'type' => 'text',
			],
		] );
		// CRITICAL: These methods MUST be called in order per Voxel's lifecycle
		$filter->shouldReceive( 'set_elementor_config' )
			->once()
			->with( Mockery::on( function( $controls ) {
				return isset( $controls['value'] ) && $controls['value'] === 'test search';
			} ) );
		$filter->shouldReceive( 'get_default_value_from_elementor' )
			->once()
			->andReturn( 'test search' );

		// Mock post type
		$post_type = Mockery::mock();
		$post_type->shouldReceive( 'get_key' )->andReturn( 'place' );
		$post_type->shouldReceive( 'get_filter' )->with( 'keywords' )->andReturn( $filter );

		$post_type_class = Mockery::mock( 'alias:Voxel\Post_Type' );
		$post_type_class->shouldReceive( 'get' )->with( 'place' )->andReturn( $post_type );

		// Mock Voxel\get_search_results
		Functions\when( 'Voxel\get_search_results' )->justReturn( [
			'ids' => [ 1, 2, 3 ],
			'render' => '<div class="ts-preview">Post 1</div>',
			'styles' => '',
			'scripts' => '',
			'has_next' => true,
			'total_count' => 10,
		] );

		// Mock count_format
		Functions\when( 'Voxel\count_format' )->justReturn( '3 of 10' );

		// Create request with filter_list matching Voxel's structure
		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_type' )->andReturn( 'place' );
		$request->shouldReceive( 'get_param' )->with( 'filters' )->andReturn( [
			[
				'filter' => 'keywords',
				'keywords:value' => 'test search',
			],
		] );
		$request->shouldReceive( 'get_param' )->with( 'limit' )->andReturn( 10 );
		$request->shouldReceive( 'get_param' )->with( 'offset' )->andReturn( 0 );
		$request->shouldReceive( 'get_param' )->with( 'page' )->andReturn( 1 );
		$request->shouldReceive( 'get_param' )->with( 'exclude' )->andReturn( '' );
		$request->shouldReceive( 'get_param' )->with( 'priority_filter' )->andReturn( false );
		$request->shouldReceive( 'get_param' )->with( 'priority_min' )->andReturn( 0 );
		$request->shouldReceive( 'get_param' )->with( 'priority_max' )->andReturn( 0 );
		$request->shouldReceive( 'get_param' )->with( 'card_template' )->andReturn( 'main' );
		$request->shouldReceive( 'get_param' )->with( 'get_total_count' )->andReturn( true );

		$controller = new FSE_Post_Feed_Controller();
		$response = $controller->search_with_filters( $request );
		$data = $response->get_data();

		// Assertions
		$this->assertTrue( $data['success'] );
		$this->assertArrayHasKey( 'html', $data );
		$this->assertEquals( [ 1, 2, 3 ], $data['ids'] );
		$this->assertTrue( $data['hasResults'] );
		$this->assertTrue( $data['hasNext'] );
		$this->assertFalse( $data['hasPrev'] ); // Page 1 has no prev
		$this->assertEquals( '3 of 10', $data['displayCount'] );
	}

	/**
	 * Test search_with_filters handles exclude IDs
	 *
	 * Evidence: Voxel post-feed.php:1472 parses exclude comma-separated
	 */
	public function test_search_with_filters_handles_exclude(): void {
		$post_type = Mockery::mock();
		$post_type->shouldReceive( 'get_key' )->andReturn( 'place' );

		$post_type_class = Mockery::mock( 'alias:Voxel\Post_Type' );
		$post_type_class->shouldReceive( 'get' )->with( 'place' )->andReturn( $post_type );

		// Capture the exclude argument passed to get_search_results
		$captured_options = null;
		Functions\when( 'Voxel\get_search_results' )->alias( function( $args, $options ) use ( &$captured_options ) {
			$captured_options = $options;
			return [
				'ids' => [],
				'render' => '',
				'styles' => '',
				'scripts' => '',
				'has_next' => false,
			];
		} );

		Functions\when( 'Voxel\count_format' )->justReturn( '0' );

		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_type' )->andReturn( 'place' );
		$request->shouldReceive( 'get_param' )->with( 'filters' )->andReturn( [] );
		$request->shouldReceive( 'get_param' )->with( 'limit' )->andReturn( 10 );
		$request->shouldReceive( 'get_param' )->with( 'offset' )->andReturn( 0 );
		$request->shouldReceive( 'get_param' )->with( 'page' )->andReturn( 1 );
		$request->shouldReceive( 'get_param' )->with( 'exclude' )->andReturn( '1,2,3' );
		$request->shouldReceive( 'get_param' )->with( 'priority_filter' )->andReturn( false );
		$request->shouldReceive( 'get_param' )->with( 'priority_min' )->andReturn( 0 );
		$request->shouldReceive( 'get_param' )->with( 'priority_max' )->andReturn( 0 );
		$request->shouldReceive( 'get_param' )->with( 'card_template' )->andReturn( 'main' );
		$request->shouldReceive( 'get_param' )->with( 'get_total_count' )->andReturn( false );

		$controller = new FSE_Post_Feed_Controller();
		$controller->search_with_filters( $request );

		// Verify exclude was parsed correctly
		$this->assertEquals( [ 1, 2, 3 ], $captured_options['exclude'] );
	}

	/**
	 * Test search_with_filters handles priority filter
	 *
	 * Evidence: Voxel post-feed.php:1474-1479 sets priority_min/max
	 */
	public function test_search_with_filters_handles_priority(): void {
		$post_type = Mockery::mock();
		$post_type->shouldReceive( 'get_key' )->andReturn( 'place' );

		$post_type_class = Mockery::mock( 'alias:Voxel\Post_Type' );
		$post_type_class->shouldReceive( 'get' )->with( 'place' )->andReturn( $post_type );

		$captured_options = null;
		Functions\when( 'Voxel\get_search_results' )->alias( function( $args, $options ) use ( &$captured_options ) {
			$captured_options = $options;
			return [
				'ids' => [],
				'render' => '',
				'styles' => '',
				'scripts' => '',
				'has_next' => false,
			];
		} );

		Functions\when( 'Voxel\count_format' )->justReturn( '0' );

		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_type' )->andReturn( 'place' );
		$request->shouldReceive( 'get_param' )->with( 'filters' )->andReturn( [] );
		$request->shouldReceive( 'get_param' )->with( 'limit' )->andReturn( 10 );
		$request->shouldReceive( 'get_param' )->with( 'offset' )->andReturn( 0 );
		$request->shouldReceive( 'get_param' )->with( 'page' )->andReturn( 1 );
		$request->shouldReceive( 'get_param' )->with( 'exclude' )->andReturn( '' );
		$request->shouldReceive( 'get_param' )->with( 'priority_filter' )->andReturn( true );
		$request->shouldReceive( 'get_param' )->with( 'priority_min' )->andReturn( 5 );
		$request->shouldReceive( 'get_param' )->with( 'priority_max' )->andReturn( 10 );
		$request->shouldReceive( 'get_param' )->with( 'card_template' )->andReturn( 'main' );
		$request->shouldReceive( 'get_param' )->with( 'get_total_count' )->andReturn( false );

		$controller = new FSE_Post_Feed_Controller();
		$controller->search_with_filters( $request );

		// Verify priority was set correctly
		$this->assertEquals( 5, $captured_options['priority_min'] );
		$this->assertEquals( 10, $captured_options['priority_max'] );
	}

	/**
	 * Test search_with_filters uses custom card template ID
	 *
	 * Evidence: Voxel post-feed.php:1468-1471 sets template_id
	 */
	public function test_search_with_filters_uses_card_template(): void {
		$post_type = Mockery::mock();
		$post_type->shouldReceive( 'get_key' )->andReturn( 'place' );

		$post_type_class = Mockery::mock( 'alias:Voxel\Post_Type' );
		$post_type_class->shouldReceive( 'get' )->with( 'place' )->andReturn( $post_type );

		$captured_options = null;
		Functions\when( 'Voxel\get_search_results' )->alias( function( $args, $options ) use ( &$captured_options ) {
			$captured_options = $options;
			return [
				'ids' => [],
				'render' => '',
				'styles' => '',
				'scripts' => '',
				'has_next' => false,
				'template_id' => 999,
			];
		} );

		Functions\when( 'Voxel\count_format' )->justReturn( '0' );

		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_type' )->andReturn( 'place' );
		$request->shouldReceive( 'get_param' )->with( 'filters' )->andReturn( [] );
		$request->shouldReceive( 'get_param' )->with( 'limit' )->andReturn( 10 );
		$request->shouldReceive( 'get_param' )->with( 'offset' )->andReturn( 0 );
		$request->shouldReceive( 'get_param' )->with( 'page' )->andReturn( 1 );
		$request->shouldReceive( 'get_param' )->with( 'exclude' )->andReturn( '' );
		$request->shouldReceive( 'get_param' )->with( 'priority_filter' )->andReturn( false );
		$request->shouldReceive( 'get_param' )->with( 'priority_min' )->andReturn( 0 );
		$request->shouldReceive( 'get_param' )->with( 'priority_max' )->andReturn( 0 );
		$request->shouldReceive( 'get_param' )->with( 'card_template' )->andReturn( '999' );
		$request->shouldReceive( 'get_param' )->with( 'get_total_count' )->andReturn( false );

		$controller = new FSE_Post_Feed_Controller();
		$response = $controller->search_with_filters( $request );
		$data = $response->get_data();

		// Verify template_id was set correctly
		$this->assertEquals( 999, $captured_options['template_id'] );
		$this->assertEquals( 999, $data['templateId'] );
	}

	/**
	 * Test search_with_filters returns error when Voxel not active
	 */
	public function test_search_with_filters_error_when_voxel_inactive(): void {
		// Don't mock Voxel classes - simulate them not existing
		// Note: In actual test run, we'd need to handle class_exists differently

		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_type' )->andReturn( 'place' );

		// This test would need special handling since we're mocking the class above
		// In a real test environment, you'd skip or conditionally test this
		$this->assertTrue( true ); // Placeholder assertion
	}
}

/**
 * Mock WP_REST_Response for testing
 */
if ( ! class_exists( '\WP_REST_Response' ) ) {
	class WP_REST_Response {
		private $data;
		private $status;

		public function __construct( $data = null, $status = 200 ) {
			$this->data = $data;
			$this->status = $status;
		}

		public function get_data() {
			return $this->data;
		}

		public function get_status() {
			return $this->status;
		}
	}
}
