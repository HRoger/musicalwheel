<?php
namespace VoxelFSE\Tests\Unit\Controllers;

use PHPUnit\Framework\TestCase;
use Brain\Monkey;
use Brain\Monkey\Functions;
use Mockery;
use VoxelFSE\Controllers\FSE_Advanced_List_API_Controller;

class FSEAdvancedListAPIControllerTest extends TestCase {

	public function setUp(): void {
		parent::setUp();
		Monkey\setUp();
		
		// Define Voxel constants if not exists
		if ( ! defined( 'Voxel\FOLLOW_ACCEPTED' ) ) define( 'Voxel\FOLLOW_ACCEPTED', 1 );
		if ( ! defined( 'Voxel\FOLLOW_REQUESTED' ) ) define( 'Voxel\FOLLOW_REQUESTED', 0 );
		
		// Mock WordPress functions
		Functions\when( 'register_rest_route' )->justReturn( true );
		Functions\when( 'wp_create_nonce' )->returnArg(); // Return the action name as nonce
		Functions\when( 'home_url' )->justReturn( 'http://example.com' );
		Functions\when( 'wp_nonce_url' )->justReturn( 'http://example.com' );
		Functions\when( 'esc_url' )->returnArg();
		Functions\when( 'is_user_logged_in' )->justReturn( true );
	}

	public function tearDown(): void {
		Monkey\tearDown();
		Mockery::close();
		parent::tearDown();
	}

	public function test_get_post_context_success() {
		// Mock Voxel Post
		$post_id = 123;
		$post_mock = Mockery::mock( 'alias:Voxel\Post' );
		
		// Mock Voxel\Post::get($post_id) to return our post object
		$post_instance = Mockery::mock();
		$post_instance->shouldReceive( 'get_id' )->andReturn( $post_id );
		$post_instance->shouldReceive( 'get_title' )->andReturn( 'Test Post' );
		$post_instance->shouldReceive( 'get_link' )->andReturn( 'http://example.com/post/123' );
		$post_instance->shouldReceive( 'is_editable_by_current_user' )->andReturn( true );
		$post_instance->shouldReceive( 'get_edit_link' )->andReturn( 'http://example.com/edit/123' );
		$post_instance->shouldReceive( 'is_deletable_by_current_user' )->andReturn( true );
		$post_instance->shouldReceive( 'get_status' )->andReturn( 'publish' );
		$post_instance->shouldReceive( 'get_post_type' )->andReturn( null );
		$post_instance->shouldReceive( 'get_author' )->andReturn( null );
		$post_instance->shouldReceive( 'get_field' )->with( 'product' )->andReturn( null );

		$post_mock->shouldReceive( 'get' )->with( $post_id )->andReturn( $post_instance );

		// Mock Voxel User
		$user_mock = Mockery::mock( 'alias:Voxel\current_user' );
		$user_instance = Mockery::mock();
		$user_instance->shouldReceive( 'get_follow_status' )->andReturn( 0 ); // Not followed
		
		Functions\when( 'Voxel\current_user' )->justReturn( $user_instance );

		// Instantiate Controller
		$controller = new FSE_Advanced_List_API_Controller();
		
		// Create Request
		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_id' )->andReturn( $post_id );

		// Execute
		$response = $controller->get_post_context( $request );
		$data = $response->get_data();

		// Assertions
		$this->assertEquals( $post_id, $data['postId'] );
		$this->assertEquals( 'Test Post', $data['postTitle'] );
		$this->assertTrue( $data['isEditable'] );
		$this->assertTrue( $data['permissions']['delete'] );
		$this->assertTrue( $data['permissions']['publish'] );
		$this->assertEquals( 'publish', $data['status'] );
		$this->assertEquals( 'vx_delete_post', $data['nonces']['delete_post'] );
	}

	public function test_get_post_context_not_found() {
		// Mock Voxel Post lookup failing
		$post_mock = Mockery::mock( 'alias:Voxel\Post' );
		$post_mock->shouldReceive( 'get' )->andReturn( null );

		$controller = new FSE_Advanced_List_API_Controller();
		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_id' )->andReturn( 999 );

		$response = $controller->get_post_context( $request );
		$this->assertEquals( 404, $response->get_status() ); 
	}
}
