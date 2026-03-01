<?php
/**
 * Advanced List Block - Server-Side Render
 *
 * Two responsibilities:
 * 1. Visibility filtering: Evaluates per-item visibility rules server-side
 *    (matches Voxel parent repeater-control.php::_voxel_should_render).
 *    Filtered items are removed from vxconfig so React never sees them.
 * 2. SSR: Always injects list item HTML server-side to eliminate FOUC.
 *    When data-ssr="true" is present, frontend.tsx skips clearing innerHTML.
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

// ─── Pre-resolve dynamic icon values in vxconfig ─────────────────────
// Icons with library: "dynamic" may have values like "svg:103" (pre-resolved
// attachment ID) or "@tags()@post(field.icon)@endtags()" (raw VoxelScript).
// Resolve these to actual URLs so React gets { library: "svg", value: "https://..." }
// and can render them without needing REST API calls on the frontend.
foreach ( $vxconfig['items'] as &$cfg_item ) {
	if ( ! is_array( $cfg_item ) ) {
		continue;
	}
	// Check all icon fields: icon, activeIcon, cartOptsIcon
	foreach ( [ 'icon', 'activeIcon', 'cartOptsIcon' ] as $icon_field ) {
		if ( empty( $cfg_item[ $icon_field ] ) || ! is_array( $cfg_item[ $icon_field ] ) ) {
			continue;
		}
		if ( ( $cfg_item[ $icon_field ]['library'] ?? '' ) !== 'dynamic' ) {
			continue;
		}
		$dyn_value = $cfg_item[ $icon_field ]['value'] ?? '';
		if ( empty( $dyn_value ) ) {
			continue;
		}

		$resolved_val = $dyn_value;

		// If it contains @tags(), resolve via mw_render
		// Note: mw_render() is in the global namespace (defined in dynamic-data/loader.php)
		if ( str_contains( $dyn_value, '@tags()' ) && function_exists( 'mw_render' ) ) {
			$expr = $dyn_value;
			if ( preg_match( '/@tags\(\)(.*?)@endtags\(\)/s', $expr, $m ) ) {
				$expr = $m[1];
			}
			$resolved_val = \mw_render( $expr );
		}
		// Parse resolved icon value using Voxel's icon string format: "library:value"
		// Examples: "svg:103", "la-solid:las la-trash-alt", "la-regular:lar la-bell"
		if ( str_contains( $resolved_val, ':' ) ) {
			$parsed_library = substr( $resolved_val, 0, strpos( $resolved_val, ':' ) );
			$parsed_value   = substr( $resolved_val, strpos( $resolved_val, ':' ) + 1 );

			if ( $parsed_library === 'svg' && is_numeric( $parsed_value ) ) {
				// SVG attachment: "svg:103" → get URL from attachment ID
				$att_id  = (int) $parsed_value;
				$att_url = wp_get_attachment_url( $att_id );
				if ( $att_url ) {
					$cfg_item[ $icon_field ] = [ 'library' => 'svg', 'value' => $att_url ];
				}
			} elseif ( in_array( $parsed_library, [ 'la-solid', 'la-regular', 'la-brands', 'fa-solid', 'fa-regular', 'fa-brands', 'fa-light', 'fa-thin', 'fa-duotone' ], true ) ) {
				// Font icon: "la-solid:las la-trash-alt" → { library: "icon", value: "las la-trash-alt" }
				// React's renderIcon() uses library="icon" to render <i className={value}>
				$cfg_item[ $icon_field ] = [ 'library' => 'icon', 'value' => $parsed_value ];
			}
		} elseif ( is_numeric( $resolved_val ) ) {
			// Plain numeric = attachment ID
			$att_id  = (int) $resolved_val;
			$att_url = wp_get_attachment_url( $att_id );
			if ( $att_url ) {
				$cfg_item[ $icon_field ] = [ 'library' => 'svg', 'value' => $att_url ];
			}
		} elseif ( filter_var( $resolved_val, FILTER_VALIDATE_URL ) ) {
			$cfg_item[ $icon_field ] = [ 'library' => 'svg', 'value' => $resolved_val ];
		}
	}
}
unset( $cfg_item );

// ─── Pre-resolve @tags() in text fields into vxconfig ────────────────
// Resolves server-side so React hydrates with final text values.
// Also used below when building SSR HTML to avoid the @tags() FOUC.
foreach ( $vxconfig['items'] as &$pre_text_item ) {
	foreach ( [ 'text', 'tooltipText', 'activeText', 'activeTooltipText', 'cartOptsText', 'cartOptsTooltipText' ] as $tf ) {
		if ( ! empty( $pre_text_item[ $tf ] ) && is_string( $pre_text_item[ $tf ] )
			&& str_contains( $pre_text_item[ $tf ], '@tags()' )
			&& function_exists( 'mw_render' )
		) {
			$pre_expr = $pre_text_item[ $tf ];
			if ( preg_match( '/@tags\(\)(.*?)@endtags\(\)/s', $pre_expr, $pre_m ) ) {
				$pre_expr = $pre_m[1];
			}
			$pre_text_item[ $tf ] = \mw_render( $pre_expr );
		}
	}
}
unset( $pre_text_item );

// Update the vxconfig in the block content so frontend.tsx hydrates with filtered+resolved items
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

// Add data-post-id and data-ssr to the outer <ul> element.
// data-ssr="true" tells frontend.tsx to skip clearing innerHTML (no FOUC).
$ul_extra = 'data-ssr="true"';
if ( $current_post_id ) {
	$ul_extra .= ' data-post-id="' . intval( $current_post_id ) . '"';
}
$content = preg_replace(
	'/(<ul\b[^>]*class="[^"]*voxel-fse-advanced-list-frontend[^"]*")/s',
	'$1 ' . $ul_extra,
	$content,
	1
);

// ─── Inject list layout inline styles into the outer <ul> ──────────────
// Mirrors buildListStyles() in AdvancedListComponent.tsx so SSR items
// have proper gap/grid/justify-content from the initial paint, preventing
// a layout flash when React mounts its inner <ul> with these styles.
$list_config = $vxconfig['list'] ?? [];
$list_style_parts = [];

$enable_grid = ! empty( $list_config['enableCssGrid'] );
if ( $enable_grid ) {
	$list_style_parts[] = 'display:grid';
	$grid_cols = intval( $list_config['gridColumns'] ?? 3 );
	if ( $grid_cols > 0 ) {
		$list_style_parts[] = 'grid-template-columns:repeat(' . $grid_cols . ',minmax(auto,1fr))';
	}
} else {
	$justify = $list_config['listJustify'] ?? 'left';
	if ( $justify ) {
		$list_style_parts[] = 'justify-content:' . esc_attr( $justify );
	}
}

$item_gap = $list_config['itemGap'] ?? null;
if ( $item_gap !== null && $item_gap !== '' ) {
	$gap_unit = $list_config['itemGapUnit'] ?? 'px';
	$list_style_parts[] = 'gap:' . esc_attr( $item_gap . $gap_unit );
}

if ( ! empty( $list_style_parts ) ) {
	$list_css = implode( ';', $list_style_parts );
	// Append to existing style attribute, or add a new one
	if ( preg_match( '/(<ul\b[^>]*class="[^"]*voxel-fse-advanced-list-frontend[^"]*"[^>]*)\bstyle="([^"]*)"/s', $content ) ) {
		// Has existing style — append
		$content = preg_replace(
			'/(<ul\b[^>]*class="[^"]*voxel-fse-advanced-list-frontend[^"]*"[^>]*)\bstyle="([^"]*)"/s',
			'$1style="$2;' . $list_css . '"',
			$content,
			1
		);
	} else {
		// No style attribute — add one
		$content = preg_replace(
			'/(<ul\b[^>]*class="[^"]*voxel-fse-advanced-list-frontend[^"]*")/s',
			'$1 style="' . $list_css . '"',
			$content,
			1
		);
	}
}

if ( empty( $vxconfig['items'] ) ) {
	return $content;
}

// ─── SSR: Build list item HTML for each item ──────────────────────────
// Always rendered server-side (both feed context and single-post pages)
// to eliminate FOUC. frontend.tsx skips clearing innerHTML when data-ssr="true".
// Mirrors Voxel parent: templates/widgets/advanced-list.php (pure PHP rendering).
$items_html = '';

// Get current Voxel post for permission-based action filtering.
// Mirrors Voxel parent action templates (publish-post-action.php, etc.)
// which call \Voxel\get_current_post() and early-return based on status/permissions.
$feed_vx_post = function_exists( '\\Voxel\\get_current_post' ) ? \Voxel\get_current_post() : null;
$feed_post_status = $feed_vx_post ? $feed_vx_post->get_status() : null;
$feed_is_editable = $feed_vx_post ? $feed_vx_post->is_editable_by_current_user() : false;

// Extract icon container config for inline styles
$icon_config = $vxconfig['iconContainer'] ?? [];

// Note: Item styles (height, justify-content, etc.) are handled by the block's
// scoped <style> tag, not inline styles. The CSS style generator in
// AdvancedListComponent.tsx outputs these per blockId. No inline styles needed here.

// Extract icon size config for --ts-icon-size CSS variable
$icon_size_config = $vxconfig['icon'] ?? [];

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
// --ts-icon-size: matches AdvancedListComponent.tsx buildIconStyles()
if ( ! empty( $icon_size_config['size'] ) ) {
	$unit = $icon_size_config['sizeUnit'] ?? 'px';
	$icon_style_parts[] = '--ts-icon-size: ' . esc_attr( $icon_size_config['size'] . $unit );
}
$icon_style = $icon_style_parts ? implode( '; ', $icon_style_parts ) . ';' : '';

foreach ( $vxconfig['items'] as $item ) {
	if ( ! is_array( $item ) ) {
		continue;
	}

	$item_id = esc_attr( $item['id'] ?? '' );
	$text = esc_html( $item['text'] ?? '' );
	$action_type = $item['actionType'] ?? 'none';

	// ─── Permission-based action filtering (mirrors Voxel action templates) ───
	// Each Voxel action template (e.g. publish-post-action.php) has early returns
	// based on post status and editability. Replicate those checks here.
	if ( $feed_vx_post ) {
		// publish-post-action.php: requires editable + status === 'unpublished'
		if ( $action_type === 'publish_post' ) {
			if ( ! $feed_is_editable || $feed_post_status !== 'unpublished' ) {
				continue;
			}
		}
		// unpublish-post-action.php: requires editable + status === 'publish'
		if ( $action_type === 'unpublish_post' ) {
			if ( ! $feed_is_editable || $feed_post_status !== 'publish' ) {
				continue;
			}
		}
		// delete-post-action.php: requires is_deletable_by_current_user()
		if ( $action_type === 'delete_post' ) {
			if ( ! method_exists( $feed_vx_post, 'is_deletable_by_current_user' ) || ! $feed_vx_post->is_deletable_by_current_user() ) {
				continue;
			}
		}
		// edit-post-action.php: requires is_editable_by_current_user()
		if ( $action_type === 'edit_post' ) {
			if ( ! $feed_is_editable ) {
				continue;
			}
		}
		// view-post-stats-action.php:3-8: requires editable + post type has tracking enabled
		// Evidence: themes/voxel/templates/widgets/advanced-list/view-post-stats-action.php
		if ( $action_type === 'view_post_stats' ) {
			if ( ! $feed_is_editable ) {
				continue;
			}
			$feed_post_type = $feed_vx_post->post_type ?? null;
			if ( ! $feed_post_type || ! method_exists( $feed_post_type, 'is_tracking_enabled' ) || ! $feed_post_type->is_tracking_enabled() ) {
				continue;
			}
		}
	}

	// Skip items with no text and no icon
	if ( empty( $text ) && empty( $item['icon'] ) ) {
		continue;
	}

	// Build icon HTML
	$icon_html = '';
	if ( ! empty( $item['icon'] ) && is_array( $item['icon'] ) ) {
		$icon_value = $item['icon']['value'] ?? '';
		$icon_library = $item['icon']['library'] ?? '';

		// Dynamic icon: resolve to actual icon URL.
		// The value may be:
		// a) A @tags()...@endtags() wrapped VoxelScript expression → needs mw_render()
		// b) Already resolved to "svg:NNN" or numeric ID → just look up the attachment
		// c) Already a direct URL → use as-is
		if ( $icon_library === 'dynamic' && ! empty( $icon_value ) ) {
			$resolved = $icon_value;

			// If it contains @tags(), it's a raw VoxelScript expression that needs resolution
			// Note: mw_render() is in the global namespace (defined in dynamic-data/loader.php)
			if ( str_contains( $icon_value, '@tags()' ) && function_exists( 'mw_render' ) ) {
				$expression = $icon_value;
				if ( preg_match( '/@tags\(\)(.*?)@endtags\(\)/s', $expression, $tag_match ) ) {
					$expression = $tag_match[1];
				}
				$resolved = \mw_render( $expression );
			}

			// Parse resolved value using Voxel's "library:value" icon format
			if ( str_contains( $resolved, ':' ) ) {
				$parsed_lib = substr( $resolved, 0, strpos( $resolved, ':' ) );
				$parsed_val = substr( $resolved, strpos( $resolved, ':' ) + 1 );

				if ( $parsed_lib === 'svg' && is_numeric( $parsed_val ) ) {
					$attachment_url = wp_get_attachment_url( (int) $parsed_val );
					if ( $attachment_url ) {
						$icon_value   = $attachment_url;
						$icon_library = 'svg';
					}
				} elseif ( in_array( $parsed_lib, [ 'la-solid', 'la-regular', 'la-brands', 'fa-solid', 'fa-regular', 'fa-brands', 'fa-light', 'fa-thin', 'fa-duotone' ], true ) ) {
					// Font icon: "la-solid:las la-trash-alt" → render as <i> tag
					// Use library='icon' so the font icon rendering path handles it
					$icon_value   = $parsed_val;
					$icon_library = 'icon';
				}
			} elseif ( is_numeric( $resolved ) ) {
				$attachment_url = wp_get_attachment_url( (int) $resolved );
				if ( $attachment_url ) {
					$icon_value   = $attachment_url;
					$icon_library = 'svg';
				}
			} elseif ( filter_var( $resolved, FILTER_VALIDATE_URL ) ) {
				$icon_value   = $resolved;
				$icon_library = 'svg';
			}
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

	// ─── Build action tag and href (mirrors Voxel action templates) ──────
	// Each Voxel action template uses <a> with a specific href. Only 'none'
	// actions use <div>. Match the exact tag/href/attrs from Voxel originals.
	$action_tag    = 'a';
	$action_href   = '#';
	$action_class  = 'ts-action-con';
	$action_rel    = ' rel="nofollow"';
	$action_extras = '';

	if ( $feed_vx_post ) {
		$post_id   = $feed_vx_post->get_id();
		$post_link = $feed_vx_post->get_link();

		switch ( $action_type ) {
			case 'action_link':
				$action_href = esc_url( $item['link']['url'] ?? '#' );
				$action_rel  = ! empty( $item['link']['nofollow'] ) ? ' rel="nofollow"' : '';
				if ( ! empty( $item['link']['isExternal'] ) ) {
					$action_extras .= ' target="_blank"';
				}
				break;

			// unpublish-post-action.php:12-13
			case 'unpublish_post':
				$action_href = esc_url( wp_nonce_url(
					home_url( '/?vx=1&action=user.posts.unpublish_post&post_id=' . $post_id ),
					'vx_modify_post'
				) );
				$action_extras .= ' vx-action';
				break;

			// publish-post-action.php:12-13
			case 'publish_post':
				$action_href = esc_url( wp_nonce_url(
					home_url( '/?vx=1&action=user.posts.republish_post&post_id=' . $post_id ),
					'vx_modify_post'
				) );
				$action_extras .= ' vx-action';
				break;

			// delete-post-action.php:8-10
			case 'delete_post':
				$action_href = esc_url( wp_nonce_url(
					home_url( '/?vx=1&action=user.posts.delete_post&post_id=' . $post_id ),
					'vx_delete_post'
				) );
				$action_extras .= ' vx-action';
				$confirm_msg = esc_attr__( 'Are you sure?', 'voxel-fse' );
				$action_extras .= ' data-confirm="' . $confirm_msg . '"';
				break;

			// edit-post-action.php — multi-step dropdown or simple link
			case 'edit_post':
				$edit_link = method_exists( $feed_vx_post, 'get_edit_link' ) ? $feed_vx_post->get_edit_link() : '#';
				$edit_steps = array_filter( $feed_vx_post->get_fields(), function( $field ) {
					return $field->get_type() === 'ui-step' && $field->passes_visibility_rules();
				} );

				if ( count( $edit_steps ) > 1 ) {
					// Multi-step: render trigger button with data-edit-steps JSON.
					// The popup (vx-popup) is created by edit-steps-popup.ts on click,
					// matching the shared FormPopup / Voxel popup HTML structure.
					$steps_json = [];
					foreach ( $edit_steps as $field ) {
						$steps_json[] = [
							'key'   => $field->get_key(),
							'label' => $field->get_label(),
							'link'  => add_query_arg( 'step', $field->get_key(), $edit_link ),
						];
					}

					$dropdown_html  = '<li class="vxfse-repeater-item-' . $item_id . ' flexify ts-action"' . $tooltip_attr . '>';
					$dropdown_html .= '<div class="ts-action-wrap ts-popup-component">';
					$dropdown_html .= '<a href="#" class="ts-action-con ts-edit-post-trigger" role="button"';
					$dropdown_html .= ' data-edit-steps="' . esc_attr( wp_json_encode( $steps_json ) ) . '"';
					if ( $icon_html ) {
						$dropdown_html .= ' data-edit-icon="' . esc_attr( $icon_html ) . '"';
					}
					if ( ! empty( $label_text ) ) {
						$dropdown_html .= ' aria-label="' . esc_attr( $label_text ) . '"';
					}
					$dropdown_html .= '>';
					if ( $icon_html ) {
						$dropdown_html .= '<div class="ts-action-icon"' . ( $icon_style ? ' style="' . $icon_style . '"' : '' ) . '>' . $icon_html . '</div>';
					}
					if ( $text ) {
						$dropdown_html .= $text;
					}
					$dropdown_html .= '</a>';
					$dropdown_html .= '</div>';
					$dropdown_html .= '</li>';

					$items_html .= $dropdown_html;
					continue 2; // Skip generic rendering below (continue 2 = skip foreach iteration, not just switch)
				}

				$action_href = esc_url( $edit_link );
				break;

			// view-post-stats-action.php:12
			case 'view_post_stats':
				$stats_template = \Voxel\get( 'templates.post_stats' );
				$stats_link     = $stats_template ? get_permalink( $stats_template ) : home_url( '/' );
				$action_href    = esc_url( add_query_arg( 'post_id', $post_id, $stats_link ) );
				break;

			// show-post-on-map.php:7-21 — build href using location filter
			case 'show_post_on_map':
				$map_href = 'javascript:void(0);';
				$location_field = $feed_vx_post->get_field( 'location' );
				$location_val   = $location_field ? $location_field->get_value() : [];
				if ( is_numeric( $location_val['latitude'] ?? null ) && is_numeric( $location_val['longitude'] ?? null ) ) {
					foreach ( $feed_vx_post->post_type->get_filters() as $filter ) {
						if ( $filter->get_type() === 'location' ) {
							$map_href = esc_url( add_query_arg( [
								'type' => $feed_vx_post->post_type->get_key(),
								$filter->get_key() => sprintf(
									'%s;%s,%s,%s',
									$location_val['address'] ?? '',
									$location_val['latitude'],
									$location_val['longitude'],
									12
								),
							], $feed_vx_post->post_type->get_archive_link() ) );
						}
					}
				}
				$action_href = $map_href;
				$action_class .= ' ts-action-show-on-map';
				$action_extras .= ' data-post-id="' . esc_attr( $post_id ) . '"';
				break;

			// follow-post-action.php:32-38
			case 'action_follow_post':
				$action_href = esc_url( add_query_arg( [
					'vx'      => 1,
					'action'  => 'user.follow_post',
					'post_id' => $post_id,
				], home_url( '/' ) ) );
				$action_class .= ' ts-action-follow';
				$action_extras .= ' role="button"';
				break;

			// follow-user-action.php:24-30
			case 'action_follow':
				$author_id = $feed_vx_post->get_author_id();
				$action_href = esc_url( add_query_arg( [
					'vx'      => 1,
					'action'  => 'user.follow_user',
					'user_id' => $author_id ?: 0,
				], home_url( '/' ) ) );
				$action_class .= ' ts-action-follow';
				$action_extras .= ' role="button"';
				break;

			// back_to_top, go_back, scroll_to_section, share_post — use <a href="#">
			case 'back_to_top':
			case 'go_back':
			case 'scroll_to_section':
			case 'share_post':
				$action_href = '#';
				$action_extras .= ' role="button"';
				break;

			// add-to-cart-action.php:28,39 — link to post or one-click
			case 'add_to_cart':
				$action_href = esc_url( $post_link );
				break;

			// select-addon.php:14
			case 'select_addition':
				$action_href = '#';
				$action_class .= ' ts-use-addition';
				$action_extras .= ' role="button"';
				if ( ! empty( $item['additionId'] ) ) {
					$action_extras .= ' data-id="' . esc_attr( $item['additionId'] ) . '"';
				}
				break;

			case 'none':
			default:
				$action_tag  = 'div';
				$action_href = '';
				$action_rel  = '';
				break;
		}
	} else {
		// No post context — fall back to div
		$action_tag  = 'div';
		$action_href = '';
		$action_rel  = '';
	}

	// Build aria-label (matches Voxel: uses text or tooltip)
	$aria_label = '';
	$label_text = $text ?: ( $item['tooltipText'] ?? '' );
	if ( $label_text && $action_tag === 'a' ) {
		$aria_label = ' aria-label="' . esc_attr( $label_text ) . '"';
	}

	// Build the list item HTML (matches Voxel's advanced-list template structure)
	$items_html .= '<li class="vxfse-repeater-item-' . $item_id . ' flexify ts-action"' . $tooltip_attr . '>';
	$items_html .= '<' . $action_tag;
	if ( $action_href ) {
		$items_html .= ' href="' . $action_href . '"';
	}
	$items_html .= ' class="' . esc_attr( $action_class ) . '"';
	$items_html .= $action_rel . $aria_label . $action_extras;
	$items_html .= '>';

	if ( $icon_html ) {
		$items_html .= '<div class="ts-action-icon"' . ( $icon_style ? ' style="' . $icon_style . '"' : '' ) . '>';
		$items_html .= $icon_html;
		$items_html .= '</div>';
	}

	if ( $text ) {
		$items_html .= $text;
	}

	$items_html .= '</' . $action_tag . '>';
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
