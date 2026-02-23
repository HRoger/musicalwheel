<?php
declare(strict_types=1);

/**
 * FSE NectarBlocks Dynamic Tags Controller
 *
 * Integrates Voxel's dynamic tag system into NectarBlocks without modifying
 * NB's plugin source code. Two responsibilities:
 *
 * 1. Injects `voxelDynamicTags` attribute into target NB blocks via
 *    `register_block_type_args` filter (priority 20, after NB's priority 11)
 *
 * 2. Resolves Voxel @tags() expressions in NB block HTML output via
 *    `render_block` filter (priority 15)
 *
 * @package VoxelFSE\Controllers
 */

namespace VoxelFSE\Controllers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FSE_NB_Dynamic_Tags_Controller extends FSE_Base_Controller {

	/**
	 * NB parent blocks — receive VoxelTab (4th tab) + voxelDynamicTags attribute.
	 * Must match the TypeScript nectarBlocksConfig.ts registry.
	 */
	private const PARENT_BLOCKS = [
		'nectar-blocks/image',
		'nectar-blocks/accordion',
		'nectar-blocks/button',
		'nectar-blocks/carousel',
		'nectar-blocks/divider',
		'nectar-blocks/flex-box',
		'nectar-blocks/icon',
		'nectar-blocks/icon-list',
		'nectar-blocks/image-gallery',
		'nectar-blocks/image-grid',
		'nectar-blocks/milestone',
		'nectar-blocks/post-content',
		'nectar-blocks/post-grid',
		'nectar-blocks/row',
		'nectar-blocks/scrolling-marquee',
		'nectar-blocks/star-rating',
		'nectar-blocks/tabs',
		'nectar-blocks/taxonomy-grid',
		'nectar-blocks/taxonomy-terms',
		'nectar-blocks/testimonial',
		'nectar-blocks/text',
		'nectar-blocks/video-lightbox',
		'nectar-blocks/video-player',
	];

	/**
	 * NB child/inner blocks — receive RowSettings (loop + visibility) + dynamic tag fields.
	 * These do NOT get VoxelTab (flat inspector layout, not tabbed).
	 */
	private const CHILD_BLOCKS = [
		'nectar-blocks/tab-section',
		'nectar-blocks/accordion-section',
		'nectar-blocks/column',
		'nectar-blocks/icon-list-item',
		'nectar-blocks/carousel-item',
	];

	/**
	 * NB blocks that get toolbar EnableTag for dynamic text content.
	 * Must match NB_TOOLBAR_TAG_BLOCKS in nectarBlocksConfig.ts.
	 */
	private const TOOLBAR_BLOCKS = [
		'nectar-blocks/text',
		'nectar-blocks/button',
	];

	protected function hooks(): void {
		// Inject voxelDynamicTags + VoxelTab attributes into target NB blocks
		$this->filter( 'register_block_type_args', '@inject_voxel_attributes', 20, 2 );

		// Resolve Voxel tags in NB block HTML output
		$this->filter( 'render_block', '@resolve_voxel_tags', 15, 2 );

		// Apply VoxelTab features (visibility, loop, sticky) to NB blocks
		$this->filter( 'render_block', '@apply_nb_voxel_tab_features', 16, 2 );

		// Resolve child block dynamic fields (title, CSS ID)
		$this->filter( 'render_block', '@resolve_child_dynamic_fields', 15, 2 );

		// Resolve toolbar dynamic content (text/button block full content replacement)
		$this->filter( 'render_block', '@resolve_toolbar_dynamic_content', 14, 2 );
	}

