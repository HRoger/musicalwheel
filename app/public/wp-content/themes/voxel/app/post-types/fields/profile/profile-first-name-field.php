<?php

namespace Voxel\Post_Types\Fields\Profile;

use \Voxel\Utils\Form_Models;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Profile_First_Name_Field extends \Voxel\Post_Types\Fields\Text_Field {

	public function before_props_assigned(): void {
		$this->props['label'] = 'First name';
		$this->props['type'] = 'profile-first-name';
		$this->props['key'] = 'voxel:first_name';
	}

	public function update( $value ): void {
		$author_id = $this->post->get_author_id();
		if ( ! $author_id ) {
			return;
		}

		wp_update_user( [
			'ID' => $author_id,
			'first_name' => wp_slash( $value ),
		] );
	}

	public function get_value() {
		$author = $this->post->get_author();
		if ( ! $author ) {
			return null;
		}

		$wp_user = $author->get_wp_user_object();
		return $wp_user->first_name;
	}

	public static function is_singular(): bool {
		return true;
	}
}

