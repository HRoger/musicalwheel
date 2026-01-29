<?php
namespace EssentialBlocks\Pro\Integrations;

use EssentialBlocks\Pro\Utils\Helper;
use EssentialBlocks\Pro\Core\DynamicTags\Acf\AcfData;
use EssentialBlocks\Integrations\ThirdPartyIntegration;
use EssentialBlocks\Pro\Core\DynamicTags\Post\PostFields;
use EssentialBlocks\Pro\Core\DynamicTags\Site\SiteFields;
use EssentialBlocks\Pro\Core\DynamicTags\HandleTagsResult;

class DynamicFields extends ThirdPartyIntegration {

    public function __construct() {
        $this->add_ajax( [
            'all_fields_by_group' => [
                'callback' => 'all_fields_by_group',
                'public'   => true
            ],
            'acf_fields_by_group' => [
                'callback' => 'acf_fields_by_group',
                'public'   => true
            ],
            'dynamic_field_value' => [
                'callback' => 'get_dynamic_field_value',
                'public'   => true
            ],
            'post_by_id'          => [
                'callback' => 'get_post_by_id',
                'public'   => true
            ]
        ] );
    }

    public function all_fields_by_group( $group_name = 'all' ) {
        $fields  = [];
        $source  = isset( $_POST['source'] ) ? $_POST['source'] : 'current';
        $post_id = isset( $_POST['post_id'] ) ? $_POST['post_id'] : 0;
        $field_type = isset( $_POST['field_type'] ) ? $_POST['field_type'] : "";
		$field_type = $field_type ? explode(',',$field_type) : '';

        $post_type = get_post_type( $post_id );

        if ( $source === 'site' ) {
            //Site
            $site_fields = SiteFields::get_fields();
            if ( is_array( $site_fields ) ) {
                $fields = array_merge( $fields, $site_fields );
            }
        } else {
            //Post
            $post_fields = PostFields::get_fields();
            if ( is_array( $post_fields ) ) {
               $fields = array_merge( $fields, $post_fields );
            }

            //ACF
            $acf_fileds = AcfData::acf_get_fields_by_groups( $post_type );
            if ( is_array( $acf_fileds ) ) {
                $fields = array_merge( $fields, $acf_fileds );
            }
        }

		$filteredArray = $fields;
        
		if(is_array($field_type) && count($field_type) > 0) {
			// $filteredArray = array_values(array_filter($fields, function ($item) use ($field_type) {
			// 	$item['options'] = array_values(array_filter($item['options'], function ($option) use ($field_type) {
			// 		return in_array($option['type'], $field_type);
			// 	}));
			// 	return !empty($item['options']);
			// }));
            $result = array_map(function($section) use ($field_type) {
                $filteredOptions = array_filter($section['options'], function($option) use ($field_type) {
                    return in_array($option['type'], $field_type);
                });
                if (!empty($filteredOptions)) {
                    return [
                        "label" => $section["label"],
                        "options" => array_values($filteredOptions), // Reset array keys
                    ];
                }
                return null;
            }, $filteredArray);

            $filteredArray = array_values(array_filter($result));
		}

		// have to check why is not working
        wp_send_json_success( $filteredArray );
        wp_die();
    }

    /**
     * Function: ACF fields by group
     *
     * @return
     * @since 1.0.0
     */
    public function acf_fields_by_group() {
        if ( ! wp_verify_nonce( $_POST['admin_nonce'], 'eb-pro-admin-nonce' ) ) {
            die( esc_html__( 'Nonce did not match', 'essential-blocks-pro' ) );
        }

        $post_type = 'post';
        if ( isset( $_POST['post_type'] ) && is_string( $_POST['post_type'] ) ) {
            $post_type = $_POST['post_type'];
        }

        $acfFiledsbyGroup = AcfData::acf_get_fields_by_groups( $post_type );

        wp_send_json_success( $acfFiledsbyGroup );
        wp_die();
    }

    /**
     * Ajax callback for get dynamic value from dynamic key
     */
    public function get_dynamic_field_value() {
        if ( isset( $_POST['value'] ) && isset( $_POST['post_id'] ) ) {
            $post_id = $_POST['post_id'];
            $post = get_post( $post_id );
        
            if ( $post && 'publish' === $post->post_status ) {
                $value = HandleTagsResult::get_value_form_dynamic_tag( $_POST['value'], $post_id );
                wp_send_json_success( $value );
            } else {
                wp_send_json_error( array( 'message' => 'The post must be published to proceed.' ) );
            }
        } else {
            wp_send_json_error( array( 'message' => 'Missing required parameters.' ) );
        }
        
        wp_die();
    }

    public function get_post_by_id() {
        if ( ! wp_verify_nonce( $_POST['admin_nonce'], 'eb-pro-admin-nonce' ) ) {
            die( esc_html__( 'Nonce did not match', 'essential-blocks-pro' ) );
        }
        if ( isset( $_POST['post_id'] ) ) {
            $post_id = $_POST["post_id"];
            $post    = get_post( $post_id );
            $object  = (object) [
                'label'  => $post->post_title,
                'value' => $post_id
            ];
            wp_send_json_success( $object );
        } else {
            wp_send_json_error();
        }
        wp_die();
    }
}
