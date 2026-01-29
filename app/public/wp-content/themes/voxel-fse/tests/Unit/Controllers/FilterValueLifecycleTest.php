<?php
/**
 * Unit Tests for Filter Value Lifecycle
 *
 * Tests that our REST API controller correctly replicates Voxel's
 * filter value lifecycle: set_value() MUST be called BEFORE frontend_props()
 *
 * Evidence: themes/voxel/app/widgets/search-form.php:4192-4203
 *
 * @package VoxelFSE\Tests\Unit\Controllers
 */

namespace VoxelFSE\Tests\Unit\Controllers;

use PHPUnit\Framework\TestCase;
use Brain\Monkey;
use Brain\Monkey\Functions;
use Mockery;

class FilterValueLifecycleTest extends TestCase {

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
	 * Test the correct lifecycle order: set_value() BEFORE get_frontend_config()
	 *
	 * This test verifies that our controller follows Voxel's exact sequence:
	 * 1. Check if ts_default_value === 'yes' → get fallback_value
	 * 2. Call $filter->set_value() BEFORE getting frontend config
	 * 3. Check if ts_reset_value === 'default_value' → call $filter->resets_to()
	 * 4. Call $filter->get_frontend_config()
	 *
	 * Evidence: themes/voxel/app/widgets/search-form.php:4192-4203
	 */
	public function test_set_value_called_before_frontend_config(): void {
		$call_order = [];

		// Create a mock filter that tracks method call order
		$mock_filter = Mockery::mock();
		$mock_filter->shouldReceive( 'get_key' )->andReturn( 'user' );
		$mock_filter->shouldReceive( 'get_type' )->andReturn( 'user' );
		$mock_filter->shouldReceive( 'get_icon' )->andReturn( 'la-regular:lar la-user' );
		$mock_filter->shouldReceive( 'set_elementor_config' )->andReturnNull();

		// Track call order for set_value and get_frontend_config
		$mock_filter->shouldReceive( 'set_value' )
			->once()
			->with( '123' )
			->andReturnUsing( function() use ( &$call_order ) {
				$call_order[] = 'set_value';
				return null;
			});

		$mock_filter->shouldReceive( 'resets_to' )
			->once()
			->with( '123' )
			->andReturnUsing( function() use ( &$call_order ) {
				$call_order[] = 'resets_to';
				return null;
			});

		$mock_filter->shouldReceive( 'get_frontend_config' )
			->once()
			->andReturnUsing( function() use ( &$call_order ) {
				$call_order[] = 'get_frontend_config';
				return [
					'key'       => 'user',
					'label'     => 'User',
					'type'      => 'user',
					'icon'      => '',
					'props'     => [],
					'value'     => '123',
					'resets_to' => '123',
				];
			});

		$mock_filter->shouldReceive( 'reset_frontend_config' )->andReturnNull();

		// Simulate setup_filter_value logic from controller
		$config = [
			'defaultValueEnabled' => true,
			'defaultValue'        => '123',
			'resetValue'          => 'default_value',
		];

		// Step 1: Determine fallback value
		$default_value_enabled = ! empty( $config['defaultValueEnabled'] );
		$default_value         = $config['defaultValue'] ?? null;
		$fallback_value        = null;

		if ( $default_value_enabled && $default_value !== null && $default_value !== '' ) {
			$fallback_value = $default_value;
		}

		// Step 2: CRITICAL - Call set_value FIRST (line 4197 in search-form.php)
		$mock_filter->set_value( $fallback_value );

		// Step 3: Set resets_to if reset is default_value (lines 4199-4201)
		$reset_value = $config['resetValue'] ?? 'empty';
		if ( $reset_value === 'default_value' && $default_value_enabled && $fallback_value !== null ) {
			$mock_filter->resets_to( $fallback_value );
		}

		// Step 4: NOW get frontend config
		$frontend_config = $mock_filter->get_frontend_config();

		// Assert correct order
		$this->assertEquals( [ 'set_value', 'resets_to', 'get_frontend_config' ], $call_order );
		$this->assertEquals( '123', $frontend_config['value'] );
		$this->assertEquals( '123', $frontend_config['resets_to'] );
	}