	/**
	 * Inject Voxel attributes into NB blocks.
	 *
	 * Parent blocks get: voxelDynamicTags + VoxelTab attributes (sticky, visibility, loop)
	 * Child blocks get: RowSettings attributes (loop, visibility, dynamic title/CSS ID)
	 *
	 * Priority 20 ensures this runs after NB's own register_block_type_args
	 * filter (priority 11) that wraps render callbacks.
	 *
	 * @param array<string,mixed> $args Block type arguments.
	 * @param string $name Block type name.
	 * @return array<string,mixed> Modified arguments.
	 */
	protected function inject_voxel_attributes( array $args, string $name ): array {
		$is_parent = in_array( $name, self::PARENT_BLOCKS, true );
		$is_child  = in_array( $name, self::CHILD_BLOCKS, true );

		if ( ! $is_parent && ! $is_child ) {
			return $args;
		}

		if ( ! isset( $args['attributes'] ) || ! is_array( $args['attributes'] ) ) {
			$args['attributes'] = [];
		}

		if ( $is_parent ) {
			// voxelDynamicTags — stores per-field tag expressions
			$args['attributes']['voxelDynamicTags'] = [
				'type'    => 'object',
				'default' => new \stdClass(),
			];

			// VoxelTab attributes (sticky, visibility, loop)
			require_once dirname( __DIR__ ) . '/blocks/shared/voxel-tab-attributes.php';
			$voxel_tab_attrs = \VoxelFSE\Blocks\Shared\get_voxel_tab_attributes();
			foreach ( $voxel_tab_attrs as $attr_key => $attr_def ) {
				$args['attributes'][ $attr_key ] = $attr_def;
			}
		}

		// Toolbar blocks get voxelDynamicContent (for dynamic text replacement)
		if ( in_array( $name, self::TOOLBAR_BLOCKS, true ) ) {
			$args['attributes']['voxelDynamicContent'] = [
				'type'    => 'string',
				'default' => '',
			];
		}

		if ( $is_child ) {
			// voxelDynamicTags — stores per-field tag expressions (CSS Classes, Custom ID)
			$args['attributes']['voxelDynamicTags'] = [
				'type'    => 'object',
				'default' => new \stdClass(),
			];

			// RowSettings attributes (loop + visibility + dynamic tag fields)
			$child_attrs = [
				'loopEnabled'        => [ 'type' => 'boolean', 'default' => false ],
				'loopSource'         => [ 'type' => 'string', 'default' => '' ],
				'loopProperty'       => [ 'type' => 'string', 'default' => '' ],
				'loopLimit'          => [ 'type' => 'string', 'default' => '' ],
				'loopOffset'         => [ 'type' => 'string', 'default' => '' ],
				'visibilityBehavior' => [ 'type' => 'string', 'default' => 'show' ],
				'visibilityRules'    => [ 'type' => 'array', 'default' => [] ],
				'voxelDynamicTitle'  => [ 'type' => 'string', 'default' => '' ],
				'voxelDynamicCssId'  => [ 'type' => 'string', 'default' => '' ],
			];
			foreach ( $child_attrs as $attr_key => $attr_def ) {
				$args['attributes'][ $attr_key ] = $attr_def;
			}
		}

		return $args;
	}

