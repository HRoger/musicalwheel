<?php
/**
 * Unit Tests for Visibility_Evaluator
 *
 * Tests the visibility rules evaluation logic including:
 * - Rule formatting (ruleArgs flattening, dtag structure, group mapping)
 * - Legacy fallback evaluation (user, template, post rules)
 * - Show/hide behavior inversion
 * - Edge cases (empty rules, unknown types, missing fields)
 *
 * @package VoxelFSE\Tests\Unit\Blocks
 */

namespace VoxelFSE\Tests\Unit\Blocks;

use PHPUnit\Framework\TestCase;
use Brain\Monkey;
use Brain\Monkey\Functions;
use Mockery;
use VoxelFSE\Blocks\Shared\Visibility_Evaluator;

class VisibilityEvaluatorTest extends TestCase {

	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();

		// Default: disable edit-mode bypasses so rules actually evaluate
		Functions\when( 'get_post' )->justReturn( null );

		// Voxel's native evaluator is NOT available in unit tests (we test the legacy path)
	}

	protected function tearDown(): void {
		Monkey\tearDown();
		Mockery::close();
		parent::tearDown();
	}

	// ========================================================================
	// EMPTY / NO RULES
	// ========================================================================

	public function test_empty_rules_returns_true(): void {
		$this->assertTrue( Visibility_Evaluator::evaluate( [], 'show', true ) );
	}

	public function test_empty_rules_with_hide_behavior_returns_true(): void {
		$this->assertTrue( Visibility_Evaluator::evaluate( [], 'hide', true ) );
	}

	// ========================================================================
	// USER:LOGGED_IN / USER:LOGGED_OUT
	// ========================================================================

	public function test_user_logged_in_rule_passes_when_logged_in(): void {
		Functions\when( 'is_user_logged_in' )->justReturn( true );

		$rules = [ [ 'filterKey' => 'user:logged_in', 'id' => 'r1' ] ];
		$this->assertTrue( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	public function test_user_logged_in_rule_fails_when_logged_out(): void {
		Functions\when( 'is_user_logged_in' )->justReturn( false );

		$rules = [ [ 'filterKey' => 'user:logged_in', 'id' => 'r1' ] ];
		$this->assertFalse( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	public function test_user_logged_out_rule_passes_when_logged_out(): void {
		Functions\when( 'is_user_logged_in' )->justReturn( false );

		$rules = [ [ 'filterKey' => 'user:logged_out', 'id' => 'r1' ] ];
		$this->assertTrue( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	public function test_user_logged_out_rule_fails_when_logged_in(): void {
		Functions\when( 'is_user_logged_in' )->justReturn( true );

		$rules = [ [ 'filterKey' => 'user:logged_out', 'id' => 'r1' ] ];
		$this->assertFalse( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	// ========================================================================
	// HIDE BEHAVIOR (INVERSION)
	// ========================================================================

	public function test_hide_behavior_inverts_passing_rule(): void {
		Functions\when( 'is_user_logged_in' )->justReturn( true );

		$rules = [ [ 'filterKey' => 'user:logged_in', 'id' => 'r1' ] ];
		// Rule passes -> hide behavior means element is hidden
		$this->assertFalse( Visibility_Evaluator::evaluate( $rules, 'hide', true ) );
	}

	public function test_hide_behavior_inverts_failing_rule(): void {
		Functions\when( 'is_user_logged_in' )->justReturn( false );

		$rules = [ [ 'filterKey' => 'user:logged_in', 'id' => 'r1' ] ];
		// Rule fails -> hide behavior means element is visible
		$this->assertTrue( Visibility_Evaluator::evaluate( $rules, 'hide', true ) );
	}

	// ========================================================================
	// USER:ROLE
	// ========================================================================

	public function test_user_role_rule_passes_with_matching_role(): void {
		Functions\when( 'is_user_logged_in' )->justReturn( true );

		$user = Mockery::mock( '\WP_User' );
		$user->roles = [ 'administrator' ];
		Functions\when( 'wp_get_current_user' )->justReturn( $user );

		$rules = [ [
			'filterKey' => 'user:role',
			'id'        => 'r1',
			'value'     => 'administrator',
		] ];
		$this->assertTrue( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	public function test_user_role_rule_fails_with_non_matching_role(): void {
		Functions\when( 'is_user_logged_in' )->justReturn( true );

		$user = Mockery::mock( '\WP_User' );
		$user->roles = [ 'subscriber' ];
		Functions\when( 'wp_get_current_user' )->justReturn( $user );

		$rules = [ [
			'filterKey' => 'user:role',
			'id'        => 'r1',
			'value'     => 'administrator',
		] ];
		$this->assertFalse( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	public function test_user_role_rule_fails_when_logged_out(): void {
		Functions\when( 'is_user_logged_in' )->justReturn( false );

		$rules = [ [
			'filterKey' => 'user:role',
			'id'        => 'r1',
			'value'     => 'administrator',
		] ];
		$this->assertFalse( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	// ========================================================================
	// USER:ROLE WITH ruleArgs (new storage format)
	// ========================================================================

	public function test_user_role_from_ruleArgs_passes(): void {
		Functions\when( 'is_user_logged_in' )->justReturn( true );

		$user = Mockery::mock( '\WP_User' );
		$user->roles = [ 'editor' ];
		Functions\when( 'wp_get_current_user' )->justReturn( $user );

		// New storage format: value is in ruleArgs
		$rules = [ [
			'filterKey' => 'user:role',
			'id'        => 'r1',
			'ruleArgs'  => [ 'value' => 'editor' ],
		] ];
		$this->assertTrue( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	// ========================================================================
	// TEMPLATE:IS_PAGE
	// ========================================================================

	public function test_is_page_rule_passes_with_matching_page(): void {
		Functions\when( 'is_page' )->alias( function( $page_id = null ) {
			if ( $page_id === null ) return true;
			return $page_id == 42;
		} );

		$rules = [ [
			'filterKey' => 'template:is_page',
			'id'        => 'r1',
			'ruleArgs'  => [ 'page_id' => '42' ],
		] ];
		$this->assertTrue( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	public function test_is_page_rule_fails_with_non_matching_page(): void {
		Functions\when( 'is_page' )->alias( function( $page_id = null ) {
			if ( $page_id === null ) return true;
			return $page_id == 99;
		} );

		$rules = [ [
			'filterKey' => 'template:is_page',
			'id'        => 'r1',
			'ruleArgs'  => [ 'page_id' => '42' ],
		] ];
		$this->assertFalse( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	public function test_is_page_rule_fails_when_not_on_page(): void {
		Functions\when( 'is_page' )->justReturn( false );

		$rules = [ [
			'filterKey' => 'template:is_page',
			'id'        => 'r1',
			'ruleArgs'  => [ 'page_id' => '42' ],
		] ];
		$this->assertFalse( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	// ========================================================================
	// TEMPLATE:IS_AUTHOR (with ruleArgs.author_id)
	// ========================================================================

	public function test_is_author_rule_passes_on_author_page(): void {
		Functions\when( 'is_author' )->justReturn( true );

		$rules = [ [
			'filterKey' => 'template:is_author',
			'id'        => 'r1',
			'ruleArgs'  => [ 'author_id' => '5' ],
		] ];
		$this->assertTrue( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	public function test_is_author_rule_fails_on_non_author_page(): void {
		Functions\when( 'is_author' )->justReturn( false );

		$rules = [ [
			'filterKey' => 'template:is_author',
			'id'        => 'r1',
			'ruleArgs'  => [ 'author_id' => '5' ],
		] ];
		$this->assertFalse( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	// ========================================================================
	// TEMPLATE:IS_SINGLE_POST (with ruleArgs.post_type)
	// ========================================================================

	public function test_is_single_post_rule_passes_on_matching_post_type(): void {
		Functions\when( 'is_singular' )->alias( function( $post_type = null ) {
			return $post_type === 'place';
		} );

		$rules = [ [
			'filterKey' => 'template:is_single_post',
			'id'        => 'r1',
			'ruleArgs'  => [ 'post_type' => 'place' ],
		] ];
		$this->assertTrue( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	public function test_is_single_post_rule_fails_on_non_matching_post_type(): void {
		Functions\when( 'is_singular' )->alias( function( $post_type = null ) {
			return $post_type === 'place';
		} );

		$rules = [ [
			'filterKey' => 'template:is_single_post',
			'id'        => 'r1',
			'ruleArgs'  => [ 'post_type' => 'event' ],
		] ];
		$this->assertFalse( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	// ========================================================================
	// TEMPLATE:IS_SINGLE_TERM (with ruleArgs.taxonomy + ruleArgs.term_id)
	// ========================================================================

	public function test_is_single_term_rule_passes_on_matching_taxonomy(): void {
		Functions\when( 'is_tax' )->justReturn( true );
		Functions\when( 'is_category' )->justReturn( false );
		Functions\when( 'is_tag' )->justReturn( false );

		$rules = [ [
			'filterKey' => 'template:is_single_term',
			'id'        => 'r1',
			'ruleArgs'  => [ 'taxonomy' => 'category', 'term_id' => '' ],
		] ];
		$this->assertTrue( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	// ========================================================================
	// TEMPLATE:IS_HOMEPAGE / IS_404
	// ========================================================================

	public function test_is_homepage_rule_passes_on_front_page(): void {
		Functions\when( 'is_front_page' )->justReturn( true );
		Functions\when( 'is_home' )->justReturn( false );

		$rules = [ [ 'filterKey' => 'template:is_homepage', 'id' => 'r1' ] ];
		$this->assertTrue( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	public function test_is_homepage_rule_passes_on_blog_home(): void {
		Functions\when( 'is_front_page' )->justReturn( false );
		Functions\when( 'is_home' )->justReturn( true );

		$rules = [ [ 'filterKey' => 'template:is_homepage', 'id' => 'r1' ] ];
		$this->assertTrue( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	public function test_is_homepage_rule_fails_on_other_page(): void {
		Functions\when( 'is_front_page' )->justReturn( false );
		Functions\when( 'is_home' )->justReturn( false );

		$rules = [ [ 'filterKey' => 'template:is_homepage', 'id' => 'r1' ] ];
		$this->assertFalse( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	public function test_is_404_rule_passes_on_404_page(): void {
		Functions\when( 'is_404' )->justReturn( true );

		$rules = [ [ 'filterKey' => 'template:is_404', 'id' => 'r1' ] ];
		$this->assertTrue( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	public function test_is_404_rule_fails_on_non_404_page(): void {
		Functions\when( 'is_404' )->justReturn( false );

		$rules = [ [ 'filterKey' => 'template:is_404', 'id' => 'r1' ] ];
		$this->assertFalse( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	// ========================================================================
	// TEMPLATE:IS_POST_TYPE_ARCHIVE (with ruleArgs.post_type)
	// ========================================================================

	public function test_is_post_type_archive_passes_on_matching_archive(): void {
		Functions\when( 'is_post_type_archive' )->alias( function( $post_type = null ) {
			return $post_type === 'place';
		} );

		$rules = [ [
			'filterKey' => 'template:is_post_type_archive',
			'id'        => 'r1',
			'ruleArgs'  => [ 'post_type' => 'place' ],
		] ];
		$this->assertTrue( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	public function test_is_post_type_archive_fails_on_non_matching_archive(): void {
		Functions\when( 'is_post_type_archive' )->alias( function( $post_type = null ) {
			return $post_type === 'place';
		} );

		$rules = [ [
			'filterKey' => 'template:is_post_type_archive',
			'id'        => 'r1',
			'ruleArgs'  => [ 'post_type' => 'event' ],
		] ];
		$this->assertFalse( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	// ========================================================================
	// UNKNOWN RULE TYPE
	// ========================================================================

	public function test_unknown_rule_type_passes_by_default(): void {
		$rules = [ [
			'filterKey' => 'nonexistent:rule',
			'id'        => 'r1',
		] ];
		$this->assertTrue( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	// ========================================================================
	// MULTIPLE RULES (AND LOGIC within same group)
	// ========================================================================

	public function test_multiple_rules_all_pass_returns_true(): void {
		Functions\when( 'is_user_logged_in' )->justReturn( true );
		Functions\when( 'is_front_page' )->justReturn( true );
		Functions\when( 'is_home' )->justReturn( false );

		$rules = [
			[ 'filterKey' => 'user:logged_in', 'id' => 'r1', 'groupIndex' => 0 ],
			[ 'filterKey' => 'template:is_homepage', 'id' => 'r2', 'groupIndex' => 0 ],
		];
		$this->assertTrue( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	public function test_multiple_rules_one_fails_returns_false(): void {
		Functions\when( 'is_user_logged_in' )->justReturn( true );
		Functions\when( 'is_front_page' )->justReturn( false );
		Functions\when( 'is_home' )->justReturn( false );

		$rules = [
			[ 'filterKey' => 'user:logged_in', 'id' => 'r1', 'groupIndex' => 0 ],
			[ 'filterKey' => 'template:is_homepage', 'id' => 'r2', 'groupIndex' => 0 ],
		];
		$this->assertFalse( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	// ========================================================================
	// RULE FORMATTING — ruleArgs FLATTENING
	// ========================================================================

	/**
	 * Test that ruleArgs are properly flattened into the formatted rule
	 * so Voxel's evaluator can read them via set_args().
	 *
	 * We can't test Voxel's native evaluator in unit tests, so we verify
	 * the legacy path uses the flattened value correctly.
	 */
	public function test_ruleArgs_value_is_used_by_legacy_evaluator(): void {
		Functions\when( 'is_user_logged_in' )->justReturn( true );

		$user = Mockery::mock( '\WP_User' );
		$user->roles = [ 'contributor' ];
		Functions\when( 'wp_get_current_user' )->justReturn( $user );

		// Role value stored in ruleArgs (new format from REST API + modal)
		$rules = [ [
			'filterKey' => 'user:role',
			'id'        => 'r1',
			'ruleArgs'  => [ 'value' => 'contributor' ],
		] ];
		$this->assertTrue( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	public function test_ruleArgs_page_id_is_used_for_is_page(): void {
		Functions\when( 'is_page' )->alias( function( $page_id = null ) {
			if ( $page_id === null ) return true;
			return $page_id == 128;
		} );

		$rules = [ [
			'filterKey' => 'template:is_page',
			'id'        => 'r1',
			'ruleArgs'  => [ 'page_id' => '128' ],
		] ];
		$this->assertTrue( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	// ========================================================================
	// EDIT MODE BYPASS
	// ========================================================================

	public function test_edit_mode_bypass_for_wp_template(): void {
		$post = (object) [ 'post_type' => 'wp_template' ];
		Functions\when( 'get_post' )->justReturn( $post );

		// Even with a failing rule, should return true in template edit mode
		Functions\when( 'is_user_logged_in' )->justReturn( false );

		$rules = [ [ 'filterKey' => 'user:logged_in', 'id' => 'r1' ] ];
		// skip_edit_check = false (default behavior)
		$this->assertTrue( Visibility_Evaluator::evaluate( $rules, 'show', false ) );
	}

	public function test_edit_mode_bypass_for_wp_template_part(): void {
		$post = (object) [ 'post_type' => 'wp_template_part' ];
		Functions\when( 'get_post' )->justReturn( $post );

		Functions\when( 'is_user_logged_in' )->justReturn( false );

		$rules = [ [ 'filterKey' => 'user:logged_in', 'id' => 'r1' ] ];
		$this->assertTrue( Visibility_Evaluator::evaluate( $rules, 'show', false ) );
	}

	public function test_skip_edit_check_evaluates_rules_normally(): void {
		$post = (object) [ 'post_type' => 'wp_template' ];
		Functions\when( 'get_post' )->justReturn( $post );

		Functions\when( 'is_user_logged_in' )->justReturn( false );

		$rules = [ [ 'filterKey' => 'user:logged_in', 'id' => 'r1' ] ];
		// skip_edit_check = true forces evaluation
		$this->assertFalse( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	// ========================================================================
	// DTAG RULE FORMAT
	// ========================================================================

	public function test_dtag_rule_without_renderer_returns_true(): void {
		// When neither Voxel\render nor VoxelFSE\Dynamic_Data\render exists,
		// dtag rules pass by default (graceful fallback)
		$rules = [ [
			'filterKey' => 'dtag',
			'id'        => 'r1',
			'tag'       => '@post(:status.key)',
			'compare'   => 'is_equal_to',
			'arguments' => [ 'publish' ],
		] ];
		$this->assertTrue( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	public function test_dtag_rule_with_empty_tag_returns_false(): void {
		$rules = [ [
			'filterKey' => 'dtag',
			'id'        => 'r1',
			'tag'       => '',
			'compare'   => 'is_equal_to',
			'arguments' => [ 'publish' ],
		] ];
		$this->assertFalse( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	// ========================================================================
	// USER:IS_AUTHOR (post author check)
	// ========================================================================

	public function test_user_is_author_passes_when_user_is_post_author(): void {
		Functions\when( 'is_user_logged_in' )->justReturn( true );
		Functions\when( 'is_singular' )->justReturn( true );
		Functions\when( 'get_current_user_id' )->justReturn( 7 );

		$post = (object) [ 'post_author' => 7 ];
		Functions\when( 'get_post' )->justReturn( $post );

		$rules = [ [ 'filterKey' => 'user:is_author', 'id' => 'r1' ] ];
		$this->assertTrue( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	public function test_user_is_author_fails_when_user_is_not_post_author(): void {
		Functions\when( 'is_user_logged_in' )->justReturn( true );
		Functions\when( 'is_singular' )->justReturn( true );
		Functions\when( 'get_current_user_id' )->justReturn( 7 );

		$post = (object) [ 'post_author' => 99 ];
		Functions\when( 'get_post' )->justReturn( $post );

		$rules = [ [ 'filterKey' => 'user:is_author', 'id' => 'r1' ] ];
		$this->assertFalse( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	public function test_user_is_author_fails_when_not_logged_in(): void {
		Functions\when( 'is_user_logged_in' )->justReturn( false );

		$rules = [ [ 'filterKey' => 'user:is_author', 'id' => 'r1' ] ];
		$this->assertFalse( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}

	// ========================================================================
	// LEGACY VALUE FIELD (backward compatibility)
	// ========================================================================

	public function test_legacy_value_field_still_works_for_role(): void {
		Functions\when( 'is_user_logged_in' )->justReturn( true );

		$user = Mockery::mock( '\WP_User' );
		$user->roles = [ 'subscriber' ];
		Functions\when( 'wp_get_current_user' )->justReturn( $user );

		// Old format: value directly on rule (no ruleArgs)
		$rules = [ [
			'filterKey' => 'user:role',
			'id'        => 'r1',
			'value'     => 'subscriber',
		] ];
		$this->assertTrue( Visibility_Evaluator::evaluate( $rules, 'show', true ) );
	}
}
