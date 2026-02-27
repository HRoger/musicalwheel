<?php

namespace Voxel\Controllers\Compat;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Yoast_Seo_Controller extends \Voxel\Controllers\Base_Controller {

	protected function authorize() {
		return defined( 'WPSEO_VERSION' );
	}

	protected function hooks() {
		$this->filter( 'wpseo_title', '@render_dynamic_tags', 100 );
		$this->filter( 'wpseo_metadesc', '@render_dynamic_tags', 100 );
		$this->filter( 'wpseo_opengraph_title', '@render_dynamic_tags', 100 );
		$this->filter( 'wpseo_opengraph_desc', '@render_dynamic_tags', 100 );
		$this->filter( 'wpseo_opengraph_image', '@render_dynamic_tags', 100 );
		$this->filter( 'wpseo_twitter_title', '@render_dynamic_tags', 100 );
		$this->filter( 'wpseo_twitter_description', '@render_dynamic_tags', 100 );
		$this->filter( 'wpseo_twitter_image', '@render_dynamic_tags', 100 );
		$this->filter( 'wpseo_canonical', '@render_dynamic_tags', 100 );
	}

	/**
	 * Render dynamic tags in Yoast SEO output.
	 * Supports format: `vx(@post(:title))` or direct `@post(:title)`
	 *
	 * @since 1.2.8
	 */
	protected function render_dynamic_tags( $content ) {
		if ( ! is_string( $content ) || strpos( $content, '@' ) === false ) {
			return $content;
		}

		$this->_setup_post_context();

		// render vx(...) wrapped tags
		$content = preg_replace_callback( '/vx\((@[^)]+\)(?:\.[^)]+\))*)\)/', function( $matches ) {
			return \Voxel\render( $matches[1] );
		}, $content );

		// render direct @group(...) tags
		$content = \Voxel\render( $content );

		return $content;
	}

	protected function _setup_post_context(): void {
		if ( is_author() && ( $current_author = \Voxel\User::get( get_the_author_meta('ID') ) ) ) {
			\Voxel\set_current_post( $current_author->get_or_create_profile() );
		} elseif ( is_singular() && ( $queried_post = \Voxel\Post::get( get_queried_object_id() ) ) ) {
			\Voxel\set_current_post( $queried_post );
		}
	}
}
