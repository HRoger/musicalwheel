<?php

namespace Voxel\Modules\Elementor\Custom_Controls;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Number_Control extends \Elementor\Control_Number {

	public function get_value( $control, $settings ) {
		if ( ! isset( $control['default'] ) ) {
			$control['default'] = $this->get_default_value();
		}

		if ( isset( $settings[ $control['name'] ] ) ) {
			$value = $settings[ $control['name'] ];
		} else {
			$value = $control['default'];
		}

		if ( '' === $value || null === $value ) {
			return $value;
		}

		if (
			is_string( $value )
			&& strncmp( $value, '@tags()', 7 ) === 0
			&& ! \Voxel\is_importing_elementor_template()
		) {
			$value = \Voxel\render( $value );
		}

		// if ( ! is_numeric( $value ) ) {
		// 	return ! empty( $control['default'] ) ? $control['default'] : '';
		// }

		return $value;
	}
}
