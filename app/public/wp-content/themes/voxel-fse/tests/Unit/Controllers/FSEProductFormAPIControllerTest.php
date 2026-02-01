<?php
/**
 * FSE Product Form API Controller Tests
 *
 * Tests for the Product Form API Controller.
 * Verifies proper response structure and Voxel parity.
 *
 * @package VoxelFSE\Tests\Unit\Controllers
 */

namespace VoxelFSE\Tests\Unit\Controllers;

use PHPUnit\Framework\TestCase;
use Brain\Monkey;
use Brain\Monkey\Functions;
use Mockery;
use VoxelFSE\Controllers\FSE_Product_Form_API_Controller;

class FSEProductFormAPIControllerTest extends TestCase {

	public function setUp(): void {
		parent::setUp();
		Monkey\setUp();

		// Mock WordPress functions
		Functions\when( 'register_rest_route' )->justReturn( true );
		Functions\when( 'wp_create_nonce' )->returnArg(); // Return the action name as nonce
		Functions\when( 'home_url' )->justReturn( 'http://example.com' );
		Functions\when( 'get_permalink' )->justReturn( 'http://example.com/checkout' );
		Functions\when( 'is_user_logged_in' )->justReturn( true );
		Functions\when( '_x' )->returnArg( 1 ); // Return first arg (the string)
	}

	public function tearDown(): void {
		Monkey\tearDown();
		Mockery::close();
		parent::tearDown();
	}

	/**
	 * Test post context endpoint returns proper structure
	 */
	public function test_get_post_context_success() {
		// Mock Voxel Post
		$post_id = 123;

		$post_instance = Mockery::mock();
		$post_instance->shouldReceive( 'get_id' )->andReturn( $post_id );
		$post_instance->shouldReceive( 'get_title' )->andReturn( 'Test Product' );
		$post_instance->shouldReceive( 'get_link' )->andReturn( 'http://example.com/product/123' );
		$post_instance->shouldReceive( 'is_editable_by_current_user' )->andReturn( true );
		$post_instance->shouldReceive( 'get_edit_link' )->andReturn( 'http://example.com/edit/123' );
		$post_instance->shouldReceive( 'get_field' )->with( 'product' )->andReturn( null );

		$post_mock = Mockery::mock( 'alias:Voxel\Post' );
		$post_mock->shouldReceive( 'get' )->with( $post_id )->andReturn( $post_instance );

		// Mock Voxel\get for templates
		Functions\when( 'Voxel\get' )->justReturn( 1 );

		// Mock Voxel current_user
		$user_instance = Mockery::mock();
		Functions\when( 'Voxel\current_user' )->justReturn( $user_instance );

		// Instantiate Controller
		$controller = new FSE_Product_Form_API_Controller();

		// Create Request
		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_id' )->andReturn( $post_id );

		// Execute
		$response = $controller->get_post_context( $request );
		$data = $response->get_data();

		// Assertions
		$this->assertTrue( $data['success'] );
		$this->assertEquals( $post_id, $data['postId'] );
		$this->assertEquals( 'Test Product', $data['postTitle'] );
		$this->assertTrue( $data['isLoggedIn'] );

		// Permissions structure
		$this->assertArrayHasKey( 'permissions', $data );
		$this->assertArrayHasKey( 'edit', $data['permissions'] );
		$this->assertArrayHasKey( 'purchase', $data['permissions'] );
		$this->assertTrue( $data['permissions']['edit'] );

		// Nonces structure
		$this->assertArrayHasKey( 'nonces', $data );
		$this->assertArrayHasKey( 'cart', $data['nonces'] );
		$this->assertArrayHasKey( 'checkout', $data['nonces'] );
		$this->assertEquals( 'vx_cart', $data['nonces']['cart'] );
		$this->assertEquals( 'vx_checkout', $data['nonces']['checkout'] );

		// Cart structure
		$this->assertArrayHasKey( 'cart', $data );
		$this->assertArrayHasKey( 'enabled', $data['cart'] );
		$this->assertArrayHasKey( 'checkout_url', $data['cart'] );
		$this->assertArrayHasKey( 'currency', $data['cart'] );
		$this->assertArrayHasKey( 'currency_symbol', $data['cart'] );

		// L10n structure
		$this->assertArrayHasKey( 'l10n', $data );
		$this->assertArrayHasKey( 'added_to_cart', $data['l10n'] );
		$this->assertArrayHasKey( 'view_cart', $data['l10n'] );
		$this->assertArrayHasKey( 'add_to_cart', $data['l10n'] );
	}