	/**
	 * Resolve Voxel @tags() expressions in NB block HTML output.
	 *
	 * This filter runs on every block's rendered HTML. It gates on:
	 * 1. Block must be in the nectar-blocks/* namespace
	 * 2. Block must have non-empty voxelDynamicTags attribute
	 *
	 * For each field with a tag expression, it resolves the expression
	 * using Voxel's renderer and applies type-specific HTML replacement.
	 *
	 * @param string $block_content The block's rendered HTML.
	 * @param array<string,mixed> $block The block data (blockName, attrs, etc.).
	 * @return string Modified HTML with resolved dynamic tags.
	 */
	protected function resolve_voxel_tags( string $block_content, array $block ): string {
		// Gate: only NB blocks
		if ( empty( $block['blockName'] ) || strpos( $block['blockName'], 'nectar-blocks/' ) !== 0 ) {
			return $block_content;
		}

		$attrs = $block['attrs'] ?? [];
		$tags  = $attrs['voxelDynamicTags'] ?? [];

		if ( empty( $tags ) || ! is_array( $tags ) ) {
			return $block_content;
		}

		// Collect custom attribute resolutions (grouped by item ID)
		$custom_attr_resolved = [];

		foreach ( $tags as $field_key => $expression ) {
			if ( empty( $expression ) || ! is_string( $expression ) ) {
				continue;
			}

			// Resolve the expression: if wrapped with @tags(), use Voxel renderer;
			// otherwise treat as plain text (user typed directly in input without modal).
			if ( strpos( $expression, '@tags()' ) !== false ) {
				$resolved = $this->resolve_expression( $expression );
			} else {
				$resolved = $expression;
			}

			if ( $resolved === '' || $resolved === null ) {
				continue;
			}

			// Custom attribute fields: customAttr_{id}_name / customAttr_{id}_value
			if ( preg_match( '/^customAttr_(.+)_(name|value)$/', $field_key, $m ) ) {
				$item_id = $m[1];
				$prop    = $m[2]; // 'name' or 'value'
				if ( ! isset( $custom_attr_resolved[ $item_id ] ) ) {
					$custom_attr_resolved[ $item_id ] = [];
				}
				$custom_attr_resolved[ $item_id ][ $prop ] = $resolved;
				continue;
			}

			// Apply field-type-specific replacement
			$block_content = $this->apply_field_resolution(
				$block_content,
				$field_key,
				$resolved
			);
		}

		// Apply custom attribute resolutions to the root element
		if ( ! empty( $custom_attr_resolved ) ) {
			$block_content = $this->apply_custom_attributes( $block_content, $custom_attr_resolved, $attrs );
		}

		return $block_content;
	}

	/**
	 * Apply VoxelTab features (visibility, loop, sticky) to NB parent blocks.
	 *
	 * Mirrors Block_Loader::apply_voxel_tab_features() but for nectar-blocks/* namespace.
	 * Runs at priority 16 (after resolve_voxel_tags at 15).
	 *
	 * @param string $block_content The block's rendered HTML.
	 * @param array<string,mixed> $block The block data.
	 * @return string Modified HTML.
	 */
	protected function apply_nb_voxel_tab_features( string $block_content, array $block ): string {
		if ( empty( $block['blockName'] ) || strpos( $block['blockName'], 'nectar-blocks/' ) !== 0 ) {
			return $block_content;
		}

		// Only process blocks we've registered (parent + child)
		$name = $block['blockName'];
		if ( ! in_array( $name, self::PARENT_BLOCKS, true ) && ! in_array( $name, self::CHILD_BLOCKS, true ) ) {
			return $block_content;
		}

		if ( empty( $block_content ) && empty( $block['attrs'] ) ) {
			return $block_content;
		}

		$attributes = $block['attrs'] ?? [];

		// 1. Evaluate Visibility Rules
		$rules = $attributes['visibilityRules'] ?? [];
		if ( ! empty( $rules ) ) {
			require_once dirname( __DIR__ ) . '/blocks/shared/visibility-evaluator.php';
			$behavior = $attributes['visibilityBehavior'] ?? 'show';

			if ( ! \VoxelFSE\Blocks\Shared\Visibility_Evaluator::evaluate( $rules, $behavior ) ) {
				return '';
			}
		}

		// 2. Handle Loop Element
		if ( ! empty( $attributes['loopSource'] ) ) {
			require_once dirname( __DIR__ ) . '/blocks/shared/loop-processor.php';
			return \VoxelFSE\Blocks\Shared\Loop_Processor::render_looped( $attributes, $block_content );
		}

		// 3. Apply Sticky CSS (parent blocks only)
		if ( in_array( $name, self::PARENT_BLOCKS, true ) && ! empty( $attributes['stickyEnabled'] ) ) {
			$block_content = $this->apply_nb_sticky_styles( $block_content, $attributes );
		}

		return $block_content;
	}

