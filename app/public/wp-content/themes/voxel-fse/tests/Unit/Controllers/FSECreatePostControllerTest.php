<?php
/**
 * FSE Create Post Controller Tests
 *
 * Tests for the Create Post block's REST API controller.
 * Verifies 1:1 parity with Voxel's create-post widget logic.
 *
 * Evidence:
 * - themes/voxel/app/widgets/create-post.php:4955-5058 (render method)
 * - themes/voxel/templates/widgets/create-post.php:11 (permission check)
 *
 * @package VoxelFSE\Tests\Unit\Controllers
 */

namespace VoxelFSE\Tests\Unit\Controllers;

use PHPUnit\Framework\TestCase;
use Brain\Monkey;
use Brain\Monkey\Functions;
use Mockery;
use VoxelFSE\Controllers\FSE_Create_Post_Controller;

class FSECreatePostControllerTest extends TestCase {

	public function setUp(): void {
		parent::setUp();
		Monkey\setUp();

		// Mock WordPress functions
		Functions\when( 'register_rest_route' )->justReturn( true );
		Functions\when( 'wp_create_nonce' )->returnArg(); // Return the action name as nonce
		Functions\when( 'rest_ensure_response' )->alias( function( $data ) {
			return new \WP_REST_Response( $data );
		} );
		Functions\when( 'is_user_logged_in' )->justReturn( true );
		Functions\when( 'get_term_meta' )->justReturn( '' );
		Functions\when( 'get_permalink' )->justReturn( 'http://example.com/create-post/' );
		Functions\when( 'add_query_arg' )->alias( function( $args, $url ) {
			return $url . '?' . http_build_query( $args );
		} );
		Functions\when( '_x' )->returnArg( 1 ); // Return first arg (the string)
	}

	public function tearDown(): void {
		Monkey\tearDown();
		Mockery::close();
		parent::tearDown();
	}

	/**
	 * Test post-context endpoint returns correct structure for logged-in user with create permission
	 */
	public function test_get_post_context_with_create_permission() {
		$post_type_key = 'place';

		// Mock Voxel Post_Type
		$post_type_mock = Mockery::mock();
		$post_type_mock->shouldReceive( 'get_key' )->andReturn( $post_type_key );
		$post_type_mock->shouldReceive( 'get_label' )->andReturn( 'Places' );
		$post_type_mock->shouldReceive( 'get_singular_name' )->andReturn( 'Place' );
		$post_type_mock->shouldReceive( 'get_fields' )->andReturn( [] );

		// Mock Voxel Post_Type::get()
		$post_type_class = Mockery::mock( 'alias:Voxel\Post_Type' );
		$post_type_class->shouldReceive( 'get' )->with( $post_type_key )->andReturn( $post_type_mock );

		// Mock Voxel User with create permission
		$user_mock = Mockery::mock();
		$user_mock->shouldReceive( 'get_id' )->andReturn( 1 );
		$user_mock->shouldReceive( 'can_create_post' )->with( $post_type_key )->andReturn( true );

		Functions\when( 'Voxel\get_current_user' )->justReturn( $user_mock );
		Functions\when( 'Voxel\get' )->justReturn( null );

		// Create Request
		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_type' )->andReturn( $post_type_key );
		$request->shouldReceive( 'get_param' )->with( 'post_id' )->andReturn( null );

		// Instantiate Controller
		$controller = new FSE_Create_Post_Controller();

		// Execute
		$response = $controller->get_post_context( $request );
		$data = $response->get_data();

		// Assertions - Permission structure
		$this->assertTrue( $data['isLoggedIn'] );
		$this->assertEquals( 1, $data['userId'] );
		$this->assertTrue( $data['permissions']['create'] );
		$this->assertFalse( $data['permissions']['edit'] ); // No post to edit
		$this->assertTrue( $data['hasPermission'] );

		// Assertions - Post state (new post)
		$this->assertNull( $data['postId'] );
		$this->assertNull( $data['postStatus'] );
		$this->assertTrue( $data['canSaveDraft'] );

		// Assertions - Post type info
		$this->assertEquals( $post_type_key, $data['postType']['key'] );
		$this->assertEquals( 'Places', $data['postType']['label'] );

		// Assertions - Nonces exist
		$this->assertArrayHasKey( 'create_post', $data['nonces'] );
	}

