<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\VoxelScript;

use VoxelFSE\Dynamic_Data\VoxelScript\Tokens\Plain_Text;
use VoxelFSE\Dynamic_Data\VoxelScript\Tokens\Dynamic_Tag;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Tokenizer {

	protected
		$max_group_key_length = 32,
		$max_property_length = 60,
		$max_property_path_length = 240,
		$max_modifier_key_length = 100;

	protected $property_escape_chars = [
		')' => true,
		'.' => true,
		'\\' => true,
	];

	protected $modifier_escape_chars = [
		'(' => true,
		')' => true,
		',' => true,
		'\\' => true,
	];

	public function tokenize( string $content ): Token_List {
		$contentChars = $this->mb_str_split( $content );
		$length = count( $contentChars );

		$tokens = [];
		$i = 0;

		while ( $i < $length ) {
			if ( $contentChars[ $i ] === '@' ) {
				$i++;

				// Parse group key
				$group_key = '';
				$group_key_length = 0;
				while ( $i < $length && $group_key_length <= $this->max_group_key_length ) {
					if ( $contentChars[ $i ] === '(' ) {
						break;
					}
					if ( $contentChars[ $i ] === '@' ) {
						$tokens[] = new Plain_Text( '@' . $group_key );
						continue 2;
					}
					$group_key .= $contentChars[ $i ];
					$group_key_length++;
					$i++;
				}

				if ( $i >= $length || $contentChars[ $i ] !== '(' || ! preg_match( '/^[a-zA-Z0-9_]+$/', $group_key ) ) {
					$tokens[] = new Plain_Text( '@' . $group_key );
					continue;
				}

				// Parse props
				$i++; // skip '('
				$prop_index = 0;
				$props = [];
				$props[0] = '';
				$raw_props = '';
				$property_length = 0;
				$property_path_length = 0;
				while ( $i < $length && $property_length <= $this->max_property_length && $property_path_length <= $this->max_property_path_length ) {
					$raw_props .= $contentChars[ $i ];
					$property_path_length++;

					if ( $contentChars[ $i ] === ')' ) {
						break;
					} elseif ( $contentChars[ $i ] === '.' ) {
						$property_length = 0;
						$prop_index++;
						$props[ $prop_index ] = '';
						$i++;
						continue;
					} elseif ( $contentChars[ $i ] === '\\' && isset( $this->property_escape_chars[ $contentChars[ $i + 1 ] ?? '' ] ) ) {
						$props[ $prop_index ] .= $contentChars[ $i + 1 ];
						$i += 2;
						$property_length += 2;
					} else {
						$props[ $prop_index ] .= $contentChars[ $i ];
						$i++;
						$property_length++;
					}
				}

				if ( $i >= $length || $contentChars[ $i ] !== ')' ) {
					$tokens[] = new Plain_Text( '@' . $group_key . '(' . $raw_props );
					continue;
				}

				$i++; // skip ')'
				$token = new Dynamic_Tag( $group_key, $props, [] );
				$token->set_raw_props( mb_substr( $raw_props, 0, -1 ) );
				$tokens[] = $token;

				// Parse modifiers (stored, not applied in Phase 3.1)
				while ( $i < $length && $contentChars[ $i ] === '.' ) {
					$i++; // skip '.'
					$modifier_key = '';
					$modifier_key_length = 0;
					while ( $i < $length && $modifier_key_length <= $this->max_modifier_key_length ) {
						if ( $contentChars[ $i ] === '(' ) {
							break;
						}
						if ( $contentChars[ $i ] === '@' ) {
							$tokens[] = new Plain_Text( '.' . $modifier_key );
							continue 3;
						}
						$modifier_key .= $contentChars[ $i ];
						$modifier_key_length++;
						$i++;
					}
					if ( $i >= $length || $contentChars[ $i ] !== '(' || ! preg_match( '/^[a-zA-Z0-9_]+$/', $modifier_key ) ) {
						$tokens[] = new Plain_Text( '.' . $modifier_key );
						continue 2;
					}

					$modifier_arg_index = 0;
					$modifier_args = [];
					$modifier_args[0] = [ 'content' => '', 'dynamic' => false ];
					$raw_args = '';

					$i++; // skip '('
					$depth = 1;
					while ( $i < $length && $depth > 0 ) {
						$raw_args .= $contentChars[ $i ];
						if ( $contentChars[ $i ] === '(' ) {
							$depth++;
							$modifier_args[ $modifier_arg_index ]['dynamic'] = true;
							$modifier_args[ $modifier_arg_index ]['content'] .= '(';
							$i++;
						} elseif ( $contentChars[ $i ] === ')' ) {
							$depth--;
							if ( $depth === 0 ) {
								break;
							}
							$modifier_args[ $modifier_arg_index ]['content'] .= ')';
							$i++;
						} elseif ( $contentChars[ $i ] === ',' && $depth === 1 ) {
							$modifier_arg_index++;
							$modifier_args[ $modifier_arg_index ] = [ 'content' => '', 'dynamic' => false ];
							$i++;
						} elseif ( $contentChars[ $i ] === '\\' && isset( $this->modifier_escape_chars[ $contentChars[ $i + 1 ] ?? '' ] ) ) {
							if ( $depth === 1 ) {
								$modifier_args[ $modifier_arg_index ]['content'] .= $contentChars[ $i + 1 ];
								$i += 2;
							} else {
								$modifier_args[ $modifier_arg_index ]['content'] .= $contentChars[ $i ];
								$i++;
							}
						} else {
							$modifier_args[ $modifier_arg_index ]['content'] .= $contentChars[ $i ];
							$i++;
						}
					}
					if ( $depth !== 0 ) {
						$tokens[] = new Plain_Text( '.' . $modifier_key . '(' . $raw_args );
						continue 2;
					}
					$i++; // skip ')'
					$token->add_modifier( [
						'key' => $modifier_key,
						'args' => $modifier_args,
						'raw_args' => mb_substr( $raw_args, 0, -1 ),
					] );
				}
			} else {
				$text = '';
				while ( $i < $length ) {
					if ( $contentChars[ $i ] === '@' ) {
						break;
					}
					$text .= $contentChars[ $i ];
					$i++;
				}
				if ( $text !== '' ) {
					$tokens[] = new Plain_Text( $text );
				}
			}
		}

		return new Token_List( $tokens );
	}

	protected function mb_str_split( string $string ): array {
		if ( function_exists( '\mb_str_split' ) ) {
			$chars = \mb_str_split( $string );
			if ( $chars === false ) {
				return [];
			}
			return $chars;
		}
		return \preg_split( '//u', $string, -1, PREG_SPLIT_NO_EMPTY );
	}
}


