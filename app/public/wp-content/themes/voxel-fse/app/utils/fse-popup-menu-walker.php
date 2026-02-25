<?php
/**
 * FSE Popup Menu Walker
 *
 * Extends Voxel's Popup_Menu_Walker to use FSE Icon_Processor for icon rendering.
 * Voxel's get_icon_markup() returns empty when Elementor is not active,
 * so this walker uses Icon_Processor which works without Elementor.
 *
 * @package VoxelFSE
 * @since 1.0.0
 */

namespace VoxelFSE\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FSE_Popup_Menu_Walker extends \Voxel\Utils\Popup_Menu_Walker {

	/**
	 * Override start_el to use Icon_Processor for icon rendering.
	 *
	 * This is a copy of the parent's start_el with the single change:
	 * \Voxel\get_icon_markup() → Icon_Processor::get_icon_markup()
	 */
	public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
		$classes = empty( $item->classes ) ? [] : (array) $item->classes;
		$classes[] = 'menu-item-' . $item->ID;

		$args = (object) apply_filters( 'nav_menu_item_args', $args, $item, $depth );

		$class_names = implode( ' ', apply_filters( 'nav_menu_css_class', array_filter( $classes ), $item, $args, $depth ) );
		$class_names = $class_names ? ' class="' . esc_attr( $class_names ) . '"' : '';

		$el_id = apply_filters( 'nav_menu_item_id', 'menu-item-' . $item->ID, $item, $args, $depth );
		$el_id = $el_id ? ' id="' . esc_attr( $el_id ) . '"' : '';

		$_output = '<li' . $el_id . $class_names . '>';

		$atts = [];
		$atts['title'] = ! empty( $item->attr_title ) ? $item->attr_title : '';
		$atts['target'] = ! empty( $item->target ) ? $item->target : '';
		if ( '_blank' === $item->target && empty( $item->xfn ) ) {
			$atts['rel'] = 'noopener';
		} else {
			$atts['rel'] = $item->xfn;
		}
		$atts['href'] = ! empty( $item->url ) ? $item->url : '';
		$atts['aria-current'] = $item->current ? 'page' : '';
		$atts['class'] = 'flexify';
		$atts = apply_filters( 'nav_menu_link_attributes', $atts, $item, $args, $depth );

		$attributes = '';
		foreach ( $atts as $attr => $value ) {
			if ( is_scalar( $value ) && '' !== $value && false !== $value ) {
				$value       = ( 'href' === $attr ) ? esc_url( $value ) : esc_attr( $value );
				$attributes .= ' ' . $attr . '="' . $value . '"';
			}
		}

		$title = apply_filters( 'the_title', $item->title, $item->ID );
		$title = apply_filters( 'nav_menu_item_title', $title, $item, $args, $depth );

		// menu item icon — use FSE Icon_Processor (works without Elementor)
		$icon_string = get_post_meta( $item->ID, '_voxel_item_icon', true );
		$icon = '';

		if ( ! empty( $icon_string ) ) {
			$icon_markup = Icon_Processor::get_icon_markup( $icon_string );
			if ( ! empty( $icon_markup ) ) {
				$icon = '<div class="ts-term-icon">' . $icon_markup . '</div>';
			}
		}

		$tag = 'a';

		ob_start();
		echo '<div class="ts-right-icon"></div>';
		$arrow_icon = ob_get_clean();
		$arrow = $args->walker->has_children ? $arrow_icon : '';

		// onclick trigger submenu
		$onclick = '';
		if ( $args->walker->has_children ) {
			$this->current_path[] = sprintf( '_submenu-%s', wp_unique_id() );
			$onclick = sprintf( ' @click.prevent="slide_from=\'right\'; screen=\'%s\';" ', $this->_current_submenu() );
		}

		$item_output  = $args->before;
		$item_output .= '<' . $tag . ' ' . $onclick . $attributes . '>';
		$item_output .= $args->link_before . $icon . '<span>' . $title . '</span>' . $arrow . $args->link_after;
		$item_output .= '</' . $tag . '>';
		$item_output .= $args->after;

		$this->last_item = [
			'title' => $title,
			'icon'  => $icon,
			'atts'  => $atts,
		];

		$_output .= apply_filters( 'walker_nav_menu_start_el', $item_output, $item, $depth, $args );

		if ( $depth === 0 ) {
			$output .= $_output;
		} else {
			$last_index = count( $this->submenus ) - 1;
			if ( isset( $this->submenus[ $last_index ] ) ) {
				$this->submenus[ $last_index ] .= $_output;
			}
		}
	}

	/**
	 * Access parent's private method via reflection workaround.
	 * The parent uses private methods, so we re-implement them here.
	 */
	private function _current_submenu() {
		return $this->current_path[ count( $this->current_path ) - 1 ];
	}

	private function _parent_submenu() {
		return $this->current_path[ count( $this->current_path ) - 2 ] ?? 'main';
	}
}
