<?php
/**
 * NectarBlocks Server-Side Rendering Controller
 *
 * Provides server-side HTML generation for NB blocks that have no render callback
 * (star-rating, icon). These blocks save `null` HTML and rely on editor JS for rendering,
 * but when used inside card templates rendered via do_blocks() (Post Feed, Term Feed),
 * they produce empty containers. This controller fills in the missing HTML.
 *
 * SCOPE: Only active during feed context (do_blocks() calls from feed controllers).
 * Normal page rendering is unaffected — NB's editor JS handles those.
 *
 * @package VoxelFSE
 */

namespace VoxelFSE\Controllers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FSE_NB_SSR_Controller extends FSE_Base_Controller {

	/**
	 * Flag: whether we're currently inside a feed do_blocks() call.
	 * Only when true does the render_block filter inject HTML.
	 *
	 * @var bool
	 */
	private static bool $is_feed_context = false;

	/**
	 * Whether the star-rating base CSS has already been output on this page.
	 *
	 * @var bool
	 */
	private static bool $star_css_output = false;

	/**
	 * Set the feed context flag.
	 * Call with true before do_blocks(), false after.
	 */
	public static function set_feed_context( bool $active ): void {
		self::$is_feed_context = $active;
	}

	/**
	 * Check whether we're inside a feed do_blocks() call.
	 * Used by block render.php files to decide whether to
	 * inject server-side rendered content.
	 */
	public static function is_feed_context(): bool {
		return self::$is_feed_context;
	}

	protected function hooks(): void {
		add_filter( 'render_block', [ $this, 'render_nb_blocks_ssr' ], 15, 2 );
	}

	/**
	 * Inject server-side HTML for NB star-rating and icon blocks
	 * when rendering inside feed card templates.
	 *
	 * @param string $block_content The block content from do_blocks().
	 * @param array  $block The full block, including name and attributes.
	 * @return string Modified block content with SVG/icon HTML injected.
	 */
	public function render_nb_blocks_ssr( string $block_content, array $block ): string {
		if ( ! self::$is_feed_context ) {
			return $block_content;
		}

		$block_name = $block['blockName'] ?? '';

		if ( $block_name === 'nectar-blocks/star-rating' ) {
			return $this->render_star_rating( $block_content, $block['attrs'] ?? [] );
		}

		if ( $block_name === 'nectar-blocks/icon' ) {
			return $this->render_icon( $block_content, $block['attrs'] ?? [] );
		}

		return $block_content;
	}

