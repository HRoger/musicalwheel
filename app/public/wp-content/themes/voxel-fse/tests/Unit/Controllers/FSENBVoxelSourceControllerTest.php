<?php
declare(strict_types=1);

namespace VoxelFSE\Tests\Unit\Controllers;

use PHPUnit\Framework\TestCase;
use Brain\Monkey;
use Brain\Monkey\Functions;
use Mockery;
use VoxelFSE\Controllers\FSE_NB_Voxel_Source_Controller;

class FSENBVoxelSourceControllerTest extends TestCase {

	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();

		// Define NectarBlocks constant so authorize() passes.
		if ( ! defined( 'NECTAR_BLOCKS_VERSION' ) ) {
			define( 'NECTAR_BLOCKS_VERSION', '2.0.0' );
		}

		// Stub common WP functions used by the controller.
		Functions\when( 'add_filter' )->justReturn( true );
		Functions\when( 'wp_kses_post' )->returnArg();
		Functions\when( 'esc_html__' )->returnArg();
		Functions\when( 'wp_get_attachment_url' )->alias( function ( $id ) {
			return $id ? "https://example.com/uploads/file-{$id}.pdf" : '';
		});
		Functions\when( 'wp_get_attachment_image_url' )->alias( function ( $id, $size = 'full' ) {
			return $id ? "https://example.com/uploads/image-{$id}-{$size}.jpg" : '';
		});
		Functions\when( 'wp_get_attachment_image' )->alias( function ( $id, $size = 'full', $icon = false, $attrs = [] ) {
			$class = $attrs['class'] ?? '';
			return "<img src=\"https://example.com/uploads/image-{$id}-{$size}.jpg\" class=\"{$class}\" />";
		});
	}

	protected function tearDown(): void {
		Monkey\tearDown();
		Mockery::close();
		parent::tearDown();
	}

	// -------------------------------------------------------------------------
	// Helper: create a mock Voxel field
	// -------------------------------------------------------------------------

	private function make_voxel_field( string $key, string $label, string $type, array $extra = [] ): object {
		$field = Mockery::mock();
		$field->shouldReceive( 'get_type' )->andReturn( $type );
		$field->shouldReceive( 'get_label' )->andReturn( $label );
		$field->shouldReceive( 'get_prop' )->andReturn( $extra['taxonomy'] ?? '' );
		return $field;
	}

	private function make_voxel_post_type( string $slug, string $label, array $fields ): object {
		$pt = Mockery::mock();
		$pt->shouldReceive( 'get_label' )->andReturn( $label );

		$field_map = [];
		foreach ( $fields as $key => $field ) {
			$field_map[ $key ] = $field;
		}
		$pt->shouldReceive( 'get_fields' )->andReturn( $field_map );
		return $pt;
	}

	// -------------------------------------------------------------------------
	// Helper: instantiate controller without triggering hooks
	// -------------------------------------------------------------------------

	private function make_controller(): FSE_NB_Voxel_Source_Controller {
		return new FSE_NB_Voxel_Source_Controller();
	}

	// =========================================================================
	// REST API Interceptor tests
	// =========================================================================

	public function test_rest_interceptor_ignores_unrelated_routes(): void {
		$controller = $this->make_controller();

		$response = new \WP_REST_Response( [ 'some' => 'data' ], 200 );
		$server   = Mockery::mock( '\WP_REST_Server' );
		$request  = new \WP_REST_Request( 'GET', '/wp/v2/posts' );

		$method = new \ReflectionMethod( $controller, 'append_voxel_fields_to_rest' );
		$method->setAccessible( true );
		$result = $method->invoke( $controller, $response, $server, $request );

		$this->assertSame( $response, $result );
		$this->assertEquals( [ 'some' => 'data' ], $result->get_data() );
	}

	public function test_rest_interceptor_skips_error_responses(): void {
		$controller = $this->make_controller();

		$response = new \WP_REST_Response(
			[ 'code' => 'rest_forbidden', 'message' => 'Forbidden' ],
			401
		);
		$server  = Mockery::mock( '\WP_REST_Server' );
		$request = new \WP_REST_Request( 'GET', '/nectar/v1/post-data/dynamic-fields' );

		$method = new \ReflectionMethod( $controller, 'append_voxel_fields_to_rest' );
		$method->setAccessible( true );
		$result = $method->invoke( $controller, $response, $server, $request );

		// Should return response unchanged — no Voxel fields appended.
		$this->assertEquals( 401, $result->get_status() );
		$this->assertArrayHasKey( 'code', $result->get_data() );
	}

	public function test_rest_interceptor_appends_voxel_fields(): void {
		// Mock \Voxel\Post_Type.
		$pt_mock = Mockery::mock( 'alias:\\Voxel\\Post_Type' );

		$stays_pt = $this->make_voxel_post_type( 'stays', 'Stays', [
			'gallery'  => $this->make_voxel_field( 'gallery', 'Gallery', 'image' ),
			'area'     => $this->make_voxel_field( 'area', 'Area (m²)', 'number' ),
			'amenities' => $this->make_voxel_field( 'amenities', 'Amenities', 'taxonomy', [ 'taxonomy' => 'stays_amenities' ] ),
			// Skipped types should not appear:
			'product'  => $this->make_voxel_field( 'product', 'Product', 'product' ),
			'step1'    => $this->make_voxel_field( 'step1', 'Step 1', 'ui-step' ),
		]);

		$pt_mock->shouldReceive( 'get_voxel_types' )->andReturn( [ $stays_pt ] );

		Functions\when( 'get_post_type' )->justReturn( '' );

		$controller = $this->make_controller();

		// Simulate NB's existing response with one built-in group.
		$existing_data = [
			[
				'label'   => 'Custom Fields',
				'options' => [ [ 'value' => '_some_meta', 'label' => 'Some Meta' ] ],
			],
		];

		$response = new \WP_REST_Response( $existing_data, 200 );
		$server   = Mockery::mock( '\WP_REST_Server' );
		$request  = new \WP_REST_Request( 'GET', '/nectar/v1/post-data/dynamic-fields' );
		$request->set_param( 'postId', 0 );

		$method = new \ReflectionMethod( $controller, 'append_voxel_fields_to_rest' );
		$method->setAccessible( true );
		$result = $method->invoke( $controller, $response, $server, $request );

		$data = $result->get_data();

		// Should have the original group + 1 Voxel group.
		$this->assertCount( 2, $data );
		$this->assertEquals( 'Custom Fields', $data[0]['label'] );
		$this->assertEquals( 'Voxel: Stays', $data[1]['label'] );

		// Voxel group should have 3 fields (gallery, area, amenities) — NOT product or ui-step.
		$voxel_options = $data[1]['options'];
		$this->assertCount( 3, $voxel_options );

		$values = array_column( $voxel_options, 'value' );
		$this->assertContains( 'gallery', $values );
		$this->assertContains( 'area', $values );
		$this->assertContains( 'amenities', $values );
		$this->assertNotContains( 'product', $values );
		$this->assertNotContains( 'step1', $values );

		// Check field structure matches NB expectations.
		$gallery_opt = $voxel_options[ array_search( 'gallery', $values ) ];
		$this->assertEquals( 'Gallery', $gallery_opt['label'] );
		$this->assertEquals( 'image', $gallery_opt['type'] );
		$this->assertEquals( 'voxel', $gallery_opt['group'] );
	}

	public function test_rest_interceptor_returns_single_type_for_concrete_post(): void {
		$pt_mock = Mockery::mock( 'alias:\\Voxel\\Post_Type' );

		$stays_pt = $this->make_voxel_post_type( 'stays', 'Stays', [
			'area' => $this->make_voxel_field( 'area', 'Area', 'number' ),
		]);

		$pt_mock->shouldReceive( 'get' )->with( 'stays' )->andReturn( $stays_pt );

		Functions\when( 'get_post_type' )->justReturn( 'stays' );

		$controller = $this->make_controller();

		$response = new \WP_REST_Response( [], 200 );
		$server   = Mockery::mock( '\WP_REST_Server' );
		$request  = new \WP_REST_Request( 'GET', '/nectar/v1/post-data/dynamic-fields' );
		$request->set_param( 'postId', 42 );

		$method = new \ReflectionMethod( $controller, 'append_voxel_fields_to_rest' );
		$method->setAccessible( true );
		$result = $method->invoke( $controller, $response, $server, $request );

		$data = $result->get_data();
		$this->assertCount( 1, $data );
		$this->assertEquals( 'Voxel: Stays', $data[0]['label'] );
	}

	// =========================================================================
	// Frontend fields filter tests (init_voxel_fields)
	// =========================================================================

	public function test_init_voxel_fields_populates_output(): void {
		$pt_mock = Mockery::mock( 'alias:\\Voxel\\Post_Type' );

		$stays_pt = $this->make_voxel_post_type( 'stays', 'Stays', [
			'name'     => $this->make_voxel_field( 'name', 'Stay Name', 'text' ),
			'location' => $this->make_voxel_field( 'location', 'Location', 'location' ),
			'product'  => $this->make_voxel_field( 'product', 'Product', 'product' ),
		]);

		$pt_mock->shouldReceive( 'get' )->with( 'stays' )->andReturn( $stays_pt );
		Functions\when( 'get_post_type' )->justReturn( 'stays' );

		$controller = $this->make_controller();

		$method = new \ReflectionMethod( $controller, 'init_voxel_fields' );
		$method->setAccessible( true );
		$result = $method->invoke( $controller, [], 42, false );

		// Should contain name and location, but NOT product (skipped type).
		$this->assertArrayHasKey( 'name', $result );
		$this->assertArrayHasKey( 'location', $result );
		$this->assertArrayNotHasKey( 'product', $result );

		// Check structure matches Frontend_Render.php expectations.
		$name_entry = $result['name'];
		$this->assertEquals( 'Stay Name', $name_entry['title'] );
		$this->assertEquals( 'Voxel: Stays', $name_entry['group'] );
		$this->assertEquals( 'text', $name_entry['field_data']['type'] );
		$this->assertEquals( 'name', $name_entry['field_data']['field_name'] );
		$this->assertEquals( 'voxel', $name_entry['field_data']['field_type'] );
	}

	public function test_init_voxel_fields_returns_unmodified_when_no_voxel_type(): void {
		Functions\when( 'get_post_type' )->justReturn( 'post' );

		// \Voxel\Post_Type::get('post') throws for non-Voxel types.
		$pt_mock = Mockery::mock( 'alias:\\Voxel\\Post_Type' );
		$pt_mock->shouldReceive( 'get' )->with( 'post' )->andThrow( new \Exception( 'Not a Voxel type' ) );

		$controller = $this->make_controller();
		$existing   = [ 'existing_field' => [ 'title' => 'Existing' ] ];

		$method = new \ReflectionMethod( $controller, 'init_voxel_fields' );
		$method->setAccessible( true );
		$result = $method->invoke( $controller, $existing, 42, false );

		$this->assertEquals( $existing, $result );
	}

	// =========================================================================
	// Content render tests (get_content)
	// =========================================================================

	public function test_get_content_skips_non_voxel_fields(): void {
		$controller = $this->make_controller();

		$args = [
			'post_id'          => 42,
			'replacement_type' => 'text',
			'field_data'       => [
				'field_type' => 'acf',
				'type'       => 'text',
				'field_name' => 'some_field',
			],
			'attributes'       => [],
		];

		$method = new \ReflectionMethod( $controller, 'get_content' );
		$method->setAccessible( true );
		$result = $method->invoke( $controller, 'original_output', $args, false );

		$this->assertEquals( 'original_output', $result );
	}

	public function test_get_content_renders_text_field(): void {
		Functions\when( 'get_post_meta' )->justReturn( 'Hello World' );

		$controller = $this->make_controller();

		$args = [
			'post_id'          => 42,
			'replacement_type' => 'text',
			'field_data'       => [
				'field_type' => 'voxel',
				'type'       => 'text',
				'field_name' => 'name',
			],
			'attributes'       => [],
		];

		$method = new \ReflectionMethod( $controller, 'get_content' );
		$method->setAccessible( true );
		$result = $method->invoke( $controller, '', $args, false );

		$this->assertEquals( 'Hello World', $result );
	}

	public function test_get_content_renders_empty_for_non_scalar_meta(): void {
		Functions\when( 'get_post_meta' )->justReturn( [ 'array', 'value' ] );

		$controller = $this->make_controller();

		$args = [
			'post_id'          => 42,
			'replacement_type' => 'text',
			'field_data'       => [
				'field_type' => 'voxel',
				'type'       => 'text',
				'field_name' => 'bad_field',
			],
			'attributes'       => [],
		];

		$method = new \ReflectionMethod( $controller, 'get_content' );
		$method->setAccessible( true );
		$result = $method->invoke( $controller, '', $args, false );

		$this->assertEquals( '', $result );
	}

	public function test_get_content_renders_switcher_true(): void {
		Functions\when( 'get_post_meta' )->justReturn( '1' );

		$controller = $this->make_controller();

		$args = [
			'post_id'          => 42,
			'replacement_type' => 'text',
			'field_data'       => [
				'field_type' => 'voxel',
				'type'       => 'switcher',
				'field_name' => 'is_featured',
			],
			'attributes'       => [
				'isTrueText'  => 'Featured',
				'isFalseText' => 'Not featured',
			],
		];

		$method = new \ReflectionMethod( $controller, 'get_content' );
		$method->setAccessible( true );
		$result = $method->invoke( $controller, '', $args, false );

		$this->assertEquals( 'Featured', $result );
	}

	public function test_get_content_renders_switcher_false(): void {
		Functions\when( 'get_post_meta' )->justReturn( '' );

		$controller = $this->make_controller();

		$args = [
			'post_id'          => 42,
			'replacement_type' => 'text',
			'field_data'       => [
				'field_type' => 'voxel',
				'type'       => 'switcher',
				'field_name' => 'is_featured',
			],
			'attributes'       => [
				'isTrueText'  => 'Featured',
				'isFalseText' => 'Not featured',
			],
		];

		$method = new \ReflectionMethod( $controller, 'get_content' );
		$method->setAccessible( true );
		$result = $method->invoke( $controller, '', $args, false );

		$this->assertEquals( 'Not featured', $result );
	}

	public function test_get_content_renders_image_url(): void {
		Functions\when( 'get_post_meta' )->justReturn( '100,200,300' );

		$controller = $this->make_controller();

		$args = [
			'post_id'          => 42,
			'replacement_type' => 'text',
			'field_data'       => [
				'field_type' => 'voxel',
				'type'       => 'image',
				'field_name' => 'gallery',
			],
			'attributes'       => [ 'size' => 'medium' ],
		];

		$method = new \ReflectionMethod( $controller, 'get_content' );
		$method->setAccessible( true );
		$result = $method->invoke( $controller, '', $args, false );

		// Should return URL of first attachment (id=100).
		$this->assertEquals( 'https://example.com/uploads/image-100-medium.jpg', $result );
	}

	public function test_get_content_renders_image_tag_in_content(): void {
		Functions\when( 'get_post_meta' )->justReturn( '55' );

		$controller = $this->make_controller();

		$args = [
			'post_id'          => 42,
			'replacement_type' => 'image',
			'field_data'       => [
				'field_type' => 'voxel',
				'type'       => 'image',
				'field_name' => 'cover',
			],
			'attributes'       => [],
			'class'            => 'my-image-class',
		];

		$method = new \ReflectionMethod( $controller, 'get_content' );
		$method->setAccessible( true );
		$result = $method->invoke( $controller, '', $args, false );

		$this->assertStringContainsString( '<img', $result );
		$this->assertStringContainsString( 'image-55-full', $result );
		$this->assertStringContainsString( 'my-image-class', $result );
	}

	public function test_get_content_renders_taxonomy(): void {
		$term1 = (object) [ 'name' => 'WiFi' ];
		$term2 = (object) [ 'name' => 'Pool' ];
		Functions\when( 'get_the_terms' )->justReturn( [ $term1, $term2 ] );

		$controller = $this->make_controller();

		$args = [
			'post_id'          => 42,
			'replacement_type' => 'text',
			'field_data'       => [
				'field_type' => 'voxel',
				'type'       => 'taxonomy',
				'field_name' => 'amenities',
				'taxonomy'   => 'stays_amenities',
			],
			'attributes'       => [],
		];

		$method = new \ReflectionMethod( $controller, 'get_content' );
		$method->setAccessible( true );
		$result = $method->invoke( $controller, '', $args, false );

		$this->assertEquals( 'WiFi, Pool', $result );
	}

	public function test_get_content_renders_location_from_json(): void {
		$json = json_encode( [ 'address' => '123 Main St, NYC', 'lat' => 40.7, 'lng' => -74.0 ] );
		Functions\when( 'get_post_meta' )->justReturn( $json );

		$controller = $this->make_controller();

		$args = [
			'post_id'          => 42,
			'replacement_type' => 'text',
			'field_data'       => [
				'field_type' => 'voxel',
				'type'       => 'location',
				'field_name' => 'location',
			],
			'attributes'       => [],
		];

		$method = new \ReflectionMethod( $controller, 'get_content' );
		$method->setAccessible( true );
		$result = $method->invoke( $controller, '', $args, false );

		$this->assertEquals( '123 Main St, NYC', $result );
	}

	public function test_get_content_renders_location_from_array(): void {
		Functions\when( 'get_post_meta' )->justReturn( [ 'address' => '456 Broadway' ] );

		$controller = $this->make_controller();

		$args = [
			'post_id'          => 42,
			'replacement_type' => 'text',
			'field_data'       => [
				'field_type' => 'voxel',
				'type'       => 'location',
				'field_name' => 'location',
			],
			'attributes'       => [],
		];

		$method = new \ReflectionMethod( $controller, 'get_content' );
		$method->setAccessible( true );
		$result = $method->invoke( $controller, '', $args, false );

		$this->assertEquals( '456 Broadway', $result );
	}

	public function test_get_content_renders_texteditor_placeholder_in_editor(): void {
		$controller = $this->make_controller();

		$args = [
			'post_id'          => 42,
			'replacement_type' => 'text',
			'field_data'       => [
				'field_type' => 'voxel',
				'type'       => 'texteditor',
				'field_name' => 'description',
			],
			'attributes'       => [],
		];

		$method = new \ReflectionMethod( $controller, 'get_content' );
		$method->setAccessible( true );
		$result = $method->invoke( $controller, '', $args, true ); // is_editor = true

		$this->assertStringContainsString( 'Rich text field', $result );
	}

	public function test_get_content_renders_file_url(): void {
		Functions\when( 'get_post_meta' )->justReturn( '77' );

		$controller = $this->make_controller();

		$args = [
			'post_id'          => 42,
			'replacement_type' => 'text',
			'field_data'       => [
				'field_type' => 'voxel',
				'type'       => 'file',
				'field_name' => 'menu_pdf',
			],
			'attributes'       => [],
		];

		$method = new \ReflectionMethod( $controller, 'get_content' );
		$method->setAccessible( true );
		$result = $method->invoke( $controller, '', $args, false );

		$this->assertEquals( 'https://example.com/uploads/file-77.pdf', $result );
	}

	public function test_get_content_returns_empty_for_unknown_type(): void {
		$controller = $this->make_controller();

		$args = [
			'post_id'          => 42,
			'replacement_type' => 'text',
			'field_data'       => [
				'field_type' => 'voxel',
				'type'       => 'unknown_type',
				'field_name' => 'something',
			],
			'attributes'       => [],
		];

		$method = new \ReflectionMethod( $controller, 'get_content' );
		$method->setAccessible( true );
		$result = $method->invoke( $controller, '', $args, false );

		$this->assertEquals( '', $result );
	}
}
