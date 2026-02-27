<?php
/**
 * Advanced List Block - Server-Side Render
 *
 * Two responsibilities:
 * 1. Visibility filtering: Evaluates per-item visibility rules server-side
 *    (matches Voxel parent repeater-control.php::_voxel_should_render).
 *    Filtered items are removed from vxconfig so React never sees them.
 * 2. Feed SSR: When inside a feed context, injects list item HTML server-side
 *    so items display inside Post Feed / Term Feed cards without hydration.
 *
 * Mirrors Voxel parent: themes/voxel/templates/widgets/advanced-list.php
 *
 * @package VoxelFSE
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$is_feed_context = class_exists( '\VoxelFSE\Controllers\FSE_NB_SSR_Controller' )
	&& \VoxelFSE\Controllers\FSE_NB_SSR_Controller::is_feed_context();

// Extract vxconfig JSON from the block content.
// The save.tsx output contains: <script type="text/json" class="vxconfig">{...}</script>
if ( ! preg_match( '/<script[^>]*class="vxconfig"[^>]*>(.*?)<\/script>/s', $content, $matches ) ) {
	return $content;
}

$vxconfig = json_decode( $matches[1], true );
if ( ! $vxconfig || empty( $vxconfig['items'] ) || ! is_array( $vxconfig['items'] ) ) {
	return $content;
}

// ─── Per-item visibility filtering ───────────────────────────────────
// Mirrors Voxel repeater-control.php::_voxel_should_render():
//   - No rules → always visible
//   - behavior='hide' + rules pass → HIDE
//   - behavior='show' + rules pass → SHOW
// Uses Visibility_Evaluator which delegates to \Voxel\evaluate_visibility_rules().
// The evaluator internally skips evaluation in admin edit mode (Voxel\is_edit_mode).
require_once dirname( __DIR__, 2 ) . '/shared/visibility-evaluator.php';

$filtered_items = [];
foreach ( $vxconfig['items'] as $item ) {
	$rules    = $item['visibilityRules'] ?? [];
	$behavior = $item['rowVisibility'] ?? 'show';

	if ( empty( $rules ) || ! is_array( $rules ) ) {
		// No rules — always visible
		$filtered_items[] = $item;
		continue;
	}

	if ( \VoxelFSE\Blocks\Shared\Visibility_Evaluator::evaluate( $rules, $behavior ) ) {
		$filtered_items[] = $item;
	}
}

$vxconfig['items'] = $filtered_items;

// Update the vxconfig in the block content so frontend.tsx hydrates with filtered items
$updated_json = wp_json_encode( $vxconfig );
$content = preg_replace(
	'/(<script[^>]*class="vxconfig"[^>]*>).*?(<\/script>)/s',
	'$1' . $updated_json . '$2',
	$content,
	1
);

// ─── Inject post ID for frontend.tsx post context fetching ───────────
// Voxel parent uses \Voxel\get_current_post() server-side; we pass the ID
// as a data attribute so the React frontend can fetch post context via REST.
$current_post_id = null;
if ( function_exists( '\Voxel\get_current_post' ) ) {
	$vx_post = \Voxel\get_current_post();
	if ( $vx_post ) {
		$current_post_id = $vx_post->get_id();
	}
}
// Fallback: use WordPress global post
if ( ! $current_post_id ) {
	$current_post_id = get_the_ID();
}

if ( $current_post_id ) {
	// Add data-post-id attribute to the outer <ul> element
	$content = preg_replace(
		'/(<ul\b[^>]*class="[^"]*voxel-fse-advanced-list-frontend[^"]*")/s',
		'$1 data-post-id="' . intval( $current_post_id ) . '"',
		$content,
		1
	);
}

// If not in feed context, return content with filtered vxconfig (React hydrates client-side)
if ( ! $is_feed_context ) {
	return $content;
}

if ( empty( $vxconfig['items'] ) ) {
	return $content;
}

// ─── Feed SSR: Build list item HTML for each item ────────────────────
$items_html = '';

// Extract styling from vxconfig for inline styles
$item_style_config = $vxconfig['itemStyle'] ?? [];
$icon_config = $vxconfig['iconContainer'] ?? [];

// Build item inline styles
$item_style_parts = [];
if ( ! empty( $item_style_config['justifyContent'] ) ) {
	$item_style_parts[] = 'justify-content: ' . esc_attr( $item_style_config['justifyContent'] );
}
if ( ! empty( $item_style_config['height'] ) ) {
	$unit = $item_style_config['heightUnit'] ?? 'px';
	$item_style_parts[] = 'height: ' . esc_attr( $item_style_config['height'] . $unit );
}
$item_style = $item_style_parts ? implode( '; ', $item_style_parts ) . ';' : '';

// Build icon container inline styles
$icon_style_parts = [];
if ( ! empty( $icon_config['size'] ) ) {
	$unit = $icon_config['sizeUnit'] ?? 'px';
	$size_val = esc_attr( $icon_config['size'] . $unit );
	$icon_style_parts[] = 'width: ' . $size_val;
	$icon_style_parts[] = 'height: ' . $size_val;
}
if ( ! empty( $icon_config['borderRadius'] ) ) {
	$unit = $icon_config['borderRadiusUnit'] ?? 'px';
	$icon_style_parts[] = 'border-radius: ' . esc_attr( $icon_config['borderRadius'] . $unit );
}
$icon_style = $icon_style_parts ? implode( '; ', $icon_style_parts ) . ';' : '';

foreach ( $vxconfig['items'] as $item ) {
	if ( ! is_array( $item ) ) {
		continue;
	}

	$item_id = esc_attr( $item['id'] ?? '' );
	$text = esc_html( $item['text'] ?? '' );
	$action_type = $item['actionType'] ?? 'none';

	// Skip items with no text and no icon
	if ( empty( $text ) && empty( $item['icon'] ) ) {
		continue;
	}

	// Build icon HTML
	$icon_html = '';
	if ( ! empty( $item['icon'] ) && is_array( $item['icon'] ) ) {
		$icon_value = $item['icon']['value'] ?? '';
		$icon_library = $item['icon']['library'] ?? '';

		// Dynamic icon: resolve VoxelScript expression (e.g. @post(amenities.icon)) to actual icon
		if ( $icon_library === 'dynamic' && ! empty( $icon_value ) && function_exists( 'VoxelFSE\Dynamic_Data\mw_render' ) ) {
			$expression = $icon_value;
			// Strip @tags()...@endtags() wrapper
			if ( preg_match( '/@tags\(\)(.*?)@endtags\(\)/s', $expression, $tag_match ) ) {
				$expression = $tag_match[1];
			}
			$resolved = \VoxelFSE\Dynamic_Data\mw_render( $expression );

			// Parse resolved value: "svg:72" → attachment ID, or numeric ID, or direct URL
			if ( preg_match( '/^svg:(\d+)$/', $resolved, $svg_match ) ) {
				$attachment_id = (int) $svg_match[1];
			} else {
				$attachment_id = (int) $resolved;
			}

			if ( $attachment_id > 0 ) {
				$attachment_url = wp_get_attachment_url( $attachment_id );
				if ( $attachment_url ) {
					// Re-assign so the existing SVG rendering path below handles it
					$icon_value   = $attachment_url;
					$icon_library = 'svg';
				}
			} elseif ( filter_var( $resolved, FILTER_VALIDATE_URL ) ) {
				$icon_value   = $resolved;
				$icon_library = 'svg';
			}
			// If resolution failed, icon_html stays empty
		}

		if ( ! empty( $icon_value ) ) {
			if ( $icon_library === 'svg' || ( is_string( $icon_value ) && preg_match( '/\.svg$/i', $icon_value ) ) ) {
				// SVG icon — render inline so CSS variables (--ts-icon-color) work.
				// Convert URL to local file path and read the SVG content.
				$svg_content = '';
				$upload_dir  = wp_get_upload_dir();
				$upload_url  = $upload_dir['baseurl'];
				$upload_path = $upload_dir['basedir'];

				if ( ! empty( $upload_url ) && str_contains( $icon_value, $upload_url ) ) {
					$relative    = str_replace( $upload_url, '', $icon_value );
					$local_path  = $upload_path . $relative;
					if ( file_exists( $local_path ) ) {
						$svg_content = file_get_contents( $local_path );
					}
				}

				if ( $svg_content && str_contains( $svg_content, '<svg' ) ) {
					// Add aria-hidden if not present
					if ( ! str_contains( $svg_content, 'aria-hidden' ) ) {
						$svg_content = str_replace( '<svg', '<svg aria-hidden="true"', $svg_content );
					}
					// Strip hardcoded fill from root <svg> so CSS variables work
					$svg_content = preg_replace( '/<svg([^>]*)\sfill="[^"]*"/', '<svg$1', $svg_content, 1 );
					$icon_html = '<span aria-hidden="true" style="display: contents;">' . $svg_content . '</span>';
				} else {
					// Fallback: use <img> if file can't be read locally
					$icon_html = '<img src="' . esc_url( $icon_value ) . '" alt="" style="display:contents;" />';
				}
			} elseif ( is_string( $icon_value ) ) {
				// Font icon class. When library is 'icon', value is already full class (e.g. "las la-bed").
				// When library is a pack prefix (e.g. "las"), combine with value (e.g. "la-bed").
				$icon_class = ( $icon_library && $icon_library !== 'icon' )
					? $icon_library . ' ' . $icon_value
					: $icon_value;
				$icon_html = '<i class="' . esc_attr( $icon_class ) . '"></i>';
			}
		}
	}

	// Build tooltip attribute
	$tooltip_attr = '';
	if ( ! empty( $item['enableTooltip'] ) && ! empty( $item['tooltipText'] ) ) {
		$tooltip_attr = ' data-tooltip="' . esc_attr( $item['tooltipText'] ) . '"';
	}

	// Build the list item HTML (matches Voxel's advanced-list template structure)
	$items_html .= '<li class="vxfse-repeater-item-' . $item_id . ' flexify ts-action"' . $tooltip_attr . '>';
	$items_html .= '<div class="ts-action-con"' . ( $item_style ? ' style="' . $item_style . '"' : '' ) . '>';

	if ( $icon_html ) {
		$items_html .= '<div class="ts-action-icon"' . ( $icon_style ? ' style="' . $icon_style . '"' : '' ) . '>';
		$items_html .= $icon_html;
		$items_html .= '</div>';
	}

	if ( $text ) {
		$items_html .= $text;
	}

	$items_html .= '</div>';
	$items_html .= '</li>';
}

if ( empty( $items_html ) ) {
	return $content;
}

// Inject list items before the closing </ul> tag.
// The save.tsx output is: <ul ...><style>...</style><script class="vxconfig">...</script></ul>
$content = preg_replace(
	'/(<\/ul>\s*)$/s',
	$items_html . '$1',
	$content,
	1
);

return $content;