	/**
	 * Test post-context endpoint returns correct structure for editing existing post
	 */
	public function test_get_post_context_editing_existing_post() {
		$post_type_key = 'place';
		$post_id = 123;

		// Mock Voxel Post_Type
		$post_type_mock = Mockery::mock();
		$post_type_mock->shouldReceive( 'get_key' )->andReturn( $post_type_key );
		$post_type_mock->shouldReceive( 'get_label' )->andReturn( 'Places' );
		$post_type_mock->shouldReceive( 'get_singular_name' )->andReturn( 'Place' );
		$post_type_mock->shouldReceive( 'get_fields' )->andReturn( [] );

		$post_type_class = Mockery::mock( 'alias:Voxel\Post_Type' );
		$post_type_class->shouldReceive( 'get' )->with( $post_type_key )->andReturn( $post_type_mock );

		// Mock Voxel Post
		$post_mock = Mockery::mock();
		$post_mock->post_type = $post_type_mock;
		$post_mock->shouldReceive( 'get_id' )->andReturn( $post_id );
		$post_mock->shouldReceive( 'get_title' )->andReturn( 'Test Place' );
		$post_mock->shouldReceive( 'get_status' )->andReturn( 'publish' );
		$post_mock->shouldReceive( 'get_edit_link' )->andReturn( 'http://example.com/create-place/?post_id=123' );
		$post_mock->shouldReceive( 'is_editable_by_current_user' )->andReturn( true );

		$post_class = Mockery::mock( 'alias:Voxel\Post' );
		$post_class->shouldReceive( 'get' )->with( $post_id )->andReturn( $post_mock );
		$post_class->shouldReceive( 'current_user_can_edit' )->with( $post_id )->andReturn( true );

		// Mock Voxel User
		$user_mock = Mockery::mock();
		$user_mock->shouldReceive( 'get_id' )->andReturn( 1 );
		$user_mock->shouldReceive( 'can_create_post' )->with( $post_type_key )->andReturn( true );

		Functions\when( 'Voxel\get_current_user' )->justReturn( $user_mock );
		Functions\when( 'Voxel\get' )->justReturn( null );

		// Create Request
		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_type' )->andReturn( $post_type_key );
		$request->shouldReceive( 'get_param' )->with( 'post_id' )->andReturn( $post_id );

		// Instantiate Controller
		$controller = new FSE_Create_Post_Controller();

		// Execute
		$response = $controller->get_post_context( $request );
		$data = $response->get_data();

		// Assertions - Edit mode
		$this->assertEquals( $post_id, $data['postId'] );
		$this->assertEquals( 'publish', $data['postStatus'] );
		$this->assertEquals( 'Test Place', $data['postTitle'] );
		$this->assertTrue( $data['permissions']['edit'] );

		// Assertions - Draft saving (can't save as draft when published)
		$this->assertFalse( $data['canSaveDraft'] );

		// Assertions - Edit link exists
		$this->assertNotNull( $data['editLink'] );
	}

	/**
	 * Test post-context endpoint returns correct structure for user without permission
	 */
	public function test_get_post_context_without_permission() {
		$post_type_key = 'place';

		// Mock Voxel Post_Type
		$post_type_mock = Mockery::mock();
		$post_type_mock->shouldReceive( 'get_key' )->andReturn( $post_type_key );
		$post_type_mock->shouldReceive( 'get_label' )->andReturn( 'Places' );
		$post_type_mock->shouldReceive( 'get_singular_name' )->andReturn( 'Place' );
		$post_type_mock->shouldReceive( 'get_fields' )->andReturn( [] );

		$post_type_class = Mockery::mock( 'alias:Voxel\Post_Type' );
		$post_type_class->shouldReceive( 'get' )->with( $post_type_key )->andReturn( $post_type_mock );

		// Mock Voxel User WITHOUT create permission
		$user_mock = Mockery::mock();
		$user_mock->shouldReceive( 'get_id' )->andReturn( 1 );
		$user_mock->shouldReceive( 'can_create_post' )->with( $post_type_key )->andReturn( false );

		Functions\when( 'Voxel\get_current_user' )->justReturn( $user_mock );
		Functions\when( 'Voxel\get' )->justReturn( null );

		// Create Request
		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_type' )->andReturn( $post_type_key );
		$request->shouldReceive( 'get_param' )->with( 'post_id' )->andReturn( null );

		// Instantiate Controller
		$controller = new FSE_Create_Post_Controller();

		// Execute
		$response = $controller->get_post_context( $request );
		$data = $response->get_data();

		// Assertions - No permission
		$this->assertFalse( $data['permissions']['create'] );
		$this->assertFalse( $data['hasPermission'] );

		// Assertions - No permission content exists
		$this->assertArrayHasKey( 'noPermission', $data );
		$this->assertArrayHasKey( 'title', $data['noPermission'] );
	}

