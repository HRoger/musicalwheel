<?php

namespace Voxel\Post_Types\Fields\Profile;

use \Voxel\Utils\Form_Models;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Profile_Bio_Field extends \Voxel\Post_Types\Fields\Texteditor_Field {

	public function before_props_assigned(): void {
		$this->props['label'] = 'Bio';
		$this->props['type'] = 'profile-bio';
		$this->props['key'] = 'voxel:bio';
		$this->props['editor-type'] = 'plain-text';
	}

	public function update( $value ): void {
		$author_id = $this->post->get_author_id();
		if ( ! $author_id ) {
			return;
		}

		wp_update_user( [
			'ID' => $author_id,
			'description' => wp_slash( $value ),
		] );
	}

	public function get_value() {
		$author = $this->post->get_author();
		if ( ! $author ) {
			return null;
		}

		$wp_user = $author->get_wp_user_object();
		return $wp_user->description;
	}

	public static function is_singular(): bool {
		return true;
	}
}