	/**
	 * Apply sticky position styles to an NB block's root element.
	 *
	 * Uses inline styles since NB blocks don't have blockId for CSS classes.
	 *
	 * @param string $content Block HTML.
	 * @param array<string,mixed> $attributes Block attributes.
	 * @return string Modified HTML.
	 */
	private function apply_nb_sticky_styles( string $content, array $attributes ): string {
		$desktop = $attributes['stickyDesktop'] ?? 'sticky';

		// Apply position
		if ( $desktop === 'sticky' || $desktop === 'fixed' ) {
			$content = $this->add_inline_style( $content, 'position', $desktop );
		}

		// Apply offsets (top, left, right, bottom)
		$directions = [ 'Top', 'Left', 'Right', 'Bottom' ];
		foreach ( $directions as $dir ) {
			$key      = 'sticky' . $dir;
			$unit_key = $key . 'Unit';

			if ( isset( $attributes[ $key ] ) && $attributes[ $key ] !== '' ) {
				$unit  = $attributes[ $unit_key ] ?? 'px';
				$value = $attributes[ $key ] . $unit;
				$content = $this->add_inline_style( $content, strtolower( $dir ), $value );
			}
		}

		// Add z-index for sticky elements
		$content = $this->add_inline_style( $content, 'z-index', '100' );

		return $content;
	}

	/**
	 * Resolve child block dynamic fields (voxelDynamicTitle, voxelDynamicCssId).
	 *
	 * For child blocks like tab-section and accordion-section, resolves
	 * dynamic tag expressions stored in individual attributes.
	 *
	 * @param string $block_content The block's rendered HTML.
	 * @param array<string,mixed> $block The block data.
	 * @return string Modified HTML.
	 */
	protected function resolve_child_dynamic_fields( string $block_content, array $block ): string {
		if ( empty( $block['blockName'] ) || ! in_array( $block['blockName'], self::CHILD_BLOCKS, true ) ) {
			return $block_content;
		}

		$attrs = $block['attrs'] ?? [];

		// Resolve dynamic title — supports both @tags() wrapped and plain text
		$dynamic_title = $attrs['voxelDynamicTitle'] ?? '';
		if ( ! empty( $dynamic_title ) ) {
			if ( strpos( $dynamic_title, '@tags()' ) !== false ) {
				$resolved_title = $this->resolve_expression( $dynamic_title );
			} else {
				$resolved_title = $dynamic_title; // Plain text, use directly
			}
			if ( $resolved_title !== '' ) {
				// Replace the first text content in title/heading elements
				// NB tab-section uses <h4> or <span> for titles, accordion-section uses <h3> or <button>
				$block_content = $this->replace_child_title( $block_content, $resolved_title, $block['blockName'] );
			}
		}

		// Resolve dynamic CSS ID — supports both @tags() wrapped and plain text
		$dynamic_css_id = $attrs['voxelDynamicCssId'] ?? '';
		if ( ! empty( $dynamic_css_id ) ) {
			if ( strpos( $dynamic_css_id, '@tags()' ) !== false ) {
				$resolved_id = $this->resolve_expression( $dynamic_css_id );
			} else {
				$resolved_id = $dynamic_css_id; // Plain text, use directly
			}
			if ( $resolved_id !== '' ) {
				$sanitized_id = sanitize_html_class( $resolved_id );
				// Add or replace id attribute on root element
				if ( preg_match( '/^(<[a-z][a-z0-9]*\b[^>]*)\bid="[^"]*"/', $block_content ) ) {
					$block_content = preg_replace(
						'/^(<[a-z][a-z0-9]*\b[^>]*)\bid="[^"]*"/',
						'$1id="' . esc_attr( $sanitized_id ) . '"',
						$block_content,
						1
					) ?? $block_content;
				} else {
					$block_content = preg_replace(
						'/^(<[a-z][a-z0-9]*\b)/',
						'$1 id="' . esc_attr( $sanitized_id ) . '"',
						$block_content,
						1
					) ?? $block_content;
				}
			}
		}

		return $block_content;
	}

