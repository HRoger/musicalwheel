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
	 * NB blocks that receive Voxel dynamic tag attributes.
	 * Must match the TypeScript nectarBlocksConfig.ts registry.
	 */
	private const TARGET_BLOCKS = [
		'nectar-blocks/image',
		// Add more NB blocks here as needed
	];

	protected function hooks(): void {
		// Inject voxelDynamicTags attribute into target NB blocks
		$this->filter( 'register_block_type_args', '@inject_voxel_attributes', 20, 2 );

		// Resolve Voxel tags in NB block HTML output
		$this->filter( 'render_block', '@resolve_voxel_tags', 15, 2 );
	}

	/**
	 * Inject voxelDynamicTags attribute into target NB blocks.
	 *
	 * Priority 20 ensures this runs after NB's own register_block_type_args
	 * filter (priority 11) that wraps render callbacks.
	 *
	 * @param array<string,mixed> $args Block type arguments.
	 * @param string $name Block type name.
	 * @return array<string,mixed> Modified arguments.
	 */
	protected function inject_voxel_attributes( array $args, string $name ): array {
		if ( ! in_array( $name, self::TARGET_BLOCKS, true ) ) {
			return $args;
		}

		// Add voxelDynamicTags attribute — stores per-field tag expressions
		// Structure: { fieldKey: '@tags()@post(title)@endtags()' }
		if ( ! isset( $args['attributes'] ) || ! is_array( $args['attributes'] ) ) {
			$args['attributes'] = [];
		}

		$args['attributes']['voxelDynamicTags'] = [
			'type'    => 'object',
			'default' => new \stdClass(),
		];

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

			if ( strpos( $expression, '@tags()' ) === false ) {
				continue;
			}

			// Resolve the expression
			$resolved = $this->resolve_expression( $expression );

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

			default:
				return $content;
		}
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
}