	/**
	 * Test post-context endpoint for draft post (can save draft)
	 */
	public function test_get_post_context_draft_post_can_save_draft() {
		$post_type_key = 'place';
		$post_id = 456;

		// Mock Voxel Post_Type
		$post_type_mock = Mockery::mock();
		$post_type_mock->shouldReceive( 'get_key' )->andReturn( $post_type_key );
		$post_type_mock->shouldReceive( 'get_label' )->andReturn( 'Places' );
		$post_type_mock->shouldReceive( 'get_singular_name' )->andReturn( 'Place' );
		$post_type_mock->shouldReceive( 'get_fields' )->andReturn( [] );

		$post_type_class = Mockery::mock( 'alias:Voxel\Post_Type' );
		$post_type_class->shouldReceive( 'get' )->with( $post_type_key )->andReturn( $post_type_mock );

		// Mock Voxel Post with DRAFT status
		$post_mock = Mockery::mock();
		$post_mock->post_type = $post_type_mock;
		$post_mock->shouldReceive( 'get_id' )->andReturn( $post_id );
		$post_mock->shouldReceive( 'get_title' )->andReturn( 'Draft Place' );
		$post_mock->shouldReceive( 'get_status' )->andReturn( 'draft' ); // DRAFT!
		$post_mock->shouldReceive( 'get_edit_link' )->andReturn( 'http://example.com/create-place/?post_id=456' );
		$post_mock->shouldReceive( 'is_editable_by_current_user' )->andReturn( true );

		$post_class = Mockery::mock( 'alias:Voxel\Post' );
		$post_class->shouldReceive( 'get' )->with( $post_id )->andReturn( $post_mock );
		$post_class->shouldReceive( 'current_user_can_edit' )->with( $post_id )->andReturn( true );

		// Mock Voxel User
		$user_mock = Mockery::mock();
		$user_mock->shouldReceive( 'get_id' )->andReturn( 1 );
		$user_mock->shouldReceive( 'can_create_post' )->with( $post_type_key )->andReturn( true );

		Functions\when( 'Voxel\get_current_user' )->justReturn( $user_mock );
		Functions\when( 'Voxel\get' )->justReturn( null );

		// Create Request
		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_type' )->andReturn( $post_type_key );
		$request->shouldReceive( 'get_param' )->with( 'post_id' )->andReturn( $post_id );

		// Instantiate Controller
		$controller = new FSE_Create_Post_Controller();

		// Execute
		$response = $controller->get_post_context( $request );
		$data = $response->get_data();

		// Assertions - Draft mode allows saving draft
		$this->assertEquals( 'draft', $data['postStatus'] );
		$this->assertTrue( $data['canSaveDraft'] ); // Can save draft when status is draft
	}

	/**
	 * Test post-context endpoint returns error for invalid post type
	 */
	public function test_get_post_context_invalid_post_type() {
		// Mock Voxel Post_Type returning null (not found)
		$post_type_class = Mockery::mock( 'alias:Voxel\Post_Type' );
		$post_type_class->shouldReceive( 'get' )->with( 'nonexistent' )->andReturn( null );

		// Create Request
		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_type' )->andReturn( 'nonexistent' );
		$request->shouldReceive( 'get_param' )->with( 'post_id' )->andReturn( null );

		// Instantiate Controller
		$controller = new FSE_Create_Post_Controller();

		// Execute
		$response = $controller->get_post_context( $request );

		// Assertions - 404 error
		$this->assertEquals( 404, $response->get_status() );
	}