	/**
	 * Replace child block title text with resolved dynamic value.
	 *
	 * @param string $content Block HTML.
	 * @param string $resolved_title Resolved title text.
	 * @param string $block_name The block name for type-specific logic.
	 * @return string Modified HTML.
	 */
	private function replace_child_title( string $content, string $resolved_title, string $block_name ): string {
		$escaped = esc_html( $resolved_title );

		switch ( $block_name ) {
			case 'nectar-blocks/tab-section':
				// Tab section title is in data-title attribute
				if ( preg_match( '/\bdata-title="[^"]*"/', $content ) ) {
					$content = preg_replace(
						'/\bdata-title="[^"]*"/',
						'data-title="' . esc_attr( $resolved_title ) . '"',
						$content,
						1
					) ?? $content;
				}
				return $content;

			case 'nectar-blocks/accordion-section':
				// Accordion title is typically in a heading tag inside the trigger
				$content = preg_replace(
					'/(<(?:h[1-6]|button|span)\b[^>]*class="[^"]*nectar-accordion[^"]*"[^>]*>)[^<]*/',
					'$1' . $escaped,
					$content,
					1
				) ?? $content;
				return $content;

			case 'nectar-blocks/icon-list-item':
				// Icon list item text content
				$content = preg_replace(
					'/(<span\b[^>]*class="[^"]*list-item-text[^"]*"[^>]*>)[^<]*/',
					'$1' . $escaped,
					$content,
					1
				) ?? $content;
				return $content;
			default:
				return $content;
		}
	}

	/**
	 * Resolve a Voxel tag expression to its final value.
	 *
	 * Uses Voxel parent's \Voxel\render() as primary resolver,
	 * falls back to child theme's Block_Renderer if available.
	 *
	 * @param string $expression The full expression with @tags()...@endtags() wrapper.
	 * @return string The resolved value (empty string if unresolvable).
	 */
	private function resolve_expression( string $expression ): string {
		// Try Voxel parent render function first (most reliable)
		if ( function_exists( '\Voxel\render' ) ) {
			return (string) \Voxel\render( $expression );
		}

		// Fallback: child theme Block_Renderer
		if ( class_exists( '\VoxelFSE\Dynamic_Data\Block_Renderer' ) ) {
			$result = \VoxelFSE\Dynamic_Data\Block_Renderer::render_expression( $expression );
			// Strip @tags()...@endtags() wrapper from result
			if ( preg_match( '/@tags\(\)(.*?)@endtags\(\)/s', $result, $match ) ) {
				return $match[1];
			}
			return $result;
		}

		return '';
	}