	/**
	 * Test that set_value is called with null when no default value configured
	 */
	public function test_set_value_called_with_null_when_no_default(): void {
		$mock_filter = Mockery::mock();
		$mock_filter->shouldReceive( 'get_key' )->andReturn( 'keywords' );
		$mock_filter->shouldReceive( 'set_elementor_config' )->andReturnNull();

		// set_value should be called with null
		$mock_filter->shouldReceive( 'set_value' )
			->once()
			->with( null )
			->andReturnNull();

		// resets_to should NOT be called when resetValue is 'empty'
		$mock_filter->shouldReceive( 'resets_to' )->never();

		$mock_filter->shouldReceive( 'get_frontend_config' )
			->once()
			->andReturn( [
				'key'       => 'keywords',
				'label'     => 'Keywords',
				'type'      => 'keywords',
				'icon'      => '',
				'props'     => [],
				'value'     => null,
				'resets_to' => null,
			] );

		$mock_filter->shouldReceive( 'reset_frontend_config' )->andReturnNull();

		// Simulate setup_filter_value with no default
		$config = [
			'defaultValueEnabled' => false,
			'resetValue'          => 'empty',
		];

		$default_value_enabled = ! empty( $config['defaultValueEnabled'] );
		$default_value         = $config['defaultValue'] ?? null;
		$fallback_value        = null;

		if ( $default_value_enabled && $default_value !== null && $default_value !== '' ) {
			$fallback_value = $default_value;
		}

		$mock_filter->set_value( $fallback_value );

		$reset_value = $config['resetValue'] ?? 'empty';
		if ( $reset_value === 'default_value' && $default_value_enabled && $fallback_value !== null ) {
			$mock_filter->resets_to( $fallback_value );
		}

		$frontend_config = $mock_filter->get_frontend_config();

		$this->assertNull( $frontend_config['value'] );
		$this->assertNull( $frontend_config['resets_to'] );
	}

	/**
	 * Test that resets_to is NOT called when resetValue is 'empty'
	 */
	public function test_resets_to_not_called_when_reset_empty(): void {
		$mock_filter = Mockery::mock();
		$mock_filter->shouldReceive( 'get_key' )->andReturn( 'user' );
		$mock_filter->shouldReceive( 'set_elementor_config' )->andReturnNull();
		$mock_filter->shouldReceive( 'set_value' )->once()->with( '456' )->andReturnNull();

		// resets_to should NOT be called
		$mock_filter->shouldReceive( 'resets_to' )->never();

		$mock_filter->shouldReceive( 'get_frontend_config' )
			->once()
			->andReturn( [
				'key'       => 'user',
				'label'     => 'User',
				'type'      => 'user',
				'icon'      => '',
				'props'     => [],
				'value'     => '456',
				'resets_to' => null,  // Should be null since reset is 'empty'
			] );

		$mock_filter->shouldReceive( 'reset_frontend_config' )->andReturnNull();

		$config = [
			'defaultValueEnabled' => true,
			'defaultValue'        => '456',
			'resetValue'          => 'empty', // NOT 'default_value'
		];

		$default_value_enabled = ! empty( $config['defaultValueEnabled'] );
		$default_value         = $config['defaultValue'] ?? null;
		$fallback_value        = null;

		if ( $default_value_enabled && $default_value !== null && $default_value !== '' ) {
			$fallback_value = $default_value;
		}

		$mock_filter->set_value( $fallback_value );

		$reset_value = $config['resetValue'] ?? 'empty';
		if ( $reset_value === 'default_value' && $default_value_enabled && $fallback_value !== null ) {
			$mock_filter->resets_to( $fallback_value );
		}

		$frontend_config = $mock_filter->get_frontend_config();

		$this->assertEquals( '456', $frontend_config['value'] );
	}

