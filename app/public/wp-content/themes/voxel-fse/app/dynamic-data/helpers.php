<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data;

if ( ! defined('ABSPATH') ) {
	exit;
}

/**
 * Truncate text to a specified length.
 *
 * @param string $text
 * @param int $length
 * @return string
 */
function truncate_text( string $text, int $length = 128 ): string {
	if ( mb_strlen( $text ) <= $length ) {
		return $text;
	}

	$text = rtrim( mb_substr( $text, 0, $length ) );
	$text .= "...";

	return $text;
}

/**
 * Abbreviate large numbers (e.g., 1k, 12.5k, 1m).
 *
 * @param mixed $number
 * @param int $precision
 * @return string|null
 */
function abbreviate_number( $number, $precision = 1 ) {
	if ( ! is_numeric( $number ) ) {
		return null;
	}

	if ( abs( $number ) < 1000 ) {
		return $number;
	}

	$units = ['', 'k', 'm', 'b', 't'];
	$power = floor( ( strlen( (int) $number ) - 1 ) / 3 );
	$unit = $units[ $power ] ?? 't';

	$abbreviated = $number / pow( 1000, $power );

	return round( $abbreviated, $precision ) . $unit;
}