	/**
	 * Apply resolved value to the block HTML based on field type.
	 *
	 * @param string $content Block HTML content.
	 * @param string $field_key Field key from nectarBlocksConfig.
	 * @param string $resolved The resolved value.
	 * @return string Modified HTML.
	 */
	private function apply_field_resolution( string $content, string $field_key, string $resolved ): string {
		switch ( $field_key ) {
			case 'imageSource':
				return $this->resolve_image_source( $content, $resolved );

			case 'iconImage':
				return $this->resolve_icon_image( $content, $resolved );

			case 'title':
				// Title attribute on the <img> tag
				return preg_replace(
					'/(<img\b[^>]*)\btitle="[^"]*"/',
					'$1title="' . esc_attr( $resolved ) . '"',
					$content,
					1
				) ?? $content;

			case 'altText':
				// Alt attribute on the <img> tag
				return preg_replace(
					'/(<img\b[^>]*)\balt="[^"]*"/',
					'$1alt="' . esc_attr( $resolved ) . '"',
					$content,
					1
				) ?? $content;

			case 'linkUrl':
				// href on <a> tags
				return preg_replace(
					'/(<a\b[^>]*)\bhref="[^"]*"/',
					'$1href="' . esc_url( $resolved ) . '"',
					$content,
					1
				) ?? $content;

			case 'cssClasses':
				// Append classes to root element
				return $this->append_css_classes( $content, $resolved );

			case 'zIndex':
				// Add z-index to root element's style
				return $this->add_inline_style( $content, 'z-index', $resolved );


			case 'rating':
				// Replace data-rating attribute on NB star-rating root element.
				// NB renders: <div class="nectar-star-rating" data-rating="4.5">
				if ( preg_match( '/\\bdata-rating="[^"]*"/', $content ) ) {
					return preg_replace(
						'/\\bdata-rating="[^"]*"/',
						'data-rating="' . esc_attr( $resolved ) . '"',
						$content,
						1
					) ?? $content;
				}
				return $content;

			case 'customId':
				// Add or replace id attribute on root element
				$sanitized_id = sanitize_html_class( $resolved );
				if ( preg_match( '/^(<[a-z][a-z0-9]*\b[^>]*)\bid="[^"]*"/', $content ) ) {
					return preg_replace(
						'/^(<[a-z][a-z0-9]*\b[^>]*)\bid="[^"]*"/',
						'$1id="' . esc_attr( $sanitized_id ) . '"',
						$content,
						1
					) ?? $content;
				}
				return preg_replace(
					'/^(<[a-z][a-z0-9]*\b)/',
					'$1 id="' . esc_attr( $sanitized_id ) . '"',
					$content,
					1
				) ?? $content;

			case 'textContent':
				// Replace inner text content of NB text/button blocks.
				// Same logic as resolve_toolbar_dynamic_content but for tag system.
				return preg_replace(
					'/(<(?:p|h[1-6]|span|li)\\b[^>]*>)[^<]*(<\\/(?:p|h[1-6]|span|li)>)/',
					'$1' . esc_html( $resolved ) . '$2',
					$content
				) ?? $content;

			default:
				return $content;
		}
	}

	/**
	 * Resolve icon image — handles Voxel icon format (svg:ID, etc.) and plain attachment IDs.
	 * Replaces the icon SVG/element inside .nectar-blocks-icon__inner with an <img> tag.
	 */
	private function resolve_icon_image( string $content, string $resolved ): string {
		$image_url = '';

		// Parse Voxel icon format: "svg:72", "image:123", or plain numeric ID
		if ( function_exists( '\Voxel\parse_icon_string' ) ) {
			$icon = \Voxel\parse_icon_string( $resolved );
			if ( $icon && ! empty( $icon['value']['url'] ) ) {
				$image_url = $icon['value']['url'];
			} elseif ( $icon && ! empty( $icon['value']['id'] ) ) {
				$url = wp_get_attachment_url( (int) $icon['value']['id'] );
				if ( $url ) {
					$image_url = $url;
				}
			}
		}

		// Fallback: try "svg:ID" format manually
		if ( empty( $image_url ) && preg_match( '/^svg:(\d+)$/', $resolved, $m ) ) {
			$url = wp_get_attachment_url( (int) $m[1] );
			if ( $url ) {
				$image_url = $url;
			}
		}

		// Fallback: plain numeric attachment ID
		if ( empty( $image_url ) && is_numeric( $resolved ) ) {
			$url = wp_get_attachment_url( (int) $resolved );
			if ( $url ) {
				$image_url = $url;
			}
		}

		if ( empty( $image_url ) ) {
			return $content;
		}

		$img_tag = '<img src="' . esc_url( $image_url ) . '" alt="" class="voxel-dynamic-icon-image" style="width:100%;height:100%;object-fit:contain;" />';

		// Replace the SVG/icon element inside .nectar-blocks-icon__inner
		// NB icon block renders: <i class="nectar-component__icon ...">...</i> or an inline SVG
		$replaced = preg_replace(
			'/<i\b[^>]*class="[^"]*nectar-component__icon[^"]*"[^>]*>.*?<\/i>/s',
			$img_tag,
			$content,
			1
		);

		if ( $replaced !== $content ) {
			return $replaced;
		}

		// Also try replacing an inline SVG element
		$replaced = preg_replace(
			'/<svg\b[^>]*>.*?<\/svg>/s',
			$img_tag,
			$content,
			1
		);

		return $replaced ?? $content;
	}

