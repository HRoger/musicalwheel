<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\VoxelScript;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Token_List {

	protected $tokens;

	public function __construct( array $tokens ) {
		$this->tokens = $tokens;
	}

	public function get_tokens(): array {
		return $this->tokens;
	}
}


