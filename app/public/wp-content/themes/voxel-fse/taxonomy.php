<?php
/**
 * Taxonomy template override for FSE child theme.
 *
 * The parent theme's taxonomy.php calls \Elementor\Plugin directly without
 * checking if Elementor is active, causing a fatal error on FSE sites.
 * This override adds the missing guard and falls back to block template rendering.
 *
 * @package VoxelFSE
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// If Elementor is active, delegate to parent theme's taxonomy.php logic
if ( \Voxel\is_elementor_active() ) {
	$term = \Voxel\Term::get( get_queried_object() );
	$taxonomy = $term ? $term->taxonomy : null;

	if ( ! ( $taxonomy && $taxonomy->is_managed_by_voxel() ) ) {
		get_template_part( 'archive' );
		return require locate_template( '404.php' );
	}

	$template_id = \Voxel\get_single_term_template_id();
	if ( $template_id === null ) {
		return require locate_template( '404.php' );
	}

	if ( post_password_required( $template_id ) ) {
		return require locate_template( '404.php' );
	}

	$document = \Elementor\Plugin::$instance->documents->get( $template_id );
	if ( ! ( $document && $document->is_built_with_elementor() ) ) {
		return require locate_template( '404.php' );
	}

	$frontend = \Elementor\Plugin::$instance->frontend;
	add_action( 'wp_enqueue_scripts', function() use ( $frontend, $template_id ) {
		$frontend->enqueue_styles();
		\Voxel\enqueue_template_css( $template_id );
	} );

	get_header();

	if ( \Voxel\get_page_setting( 'voxel_hide_header', $template_id ) !== 'yes' ) {
		\Voxel\print_header();
	}

	echo $frontend->get_builder_content_for_display( $template_id );

	if ( \Voxel\get_page_setting( 'voxel_hide_footer', $template_id ) !== 'yes' ) {
		\Voxel\print_footer();
	}

	get_footer();
	return;
}

// FSE mode: Let WordPress handle it via block templates
// WordPress will use the block template hierarchy (taxonomy.html, archive.html, index.html)

// NectarBlocks bug workaround: it accesses $post->post_content without a null check
// on wp_enqueue_scripts (priority 99). Hook in at priority 98 to ensure $post is set.
add_action( 'wp_enqueue_scripts', function() {
	global $post, $wp_query;
	if ( $post === null ) {
		if ( ! empty( $wp_query->posts ) ) {
			// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
			$post = $wp_query->posts[0];
		} else {
			// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
			$post = (object) [ 'ID' => 0, 'post_content' => '' ];
		}
	}
}, 98 );

get_header();
\Voxel\print_header();

if ( have_posts() ) {
	while ( have_posts() ) : the_post();
		the_title( '<h2>', '</h2>' );
		the_content();
	endwhile;
} else {
	echo '<p>' . esc_html__( 'No posts found.', 'voxel-fse' ) . '</p>';
}

\Voxel\print_footer();
get_footer();
