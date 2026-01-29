<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\VoxelScript;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Renderer {

	protected
		$tokenizer,
		$groups;

	public function __construct( array $groups ) {
		$this->tokenizer = new \VoxelFSE\Dynamic_Data\VoxelScript\Tokenizer;
		$this->groups = $groups;

		// Reserve helper groups (no-ops now)
		$this->groups['tags'] = $this->groups['tags'] ?? null;
		$this->groups['endtags'] = $this->groups['endtags'] ?? null;
		$this->groups['value'] = $this->groups['value'] ?? null;
	}

	public function render( string $content, array $options = [] ): string {
		$token_list = $this->tokenizer->tokenize( $content );

		$value = '';
		foreach ( $token_list->get_tokens() as $token ) {
			$rendered = '';
			
			if ( $token instanceof \VoxelFSE\Dynamic_Data\VoxelScript\Tokens\Dynamic_Tag ) {
				$token->set_renderer( $this );
				if ( isset( $options['parent'] ) ) {
					$token->set_parent( $options['parent'] );
				}
				$rendered = $token->render();
			} elseif ( $token instanceof \VoxelFSE\Dynamic_Data\VoxelScript\Tokens\Plain_Text ) {
				$rendered = $token->render();
			}
			
			// Ensure rendered value is always a string
			if ( is_array( $rendered ) ) {
				$rendered = implode( '', $rendered );
			} elseif ( ! is_string( $rendered ) ) {
				$rendered = (string) $rendered;
			}
			
			$value .= $rendered;
		}

		return $value;
	}

	public function get_group( string $group_key ) {
		return $this->groups[ $group_key ] ?? null;
	}
}


