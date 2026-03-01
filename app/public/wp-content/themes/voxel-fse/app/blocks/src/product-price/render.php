<?php
/**
 * Product Price Block - Server-Side Render
 *
 * Generates the full block wrapper HTML from $attributes (save() returns null).
 * This prevents WordPress block validation errors caused by NectarBlocks parent
 * containers injecting external inline styles (e.g., align-self:center).
 *
 * Non-feed: outputs wrapper + vxconfig for frontend.tsx React hydration.
 * Feed: outputs wrapper + vxconfig + server-rendered price HTML.
 *
 * Mirrors Voxel parent: themes/voxel/app/widgets/product-price.php:118-177
 *
 * @package VoxelFSE
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// $attributes is provided by WordPress block rendering
$block_id = $attributes['blockId'] ?? '';

// Build CSS variables from attributes
$style_vars = [];

if ( ! empty( $attributes['priceColor'] ) ) {
	$style_vars[] = '--vx-price-color:' . esc_attr( $attributes['priceColor'] );
}
if ( ! empty( $attributes['strikethroughTextColor'] ) ) {
	$style_vars[] = '--vx-strike-text-color:' . esc_attr( $attributes['strikethroughTextColor'] );
}
if ( ! empty( $attributes['strikethroughLineColor'] ) ) {
	$style_vars[] = '--vx-strike-line-color:' . esc_attr( $attributes['strikethroughLineColor'] );
}
if ( ! empty( $attributes['strikethroughWidth'] ) ) {
	$unit = $attributes['strikethroughWidthUnit'] ?? 'px';
	$style_vars[] = '--vx-strike-width:' . esc_attr( $attributes['strikethroughWidth'] . $unit );
}
if ( ! empty( $attributes['outOfStockColor'] ) ) {
	$style_vars[] = '--vx-nostock-color:' . esc_attr( $attributes['outOfStockColor'] );
}
if ( ! empty( $attributes['typography']['fontSize'] ) ) {
	$style_vars[] = '--vx-price-font-size:' . esc_attr( $attributes['typography']['fontSize'] );
}
if ( ! empty( $attributes['typography']['fontWeight'] ) ) {
	$style_vars[] = '--vx-price-font-weight:' . esc_attr( $attributes['typography']['fontWeight'] );
}
if ( ! empty( $attributes['strikethroughTypography']['fontSize'] ) ) {
	$style_vars[] = '--vx-strike-font-size:' . esc_attr( $attributes['strikethroughTypography']['fontSize'] );
}
if ( ! empty( $attributes['strikethroughTypography']['fontWeight'] ) ) {
	$style_vars[] = '--vx-strike-font-weight:' . esc_attr( $attributes['strikethroughTypography']['fontWeight'] );
}

$inline_style = ! empty( $style_vars ) ? implode( ';', $style_vars ) : '';

// Build vxconfig JSON for frontend hydration
$vxconfig = [];

if ( ! empty( $attributes['priceColor'] ) ) {
	$vxconfig['priceColor'] = $attributes['priceColor'];
}
if ( ! empty( $attributes['strikethroughTextColor'] ) ) {
	$vxconfig['strikethroughTextColor'] = $attributes['strikethroughTextColor'];
}
if ( ! empty( $attributes['strikethroughLineColor'] ) ) {
	$vxconfig['strikethroughLineColor'] = $attributes['strikethroughLineColor'];
}
if ( ! empty( $attributes['strikethroughWidth'] ) ) {
	$vxconfig['strikethroughWidth'] = $attributes['strikethroughWidth'];
}
if ( ! empty( $attributes['strikethroughWidthUnit'] ) ) {
	$vxconfig['strikethroughWidthUnit'] = $attributes['strikethroughWidthUnit'];
}
if ( ! empty( $attributes['outOfStockColor'] ) ) {
	$vxconfig['outOfStockColor'] = $attributes['outOfStockColor'];
}
if ( ! empty( $attributes['typography'] ) && is_array( $attributes['typography'] ) && array_filter( $attributes['typography'] ) ) {
	$vxconfig['typography'] = $attributes['typography'];
}
if ( ! empty( $attributes['strikethroughTypography'] ) && is_array( $attributes['strikethroughTypography'] ) && array_filter( $attributes['strikethroughTypography'] ) ) {
	$vxconfig['strikethroughTypography'] = $attributes['strikethroughTypography'];
}

$vxconfig_json = wp_json_encode( $vxconfig, JSON_UNESCAPED_SLASHES );

// Build extra attributes for the wrapper
$extra_attr_parts = [];

if ( $block_id ) {
	$extra_attr_parts[] = 'data-block-id="' . esc_attr( $block_id ) . '"';
}
if ( $inline_style ) {
	$extra_attr_parts[] = 'style="' . esc_attr( $inline_style ) . '"';
}

// Visibility/loop data attributes (headless-ready; also consumed by Block_Loader)
if ( ! empty( $attributes['visibilityBehavior'] ) ) {
	$extra_attr_parts[] = 'data-visibility-behavior="' . esc_attr( $attributes['visibilityBehavior'] ) . '"';
}
if ( ! empty( $attributes['visibilityRules'] ) ) {
	$extra_attr_parts[] = 'data-visibility-rules="' . esc_attr( wp_json_encode( $attributes['visibilityRules'] ) ) . '"';
}
if ( ! empty( $attributes['loopSource'] ) ) {
	$extra_attr_parts[] = 'data-loop-source="' . esc_attr( $attributes['loopSource'] ) . '"';
}
if ( ! empty( $attributes['loopLimit'] ) ) {
	$extra_attr_parts[] = 'data-loop-limit="' . esc_attr( $attributes['loopLimit'] ) . '"';
}
if ( ! empty( $attributes['loopOffset'] ) ) {
	$extra_attr_parts[] = 'data-loop-offset="' . esc_attr( $attributes['loopOffset'] ) . '"';
}

// Build class string — block-specific selector classes
$extra_classes = '';
if ( $block_id ) {
	$extra_classes = 'vxfse-product-price vxfse-product-price-' . esc_attr( $block_id );
}

// get_block_wrapper_attributes() adds: wp-block-voxel-fse-product-price, align, anchor, etc.
$wrapper_attrs = get_block_wrapper_attributes( [
	'class' => $extra_classes,
] );

// ============================================================================
// SERVER-SIDE PRICE RENDERING (all contexts: single post + feed cards)
// Eliminates FOUC by rendering price HTML immediately on first paint.
// frontend.tsx reads the SSR spans and skips the async REST API fetch.
// ============================================================================
$price_html = '';

$post = \Voxel\get_current_post();
if ( $post ) {
	$field = $post->get_field( 'product' );
	if ( $field && $field->get_type() === 'product' ) {
		// Check availability (mirrors Voxel widget logic exactly)
		$is_available = false;
		$error_message = '';
		try {
			$field->check_product_form_validity();
			$is_available = true;
		} catch ( \Exception $e ) {
			if ( $e->getCode() === \Voxel\PRODUCT_ERR_OUT_OF_STOCK ) {
				$error_message = _x( 'Out of stock', 'product price widget', 'voxel' );
			} else {
				$error_message = _x( 'Unavailable', 'product price widget', 'voxel' );
			}
		}

		if ( $is_available ) {
			$reference_date = $GLOBALS['_availability_start_date'] ?? \Voxel\now();
			$regular_price = $field->get_minimum_price_for_date( $reference_date, [
				'with_discounts' => false,
				'addons'         => $GLOBALS['_addon_filters'] ?? null,
			] );
			$discount_price = $field->get_minimum_price_for_date( $reference_date, [
				'with_discounts' => true,
				'addons'         => $GLOBALS['_addon_filters'] ?? null,
			] );
			$currency = \Voxel\get_primary_currency();

			// Calculate suffix
			$suffix = '';
			$product_type = $field->get_product_type();

			if ( $booking = $field->get_product_field( 'booking' ) ) {
				if ( $booking->get_booking_type() === 'days' && ( $field->get_value()['booking']['booking_mode'] ?? null ) === 'date_range' ) {
					if ( $product_type->config( 'modules.booking.date_ranges.count_mode' ) === 'nights' ) {
						$suffix = _x( ' / night', 'product price', 'voxel' );
					} else {
						$suffix = _x( ' / day', 'product price', 'voxel' );
					}
				}
			}

			if ( $subscription_interval = $field->get_product_field( 'subscription-interval' ) ) {
				$interval = $field->get_value()['subscription'];
				$suffix = '';
				if ( $formatted_interval = \Voxel\interval_format( $interval['unit'], $interval['frequency'] ) ) {
					$suffix = sprintf( ' / %s', $formatted_interval );
				}
			}

			// Build HTML (matches templates/widgets/product-price.php exactly)
			if ( $discount_price < $regular_price ) {
				$price_html = '<span class="vx-price">' . \Voxel\currency_format( $discount_price, $currency, false ) . $suffix . '</span>';
				$price_html .= '<span class="vx-price"><s>' . \Voxel\currency_format( $regular_price, $currency, false ) . $suffix . '</s></span>';
			} else {
				$price_html = '<span class="vx-price">' . \Voxel\currency_format( $regular_price, $currency, false ) . $suffix . '</span>';
			}
		} else {
			$price_html = '<span class="vx-price no-stock">' . esc_html( $error_message ) . '</span>';
		}
	}
}

// ============================================================================
// OUTPUT
// ============================================================================

// Signal to frontend.tsx that SSR price HTML is present — skip async fetch.
if ( $price_html ) {
	$extra_attr_parts[] = 'data-ssr="true"';
}

$extra_attrs_str = implode( ' ', $extra_attr_parts );

$output = '<div ' . $wrapper_attrs . ' ' . $extra_attrs_str . '>';
$output .= '<script type="text/json" class="vxconfig">' . $vxconfig_json . '</script>';
$output .= $price_html;
$output .= '</div>';

return $output;