	/**
	 * Resolve image source — handles both URL and attachment ID results.
	 */
	private function resolve_image_source( string $content, string $resolved ): string {
		$image_url = $resolved;

		// If resolved is a numeric ID, convert to URL
		if ( is_numeric( $resolved ) ) {
			$url = wp_get_attachment_image_url( (int) $resolved, 'large' );
			if ( $url ) {
				$image_url = $url;
			} else {
				return $content;
			}
		}

		// Replace src on the first <img> tag
		$replaced = preg_replace(
			'/(<img\b[^>]*)\bsrc="[^"]*"/',
			'$1src="' . esc_url( $image_url ) . '"',
			$content,
			1
		);

		return $replaced ?? $content;
	}

	/**
	 * Append CSS classes to the root element's class attribute.
	 */
	private function append_css_classes( string $content, string $classes ): string {
		// Match the first element's class attribute
		$replaced = preg_replace(
			'/^(<[a-z][a-z0-9]*\b[^>]*)\bclass="([^"]*)"/',
			'$1class="$2 ' . esc_attr( $classes ) . '"',
			$content,
			1
		);

		return $replaced ?? $content;
	}

	/**
	 * Add an inline style property to the root element.
	 */
	private function add_inline_style( string $content, string $property, string $value ): string {
		$style_addition = $property . ':' . esc_attr( $value );

		// If element already has a style attribute, append to it
		if ( preg_match( '/^(<[a-z][a-z0-9]*\b[^>]*)\bstyle="([^"]*)"/', $content ) ) {
			$replaced = preg_replace(
				'/^(<[a-z][a-z0-9]*\b[^>]*)\bstyle="([^"]*)"/',
				'$1style="$2;' . $style_addition . '"',
				$content,
				1
			);
			return $replaced ?? $content;
		}

		// No style attribute — add one to the first element
		$replaced = preg_replace(
			'/^(<[a-z][a-z0-9]*\b)/',
			'$1 style="' . $style_addition . '"',
			$content,
			1
		);

		return $replaced ?? $content;
	}

	/**
	 * Apply resolved custom attributes to the root element.
	 *
	 * For each item in voxelDynamicTags matching customAttr_{id}_{name|value},
	 * resolve the tag and add/replace the attribute on the root HTML element.
	 * If only the value is dynamic but the name is static, read the static name
	 * from the block's link.customAttributes array.
	 *
	 * @param string $content Block HTML.
	 * @param array<string,array<string,string>> $resolved_attrs Resolved attrs keyed by item ID.
	 * @param array<string,mixed> $attrs Block attributes.
	 * @return string Modified HTML.
	 */
	private function apply_custom_attributes( string $content, array $resolved_attrs, array $attrs ): string {
		$custom_attributes = $attrs['link']['customAttributes'] ?? [];

		foreach ( $resolved_attrs as $item_id => $resolved ) {
			// Find the static values from block attributes
			$static_item = null;
			foreach ( $custom_attributes as $item ) {
				if ( isset( $item['id'] ) && $item['id'] === $item_id ) {
					$static_item = $item;
					break;
				}
			}

			// Determine final attribute name and value
			$attr_name  = $resolved['name'] ?? ( $static_item['attribute'] ?? '' );
			$attr_value = $resolved['value'] ?? ( $static_item['value'] ?? '' );

			if ( empty( $attr_name ) ) {
				continue;
			}

			// Sanitize: only allow safe attribute names (alphanumeric, hyphens, underscores)
			$attr_name = preg_replace( '/[^a-zA-Z0-9_-]/', '', $attr_name );
			if ( empty( $attr_name ) ) {
				continue;
			}

			// Add or replace the attribute on the root element
			$escaped_value = esc_attr( $attr_value );

			if ( preg_match( '/^(<[a-z][a-z0-9]*\b[^>]*)\b' . preg_quote( $attr_name, '/' ) . '="[^"]*"/', $content ) ) {
				// Replace existing attribute
				$content = preg_replace(
					'/^(<[a-z][a-z0-9]*\b[^>]*)\b' . preg_quote( $attr_name, '/' ) . '="[^"]*"/',
					'$1' . $attr_name . '="' . $escaped_value . '"',
					$content,
					1
				) ?? $content;
			} else {
				// Add new attribute to root element
				$content = preg_replace(
					'/^(<[a-z][a-z0-9]*\b)/',
					'$1 ' . $attr_name . '="' . $escaped_value . '"',
					$content,
					1
				) ?? $content;
			}
		}

		return $content;
	}