	/**
	 * Test post context endpoint returns 404 for missing post
	 */
	public function test_get_post_context_not_found() {
		$post_mock = Mockery::mock( 'alias:Voxel\Post' );
		$post_mock->shouldReceive( 'get' )->andReturn( null );

		$controller = new FSE_Product_Form_API_Controller();

		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_id' )->andReturn( 999 );

		$response = $controller->get_post_context( $request );
		$this->assertEquals( 404, $response->get_status() );
	}

	/**
	 * Test product config endpoint returns 404 for missing post
	 */
	public function test_get_product_config_post_not_found() {
		$post_mock = Mockery::mock( 'alias:Voxel\Post' );
		$post_mock->shouldReceive( 'get' )->andReturn( null );

		$controller = new FSE_Product_Form_API_Controller();

		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_id' )->andReturn( 999 );

		$response = $controller->get_product_config( $request );
		$data = $response->get_data();

		$this->assertEquals( 404, $response->get_status() );
		$this->assertFalse( $data['success'] );
		$this->assertFalse( $data['is_purchasable'] );
	}

	/**
	 * Test product config endpoint returns 404 for post without product field
	 */
	public function test_get_product_config_no_product_field() {
		$post_id = 123;

		$post_instance = Mockery::mock();
		$post_instance->shouldReceive( 'get_field' )->with( 'product' )->andReturn( null );

		$post_mock = Mockery::mock( 'alias:Voxel\Post' );
		$post_mock->shouldReceive( 'get' )->with( $post_id )->andReturn( $post_instance );

		$controller = new FSE_Product_Form_API_Controller();

		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_id' )->andReturn( $post_id );

		$response = $controller->get_product_config( $request );
		$data = $response->get_data();

		$this->assertEquals( 404, $response->get_status() );
		$this->assertFalse( $data['success'] );
		$this->assertFalse( $data['is_purchasable'] );
	}