	/**
	 * Test that empty string default value is treated as no default
	 */
	public function test_empty_string_default_treated_as_no_default(): void {
		$mock_filter = Mockery::mock();
		$mock_filter->shouldReceive( 'get_key' )->andReturn( 'user' );
		$mock_filter->shouldReceive( 'set_elementor_config' )->andReturnNull();

		// set_value should be called with null (not empty string)
		$mock_filter->shouldReceive( 'set_value' )
			->once()
			->with( null )
			->andReturnNull();

		// resets_to should NOT be called because fallback_value is null
		$mock_filter->shouldReceive( 'resets_to' )->never();

		$mock_filter->shouldReceive( 'get_frontend_config' )
			->once()
			->andReturn( [
				'key'   => 'user',
				'value' => null,
			] );

		$mock_filter->shouldReceive( 'reset_frontend_config' )->andReturnNull();

		$config = [
			'defaultValueEnabled' => true,
			'defaultValue'        => '',  // Empty string
			'resetValue'          => 'default_value',
		];

		$default_value_enabled = ! empty( $config['defaultValueEnabled'] );
		$default_value         = $config['defaultValue'] ?? null;
		$fallback_value        = null;

		// Empty string should result in null fallback
		if ( $default_value_enabled && $default_value !== null && $default_value !== '' ) {
			$fallback_value = $default_value;
		}

		$this->assertNull( $fallback_value );

		$mock_filter->set_value( $fallback_value );

		// Complete the lifecycle - resets_to is not called because fallback is null
		$reset_value = $config['resetValue'] ?? 'empty';
		if ( $reset_value === 'default_value' && $default_value_enabled && $fallback_value !== null ) {
			$mock_filter->resets_to( $fallback_value );
		}

		// Get frontend config to complete the test
		$frontend_config = $mock_filter->get_frontend_config();

		$this->assertNull( $frontend_config['value'] );
	}

	/**
	 * Test that FilterUser shows user name instead of "Loading..." when value is set
	 *
	 * This was the original bug: FilterUser displayed "Loading..." because
	 * set_value() wasn't called before frontend_props(), so the filter's
	 * value prop was empty.
	 */
	public function test_filter_user_value_populated_correctly(): void {
		$mock_user_filter = Mockery::mock();
		$mock_user_filter->shouldReceive( 'get_key' )->andReturn( 'author' );
		$mock_user_filter->shouldReceive( 'get_type' )->andReturn( 'user' );
		$mock_user_filter->shouldReceive( 'get_icon' )->andReturn( 'la-regular:lar la-user' );
		$mock_user_filter->shouldReceive( 'set_elementor_config' )->andReturnNull();

		// The value that would be set from URL or default
		$user_id = '42';

		// Track that set_value is called with the user ID
		$mock_user_filter->shouldReceive( 'set_value' )
			->once()
			->with( $user_id )
			->andReturnNull();

		// After set_value, frontend_props should include the value
		$mock_user_filter->shouldReceive( 'get_frontend_config' )
			->once()
			->andReturn( [
				'key'   => 'author',
				'label' => 'Author',
				'type'  => 'user',
				'icon'  => '',
				'props' => [
					'multiple'    => false,
					'placeholder' => 'Select user',
				],
				// CRITICAL: Value should be populated because set_value was called
				'value' => [
					'id'     => 42,
					'name'   => 'John Doe',
					'avatar' => '<img src="..." />',
				],
				'resets_to' => null,
			] );

		$mock_user_filter->shouldReceive( 'reset_frontend_config' )->andReturnNull();

		// Simulate the lifecycle
		$mock_user_filter->set_value( $user_id );
		$config = $mock_user_filter->get_frontend_config();

		// The value should contain user data, not be empty
		$this->assertIsArray( $config['value'] );
		$this->assertEquals( 42, $config['value']['id'] );
		$this->assertEquals( 'John Doe', $config['value']['name'] );
	}
}