	/**
	 * Test post-context endpoint with UI step fields
	 */
	public function test_get_post_context_with_steps() {
		$post_type_key = 'place';

		// Mock UI Step fields
		$step1 = Mockery::mock();
		$step1->shouldReceive( 'get_type' )->andReturn( 'ui-step' );
		$step1->shouldReceive( 'get_key' )->andReturn( 'step-1' );
		$step1->shouldReceive( 'get_label' )->andReturn( 'Basic Info' );
		$step1->shouldReceive( 'check_dependencies' )->andReturn( true );
		$step1->shouldReceive( 'passes_visibility_rules' )->andReturn( true );

		$step2 = Mockery::mock();
		$step2->shouldReceive( 'get_type' )->andReturn( 'ui-step' );
		$step2->shouldReceive( 'get_key' )->andReturn( 'step-2' );
		$step2->shouldReceive( 'get_label' )->andReturn( 'Details' );
		$step2->shouldReceive( 'check_dependencies' )->andReturn( true );
		$step2->shouldReceive( 'passes_visibility_rules' )->andReturn( true );

		// Mock Voxel Post_Type with steps
		$post_type_mock = Mockery::mock();
		$post_type_mock->shouldReceive( 'get_key' )->andReturn( $post_type_key );
		$post_type_mock->shouldReceive( 'get_label' )->andReturn( 'Places' );
		$post_type_mock->shouldReceive( 'get_singular_name' )->andReturn( 'Place' );
		$post_type_mock->shouldReceive( 'get_fields' )->andReturn( [ $step1, $step2 ] );

		$post_type_class = Mockery::mock( 'alias:Voxel\Post_Type' );
		$post_type_class->shouldReceive( 'get' )->with( $post_type_key )->andReturn( $post_type_mock );

		// Mock Voxel User
		$user_mock = Mockery::mock();
		$user_mock->shouldReceive( 'get_id' )->andReturn( 1 );
		$user_mock->shouldReceive( 'can_create_post' )->with( $post_type_key )->andReturn( true );

		Functions\when( 'Voxel\get_current_user' )->justReturn( $user_mock );
		Functions\when( 'Voxel\get' )->justReturn( null );

		// Create Request
		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_type' )->andReturn( $post_type_key );
		$request->shouldReceive( 'get_param' )->with( 'post_id' )->andReturn( null );

		// Instantiate Controller
		$controller = new FSE_Create_Post_Controller();

		// Execute
		$response = $controller->get_post_context( $request );
		$data = $response->get_data();

		// Assertions - Steps structure
		$this->assertCount( 2, $data['steps'] );
		$this->assertEquals( 'step-1', $data['steps'][0]['key'] );
		$this->assertEquals( 'Basic Info', $data['steps'][0]['label'] );
		$this->assertEquals( 'step-2', $data['steps'][1]['key'] );
		$this->assertEquals( 'Details', $data['steps'][1]['label'] );
	}

	/**
	 * Test validation error messages are included
	 */
	public function test_get_post_context_includes_validation_errors() {
		$post_type_key = 'place';

		// Mock Voxel Post_Type
		$post_type_mock = Mockery::mock();
		$post_type_mock->shouldReceive( 'get_key' )->andReturn( $post_type_key );
		$post_type_mock->shouldReceive( 'get_label' )->andReturn( 'Places' );
		$post_type_mock->shouldReceive( 'get_singular_name' )->andReturn( 'Place' );
		$post_type_mock->shouldReceive( 'get_fields' )->andReturn( [] );

		$post_type_class = Mockery::mock( 'alias:Voxel\Post_Type' );
		$post_type_class->shouldReceive( 'get' )->with( $post_type_key )->andReturn( $post_type_mock );

		// Mock Voxel User
		$user_mock = Mockery::mock();
		$user_mock->shouldReceive( 'get_id' )->andReturn( 1 );
		$user_mock->shouldReceive( 'can_create_post' )->with( $post_type_key )->andReturn( true );

		Functions\when( 'Voxel\get_current_user' )->justReturn( $user_mock );
		Functions\when( 'Voxel\get' )->justReturn( null );

		// Create Request
		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_type' )->andReturn( $post_type_key );
		$request->shouldReceive( 'get_param' )->with( 'post_id' )->andReturn( null );

		// Instantiate Controller
		$controller = new FSE_Create_Post_Controller();

		// Execute
		$response = $controller->get_post_context( $request );
		$data = $response->get_data();

		// Assertions - Validation error messages present
		$this->assertArrayHasKey( 'validationErrors', $data );
		$this->assertArrayHasKey( 'required', $data['validationErrors'] );
		$this->assertArrayHasKey( 'email:invalid', $data['validationErrors'] );
		$this->assertArrayHasKey( 'url:invalid', $data['validationErrors'] );
	}
}