	/**
	 * Test product config returns purchasable response for valid product
	 */
	public function test_get_product_config_purchasable_product() {
		$post_id = 123;

		// Mock product type
		$product_type = Mockery::mock();
		$product_type->shouldReceive( 'get_product_mode' )->andReturn( 'regular' );
		$product_type->shouldReceive( 'cart_is_enabled' )->andReturn( true );

		// Mock product field
		$product_field = Mockery::mock();
		$product_field->shouldReceive( 'get_type' )->andReturn( 'product' );
		$product_field->shouldReceive( 'get_key' )->andReturn( 'product' );
		$product_field->shouldReceive( 'check_product_form_validity' )->andReturnNull();
		$product_field->shouldReceive( 'get_product_type' )->andReturn( $product_type );
		$product_field->shouldReceive( 'get_product_form_props' )->andReturn( [
			'base_price' => [ 'enabled' => true, 'amount' => 50 ],
		] );

		// Mock schema
		$schema_mock = Mockery::mock();
		$product_prop = Mockery::mock();
		$post_id_prop = Mockery::mock();
		$field_key_prop = Mockery::mock();

		$post_id_prop->shouldReceive( 'set_value' )->with( $post_id )->andReturnNull();
		$field_key_prop->shouldReceive( 'set_value' )->with( 'product' )->andReturnNull();
		$product_prop->shouldReceive( 'get_prop' )->with( 'post_id' )->andReturn( $post_id_prop );
		$product_prop->shouldReceive( 'get_prop' )->with( 'field_key' )->andReturn( $field_key_prop );
		$schema_mock->shouldReceive( 'get_prop' )->with( 'product' )->andReturn( $product_prop );
		$schema_mock->shouldReceive( 'export' )->andReturn( [ 'product' => [] ] );

		$product_field->shouldReceive( 'get_product_form_schema' )->andReturn( $schema_mock );

		// Mock post
		$post_instance = Mockery::mock();
		$post_instance->shouldReceive( 'get_id' )->andReturn( $post_id );
		$post_instance->shouldReceive( 'get_field' )->with( 'product' )->andReturn( $product_field );
		$post_instance->post_type = Mockery::mock();
		$post_instance->post_type->shouldReceive( 'get_filters' )->andReturn( [] );
		$product_field->shouldReceive( 'get_post' )->andReturn( $post_instance );

		$post_mock = Mockery::mock( 'alias:Voxel\Post' );
		$post_mock->shouldReceive( 'get' )->with( $post_id )->andReturn( $post_instance );

		// Mock Voxel\get for templates
		Functions\when( 'Voxel\get' )->justReturn( 1 );

		$controller = new FSE_Product_Form_API_Controller();

		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_id' )->andReturn( $post_id );

		$response = $controller->get_product_config( $request );
		$data = $response->get_data();

		// Assertions
		$this->assertTrue( $data['success'] );
		$this->assertTrue( $data['is_purchasable'] );

		// Settings structure
		$this->assertArrayHasKey( 'settings', $data );
		$this->assertArrayHasKey( 'cart_nonce', $data['settings'] );
		$this->assertArrayHasKey( 'checkout_link', $data['settings'] );
		$this->assertArrayHasKey( 'product_mode', $data['settings'] );
		$this->assertArrayHasKey( 'search_context_config', $data['settings'] );
		$this->assertEquals( 'regular', $data['settings']['product_mode'] );
		$this->assertEquals( 'vx_cart', $data['settings']['cart_nonce'] );

		// Cart structure
		$this->assertArrayHasKey( 'cart', $data );
		$this->assertTrue( $data['cart']['enabled'] );

		// Props structure
		$this->assertArrayHasKey( 'props', $data );
		$this->assertArrayHasKey( 'base_price', $data['props'] );

		// L10n structure
		$this->assertArrayHasKey( 'l10n', $data );
		$this->assertEquals( 'Quantity', $data['l10n']['quantity'] );

		// Nonce
		$this->assertArrayHasKey( 'nonce', $data );
		$this->assertEquals( 'vx_cart', $data['nonce'] );
	}

	/**
	 * Test product config returns out of stock for invalid product
	 */
	public function test_get_product_config_out_of_stock() {
		$post_id = 123;

		// Mock product field that throws exception
		$product_field = Mockery::mock();
		$product_field->shouldReceive( 'get_type' )->andReturn( 'product' );
		$product_field->shouldReceive( 'check_product_form_validity' )
			->andThrow( new \Exception( 'Product is out of stock' ) );

		// Mock post
		$post_instance = Mockery::mock();
		$post_instance->shouldReceive( 'get_field' )->with( 'product' )->andReturn( $product_field );

		$post_mock = Mockery::mock( 'alias:Voxel\Post' );
		$post_mock->shouldReceive( 'get' )->with( $post_id )->andReturn( $post_instance );

		$controller = new FSE_Product_Form_API_Controller();

		$request = Mockery::mock( '\WP_REST_Request' );
		$request->shouldReceive( 'get_param' )->with( 'post_id' )->andReturn( $post_id );

		$response = $controller->get_product_config( $request );
		$data = $response->get_data();

		$this->assertFalse( $data['success'] );
		$this->assertFalse( $data['is_purchasable'] );
		$this->assertEquals( 'Product is out of stock', $data['out_of_stock_message'] );
	}
}