	/**
	 * Resolve toolbar dynamic content for text/button blocks.
	 *
	 * For blocks in TOOLBAR_BLOCKS with non-empty voxelDynamicContent,
	 * resolves VoxelScript expressions and replaces inner text content.
	 *
	 * Runs at priority 14 (before resolve_voxel_tags at 15).
	 *
	 * @param string $block_content The block's rendered HTML.
	 * @param array<string,mixed> $block The block data.
	 * @return string Modified HTML.
	 */
	protected function resolve_toolbar_dynamic_content( string $block_content, array $block ): string {
		if ( empty( $block['blockName'] ) || ! in_array( $block['blockName'], self::TOOLBAR_BLOCKS, true ) ) {
			return $block_content;
		}

		$dynamic_content = $block['attrs']['voxelDynamicContent'] ?? '';
		if ( empty( $dynamic_content ) ) {
			return $block_content;
		}

		// Wrap with @tags() if not already wrapped
		if ( strpos( $dynamic_content, '@tags()' ) === false ) {
			$dynamic_content = '@tags()' . $dynamic_content . '@endtags()';
		}

		$resolved = $this->resolve_expression( $dynamic_content );
		if ( $resolved === '' ) {
			return $block_content;
		}

		// Replace inner text content of the block
		// NB text blocks render as: <div class="nectar-text-...">...<p>text</p>...</div>
		// NB button blocks render as: <a class="nectar-button ..."><span>text</span></a>
		switch ( $block['blockName'] ) {
			case 'nectar-blocks/text':
				// Replace content inside text elements (p, h1-h6, span, li)
				return preg_replace(
					'/(<(?:p|h[1-6]|span|li)\\b[^>]*>)[^<]*(<\\/(?:p|h[1-6]|span|li)>)/',
					'$1' . esc_html( $resolved ) . '$2',
					$block_content
				) ?? $block_content;

			case 'nectar-blocks/button':
				// Replace text inside the <a> or <button> element
				// NB button: <a class="nectar-button ..."><span>text</span></a>
				if ( preg_match( '/<span\\b[^>]*>[^<]*<\\/span>/', $block_content ) ) {
					return preg_replace(
						'/(<span\\b[^>]*>)[^<]*(<\\/span>)/',
						'$1' . esc_html( $resolved ) . '$2',
						$block_content,
						1
					) ?? $block_content;
				}
				// Fallback: replace text inside <a> directly
				return preg_replace(
					'/(<a\\b[^>]*>)[^<]*(<\\/a>)/',
					'$1' . esc_html( $resolved ) . '$2',
					$block_content,
					1
				) ?? $block_content;

			default:
				return $block_content;
		}
	}
}
