<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Modifiers;

if ( ! defined('ABSPATH') ) {
	exit;
}

class List_Modifier extends Base_Modifier {

	public function get_label(): string {
		return 'List all';
	}

	public function get_key(): string {
		return 'list';
	}

	public function expects(): array {
		return [ static::TYPE_ARRAY ];
	}

	protected function define_args(): void {
		$this->define_arg( [
			'type' => 'text',
			'label' => 'Item separator',
			'placeholder' => ', ',
		] );

		$this->define_arg( [
			'type' => 'text',
			'label' => 'Last item separator',
			'placeholder' => ', ',
		] );

		$this->define_arg( [
			'type' => 'text',
			'label' => 'Item prefix',
		] );

		$this->define_arg( [
			'type' => 'text',
			'label' => 'Item suffix',
		] );
	}

	public function apply( string $value ): mixed {
		// Simplified implementation: works with comma-separated values
		// TODO: Enhance to work with loopable properties when property system is complete
		if ( empty( $value ) ) {
			return '';
		}

		$items = explode( ',', $value );
		$items = array_filter( array_map( 'trim', $items ) );

		if ( empty( $items ) ) {
			return '';
		}

		$prefix = $this->get_arg(2);
		$suffix = $this->get_arg(3);
		if ( ! empty( $prefix ) || ! empty( $suffix ) ) {
			$items = array_map( function( $item ) use ( $prefix, $suffix ) {
				return $prefix . $item . $suffix;
			}, $items );
		}

		if ( count( $items ) === 1 ) {
			return array_shift( $items );
		}

		$last_item = array_pop( $items );
		$separator = $this->get_arg(0);
		if ( $separator === '' ) {
			$separator = ', ';
		}

		$last_separator = $this->get_arg(1);
		if ( $last_separator === '' ) {
			$last_separator = $separator;
		}

		return join( $separator, $items ) . $last_separator . $last_item;
	}
}
