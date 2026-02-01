<?php
/**
 * FSE Map API Controller Tests
 *
 * Tests for REST API endpoints in FSE_Map_API_Controller.
 * Verifies 1:1 parity with Voxel PHP templates.
 *
 * @package VoxelFSE\Tests\Unit\Controllers
 */

namespace VoxelFSE\Tests\Unit\Controllers;

use PHPUnit\Framework\TestCase;
use Brain\Monkey;
use Brain\Monkey\Functions;
use Mockery;
use VoxelFSE\Controllers\FSE_Map_API_Controller;

class FSEMapAPIControllerTest extends TestCase {

	public function setUp(): void {
		parent::setUp();
		Monkey\setUp();

		// Mock WordPress functions
		Functions\when( 'register_rest_route' )->justReturn( true );
		Functions\when( 'esc_attr' )->returnArg();
		Functions\when( 'esc_url' )->returnArg();
		Functions\when( 'esc_html' )->returnArg();
	}

	public function tearDown(): void {
		Monkey\tearDown();
		Mockery::close();
		parent::tearDown();
	}

	/**
	 * Test successful post location retrieval
	 */
	public function test_get_post_location_success() {
		$post_id = 123;

		// Mock Voxel\Post
		$post_instance = Mockery::mock();
		$post_instance->shouldReceive( 'get_id' )->andReturn( $post_id );
		$post_instance->shouldReceive( 'get_link' )->andReturn( 'http://example.com/post/123' );

		// Mock location field
		$location_field = Mockery::mock();
		$location_field->shouldReceive( 'get_value' )->andReturn( [
			'latitude'  => 40.7128,
			'longitude' => -74.0060,
			'address'   => 'New York, NY',
		] );

		$post_instance->shouldReceive( 'get_field' )->with( 'location' )->andReturn( $location_field );

		// Mock static get
		$post_mock = Mockery::mock( 'alias:Voxel\Post' );
		$post_mock->shouldReceive( 'get' )->with( $post_id )->andReturn( $post_instance );

		// Mock _post_get_marker function
		Functions\when( 'Voxel\_post_get_marker' )->justReturn(
			'<div class="map-marker marker-type-icon mi-static" data-post-id="123"><svg>...</svg></div>'
		);

		// Create controller and request
		$controller = new FSE_Map_API_Controller();
		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_id' )->andReturn( $post_id );

		// Execute
		$response = $controller->get_post_location( $request );
		$data = $response->get_data();

		// Assertions
		$this->assertTrue( $data['success'] );
		$this->assertEquals( 40.7128, $data['latitude'] );
		$this->assertEquals( -74.0060, $data['longitude'] );
		$this->assertEquals( 'New York, NY', $data['address'] );
		$this->assertStringContainsString( 'map-marker', $data['marker'] );
	}

	/**
	 * Test post not found
	 */
	public function test_get_post_location_post_not_found() {
		$post_mock = Mockery::mock( 'alias:Voxel\Post' );
		$post_mock->shouldReceive( 'get' )->andReturn( null );

		$controller = new FSE_Map_API_Controller();
		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_id' )->andReturn( 999 );

		$response = $controller->get_post_location( $request );

		$this->assertEquals( 404, $response->get_status() );
		$this->assertFalse( $response->get_data()['success'] );
	}

	/**
	 * Test post without location field
	 */
	public function test_get_post_location_no_location_field() {
		$post_id = 123;

		$post_instance = Mockery::mock();
		$post_instance->shouldReceive( 'get_field' )->with( 'location' )->andReturn( null );

		$post_mock = Mockery::mock( 'alias:Voxel\Post' );
		$post_mock->shouldReceive( 'get' )->with( $post_id )->andReturn( $post_instance );

		$controller = new FSE_Map_API_Controller();
		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_id' )->andReturn( $post_id );

		$response = $controller->get_post_location( $request );

		$this->assertEquals( 400, $response->get_status() );
		$this->assertFalse( $response->get_data()['success'] );
		$this->assertEquals( 'Post has no location field', $response->get_data()['message'] );
	}

	/**
	 * Test post with invalid location coordinates
	 */
	public function test_get_post_location_invalid_coordinates() {
		$post_id = 123;

		$post_instance = Mockery::mock();

		// Mock location field with empty/invalid coordinates
		$location_field = Mockery::mock();
		$location_field->shouldReceive( 'get_value' )->andReturn( [
			'latitude'  => null,
			'longitude' => null,
			'address'   => '',
		] );

		$post_instance->shouldReceive( 'get_field' )->with( 'location' )->andReturn( $location_field );

		$post_mock = Mockery::mock( 'alias:Voxel\Post' );
		$post_mock->shouldReceive( 'get' )->with( $post_id )->andReturn( $post_instance );

		$controller = new FSE_Map_API_Controller();
		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_id' )->andReturn( $post_id );

		$response = $controller->get_post_location( $request );

		$this->assertEquals( 400, $response->get_status() );
		$this->assertFalse( $response->get_data()['success'] );
		$this->assertEquals( 'Post has no valid location', $response->get_data()['message'] );
	}