	/**
	 * Generate SVG star rating HTML.
	 *
	 * NB star-rating uses 5 stars with SVG paths. The rating value determines
	 * how many stars are filled vs empty. Supports partial fills.
	 *
	 * CSS classes: .nectar-blocks-star-rating, .nectar-blocks-star-rating__inner
	 * CSS vars: --star-rating-size (multiplier for 18px base), --star-rating-gap
	 *
	 * @param string $block_content Existing block HTML (wrapper div with empty inner).
	 * @param array  $attrs Block attributes.
	 * @return string Block HTML with SVG stars injected.
	 */
	private function render_star_rating( string $block_content, array $attrs ): string {
		$rating = isset( $attrs['rating'] ) ? floatval( $attrs['rating'] ) : 5;
		$rating = max( 0, min( 5, $rating ) );

		// SVG star path (matching NB's actual editor output exactly)
		$star_path = 'm12 18.26-7.053 3.948 1.575-7.928L.588 8.792l8.027-.952L12 .5l3.385 7.34 8.027.952-5.934 5.488 1.575 7.928z';
		$filled_star = '<svg role="none" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="' . $star_path . '"/></svg>';
		$empty_star  = '<svg role="none" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="' . $star_path . '"/></svg>';

		$stars_html = '';
		for ( $i = 1; $i <= 5; $i++ ) {
			if ( $rating >= $i ) {
				$stars_html .= $filled_star;
			} elseif ( $rating >= $i - 0.5 ) {
				// Half star: use a clip-path approach
				$stars_html .= '<svg role="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">'
					. '<defs><clipPath id="half-' . $i . '"><rect x="0" y="0" width="12" height="24"/></clipPath></defs>'
					. '<path d="' . $star_path . '" fill="currentColor" clip-path="url(#half-' . $i . ')"/>'
					. '<path d="' . $star_path . '" fill="none" stroke="currentColor" stroke-width="2"/>'
					. '</svg>';
			} else {
				$stars_html .= $empty_star;
			}
		}

		// Inject stars into the __inner container
		// Pattern: find .nectar-blocks-star-rating__inner and inject stars inside
		if ( strpos( $block_content, 'nectar-blocks-star-rating__inner' ) !== false ) {
			$block_content = preg_replace(
				'/(<div[^>]*class="[^"]*nectar-blocks-star-rating__inner[^"]*"[^>]*>)\s*(<\/div>)/s',
				'$1' . $stars_html . '$2',
				$block_content
			);
		} else {
			// Fallback: inject before closing wrapper div
			$block_content = preg_replace(
				'/(<\/div>\s*)$/s',
				'<div class="nectar-blocks-star-rating__inner">' . $stars_html . '</div>$1',
				$block_content,
				1
			);
		}

		// NB's star-rating CSS isn't enqueued on the frontend (star-rating is not
		// in NB's FRONTEND_BLOCKS array). Emit it inline once per page.
		if ( ! self::$star_css_output ) {
			self::$star_css_output = true;
			$star_css = '.nectar-blocks-star-rating{display:flex}'
				. '.nectar-blocks-star-rating svg{width:calc(var(--star-rating-size,1)*18px);height:calc(var(--star-rating-size,1)*18px)}'
				. '.nectar-blocks-star-rating__inner{display:inline-flex;gap:var(--star-rating-gap,.25em);position:relative}';
			$block_content = '<style>' . $star_css . '</style>' . $block_content;
		}

		return $block_content;
	}

	/**
	 * Generate icon block HTML.
	 *
	 * NB icon block can render either:
	 * 1. A native SVG icon (from Lucide or other icon sets)
	 * 2. An image icon (via URL)
	 *
	 * CSS classes: .nectar-blocks-icon, .nectar-blocks-icon__inner
	 *
	 * @param string $block_content Existing block HTML.
	 * @param array  $attrs Block attributes.
	 * @return string Block HTML with icon content injected.
	 */
	private function render_icon( string $block_content, array $attrs ): string {
		$icon_html = '';

		// Check for Voxel dynamic icon image (injected by fse-nb-dynamic-tags-controller)
		$icon_image = $attrs['voxelDynamicIconImage'] ?? $attrs['iconImage'] ?? '';

		if ( ! empty( $icon_image ) ) {
			// Image-based icon
			$icon_html = '<img src="' . esc_url( $icon_image ) . '" alt="" class="nectar-component__icon" />';
		} else {
			// SVG/font icon - try to get the icon class or SVG
			$icon = $attrs['icon'] ?? $attrs['selectedIcon'] ?? '';

			if ( ! empty( $icon ) && is_string( $icon ) ) {
				// Font icon class (e.g., "fas fa-star")
				$icon_html = '<i class="' . esc_attr( $icon ) . '"></i>';
			} else {
				// Default: render a placeholder circle
				$icon_html = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="nectar-component__icon"><circle cx="12" cy="12" r="10"/></svg>';
			}
		}

		// Inject icon into the __inner container
		if ( strpos( $block_content, 'nectar-blocks-icon__inner' ) !== false ) {
			$block_content = preg_replace(
				'/(<div[^>]*class="[^"]*nectar-blocks-icon__inner[^"]*"[^>]*>)\s*(<\/div>)/s',
				'$1' . $icon_html . '$2',
				$block_content
			);
		} else {
			// Fallback: inject before closing wrapper div
			$block_content = preg_replace(
				'/(<\/div>\s*)$/s',
				'<div class="nectar-blocks-icon__inner">' . $icon_html . '</div>$1',
				$block_content,
				1
			);
		}

		return $block_content;
	}
}
