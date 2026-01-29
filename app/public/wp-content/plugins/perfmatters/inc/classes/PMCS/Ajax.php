<?php
namespace Perfmatters\PMCS;

class Ajax extends \Perfmatters\Ajax
{
	//init
	public function __construct() {
		add_action('wp_ajax_perfmatters_activate_snippet', array($this, 'activate_snippet'));
		add_action('wp_ajax_perfmatters_deactivate_snippet', array($this, 'deactivate_snippet'));
		add_action('wp_ajax_pmcs_get_location_terms', array($this, 'get_terms'));
		add_action('wp_ajax_pmcs_get_location_posts', array($this, 'get_posts'));
		add_action('wp_ajax_pmcs_get_location_objects', array($this, 'get_all_objects'));
	}

	//activate snippet
	public function activate_snippet() {

		Ajax::security_check();

        if(empty($_GET['file_name'])) {
            return;
        }

        if(Snippet::activate($_GET['file_name'])) {
            wp_send_json_success(array(
                'message' => __('Snippet activated.', 'perfmatters')
            ));
        }
	}

	//deactivate snippet
	public function deactivate_snippet() {

		Ajax::security_check();

        if(empty($_GET['file_name'])) {
            return;
        }

        if(Snippet::deactivate($_GET['file_name'])) {
            wp_send_json_success(array(
                'message' => __('Snippet deactivated.', 'perfmatters')
            ));
        }
	}

	//get posts for requested post type
	public function get_posts() {

		Ajax::security_check();
		
		if(empty($_POST['id'])) {
			return;
		}

		echo wp_json_encode(self::get_post_type_posts($_POST['id']));

		die();
	}

	//get terms for requested taxonomy
	public function get_terms() {

		Ajax::security_check();

		if(empty($_POST['id'])) {
			return;
		}

		echo wp_json_encode(self::get_taxonomy_terms($_POST['id']));

		die();
	}

	//get requested posts and terms together
	public function get_all_objects() {

		Ajax::security_check();

		if(empty($_POST['posts']) && empty($_POST['terms'])) {
			return;
		}

		$all_posts = self::get_post_type_posts($_POST['posts'] ?? '');
		$all_terms = self::get_taxonomy_terms($_POST['terms'] ?? '');

		echo wp_json_encode(array_merge($all_posts, $all_terms));

		die();
	}

	//get posts for specific post type
	public static function get_post_type_posts($post_type) {

		$post_type = (array) $post_type;

		$data = array();

		foreach($post_type as $type) {

			global $wpdb;

			$post_status = array('publish', 'future', 'draft', 'pending', 'private');

			$object = get_post_type_object($type);

			if(!$object) {
				continue;
			}

			$data[$type] = array(
				'type'     => 'posts',
				'postType' => $type,
				'label'    => $object->label,
				'objects'  => array(),
			);

			if($type === 'attachment') {
				$posts = $wpdb->get_results($wpdb->prepare("SELECT ID, post_title from $wpdb->posts where post_type = %s ORDER BY post_title", $type));
			} 
			else {
				$format = implode(', ', array_fill(0, count($post_status), '%s'));
				$query = sprintf("SELECT ID, post_title from $wpdb->posts where post_type = '%s' AND post_status IN(%s) ORDER BY post_title", $type, $format);
				$posts = $wpdb->get_results($wpdb->prepare($query, $post_status));
			}

			foreach($posts as $post) {
				$title = ($post->post_title !== '') ? esc_attr($post->post_title) : $type . '-' . $post->ID;
				$data[ $type ]['objects'][] = array(
					'id'    => $post->ID,
					'name'  => $title,
				);
			}
		}

		return $data;
	}

	//get terms for specific taxonomy
	public static function get_taxonomy_terms($tax_id) {
		
		$tax_id = (array) $tax_id;

		$data = array();

		foreach($tax_id as $id) {

			$tax = get_taxonomy($id);

			if(!$tax) {
				continue;
			}

			$terms = get_terms(
				array(
					'taxonomy'   => $id,
					'hide_empty' => false,
				)
			);

			$data[$id] = array(
				'type'     => 'terms',
				'taxonomy' => $id,
				'label'    => $tax->label,
				'objects'  => array(),
			);

			foreach($terms as $term) {
				$data[$id]['objects'][] = array(
					'id'   => $term->term_id,
					'name' => esc_attr($term->name),
				);
			}
		}

		return $data;
	}
}