	/**
	 * Test bulk markers retrieval
	 */
	public function test_get_markers_bulk_success() {
		$post_ids = [ 1, 2, 3 ];

		// Create mock posts
		$posts = [];
		foreach ( $post_ids as $id ) {
			$post_instance = Mockery::mock();
			$post_instance->shouldReceive( 'get_id' )->andReturn( $id );
			$post_instance->shouldReceive( 'get_link' )->andReturn( "http://example.com/post/{$id}" );

			$location_field = Mockery::mock();
			$location_field->shouldReceive( 'get_value' )->andReturn( [
				'latitude'  => 40.7128 + $id * 0.01,
				'longitude' => -74.0060 + $id * 0.01,
				'address'   => "Address {$id}",
			] );

			$post_instance->shouldReceive( 'get_field' )->with( 'location' )->andReturn( $location_field );
			$posts[ $id ] = $post_instance;
		}

		$post_mock = Mockery::mock( 'alias:Voxel\Post' );
		$post_mock->shouldReceive( 'get' )->andReturnUsing( function ( $id ) use ( $posts ) {
			return $posts[ $id ] ?? null;
		} );

		// Mock _post_get_marker function
		Functions\when( 'Voxel\_post_get_marker' )->justReturn(
			'<div class="map-marker marker-type-icon mi-static"><svg>...</svg></div>'
		);

		$controller = new FSE_Map_API_Controller();
		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_ids' )->andReturn( $post_ids );

		$response = $controller->get_markers_bulk( $request );
		$data = $response->get_data();

		// Assertions
		$this->assertTrue( $data['success'] );
		$this->assertCount( 3, $data['markers'] );

		// Verify first marker
		$this->assertEquals( 1, $data['markers'][0]['postId'] );
		$this->assertIsFloat( $data['markers'][0]['lat'] );
		$this->assertIsFloat( $data['markers'][0]['lng'] );
		$this->assertStringContainsString( 'map-marker', $data['markers'][0]['template'] );
	}

	/**
	 * Test bulk markers with empty post IDs
	 */
	public function test_get_markers_bulk_empty_ids() {
		$controller = new FSE_Map_API_Controller();
		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_ids' )->andReturn( [] );

		$response = $controller->get_markers_bulk( $request );
		$data = $response->get_data();

		$this->assertTrue( $data['success'] );
		$this->assertEmpty( $data['markers'] );
	}

	/**
	 * Test marker response structure matches Voxel format
	 * (1:1 parity with templates/widgets/map.php:10-21)
	 */
	public function test_marker_response_structure_matches_voxel() {
		$post_id = 123;

		$post_instance = Mockery::mock();
		$post_instance->shouldReceive( 'get_id' )->andReturn( $post_id );
		$post_instance->shouldReceive( 'get_link' )->andReturn( 'http://example.com/post/123' );

		$location_field = Mockery::mock();
		$location_field->shouldReceive( 'get_value' )->andReturn( [
			'latitude'  => 51.492,
			'longitude' => -0.130,
			'address'   => 'London, UK',
		] );

		$post_instance->shouldReceive( 'get_field' )->with( 'location' )->andReturn( $location_field );

		$post_mock = Mockery::mock( 'alias:Voxel\Post' );
		$post_mock->shouldReceive( 'get' )->with( $post_id )->andReturn( $post_instance );

		// Mock marker matching Voxel's default format
		$expected_marker = '<div class="map-marker marker-type-icon mi-static" data-post-id="123" data-post-link="http://example.com/post/123" data-position="51.492,-0.130"><svg viewBox="0 0 32 32"><use width="32" height="32" href="#ts-symbol-marker"></use></svg></div>';
		Functions\when( 'Voxel\_post_get_marker' )->justReturn( $expected_marker );

		$controller = new FSE_Map_API_Controller();
		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_id' )->andReturn( $post_id );

		$response = $controller->get_marker( $request );
		$data = $response->get_data();

		// Verify marker has required data attributes (Voxel parity)
		$this->assertTrue( $data['success'] );
		$this->assertStringContainsString( 'data-post-id="123"', $data['marker'] );
		$this->assertStringContainsString( 'data-post-link=', $data['marker'] );
		$this->assertStringContainsString( 'data-position=', $data['marker'] );
		$this->assertStringContainsString( '#ts-symbol-marker', $data['marker'] );
	}
}
