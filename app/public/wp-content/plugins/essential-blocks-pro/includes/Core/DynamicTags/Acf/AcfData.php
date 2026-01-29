<?php
namespace EssentialBlocks\Pro\Core\DynamicTags\Acf;

use EssentialBlocks\Utils\Helper;
use EssentialBlocks\Traits\HasSingletone;

class AcfData {
    use HasSingletone;

    private static $acf_dynamic_tag = ESSENTIAL_BLOCKS_DYNAMIC_TAGS . '/acf/';

    public function __construct() {
        add_filter( 'acf/location/rule_match/post_type', [$this, 'eb_acf_location_rule_match_post_type'], 10, 4 );
        add_filter( 'eb_post_grid_meta_markup', [$this, 'eb_acf_dynamic_posts_meta'], 10, 3 );
        add_filter( 'eb_post_carousel_meta_markup', [$this, 'eb_acf_dynamic_posts_meta'], 10, 3 );
    }

    /**
     * Filter for change acf filter rule based on post type
     * @return boolean
     */
    public function eb_acf_location_rule_match_post_type( $match, $rule, $options, $field_group ) {

        if ( ! isset( $options['post_type'] ) ) {
            return $match;
        }

        $post_type = $options['post_type'];

        if ( $rule['operator'] == "==" ) {
            $match = $post_type == $rule['value'];
        } elseif ( $rule['operator'] == "!=" ) {
            $match = $post_type != $rule['value'];
        }

        return $match;
    }
    /**
     * EB filter for Dynamic Posts ACF Meta HTML Generate
     * @param array $html
     * @param int $post_id
     * @param array $meta
     * @return array
     */
    function eb_acf_dynamic_posts_meta( $html, $post_id, $meta ) {
        $acf_meta = array_filter( $meta, function ( $val ) {
            return str_starts_with( $val, self::$acf_dynamic_tag );
        } );
        if ( is_array( $acf_meta ) && count( $acf_meta ) > 0 ) {
            foreach ( $acf_meta as $meta ) {
                $metaValue = str_replace(ESSENTIAL_BLOCKS_DYNAMIC_TAGS . "/", "",$meta);
                
                $value = self::acf_get_value_from_dynamic_key( $metaValue, $post_id );
                if ( $value ) {
                    $html[$meta] = sprintf(
                        '<span class="ebpg-meta ebpg-dynamic-values ebpg-acf">%1$s</span>',
                        $value
                    );
                }
            }
        }
        return $html;
    }

    /**
     *
     */
    public static function acf_get_value_from_dynamic_key( $key, $post_id ) {
        if ( is_string( $key ) ) {
            $key = explode( "/", $key );
            if ( is_array( $key ) ) {
				$key = $key[count($key) - 2];
                $result = self::acf_get_value_by_key( $key, $post_id );
                if ( is_array( $result ) || is_object( $result ) ) {
                    $result = Helper::recursive_implode_acf( (array) $result, ", " );
                }
                return $result;
            }
        }
        return $key;
    }

    /**
     * Get ACF value by ACF key for Post ID
     * @param string $key
     * @param int $post_id
     * @return string
     */
    public static function acf_get_value_by_key( $key, $post_id ) {
        if ( ! function_exists( 'get_field' ) ) {
            return "";
        }

        $value = get_field( $key, $post_id );
        if ( $value ) {
            if ( is_array( $value ) ) {
                if ( isset( $value['value'] ) ) {
                    $value = $value['value'];
                } else if ( isset( $value['url'] ) ) {
                    $value = $value['url'];
                }
            }
        }
        if ( ! $value ) {
            return '';
        }
        return $value;
    }

    /**
     * ACF fields by Groups
     * @param string $post_type
     * @return array
     */
    public static function acf_get_fields_by_groups() {

        $acf_groups = self::acf_get_groups();

        $groups = [];

        foreach ( $acf_groups as $acf_group ) {
            $options = self::acf_get_fields_by_group( $acf_group['ID'] );

            $groups[] = [
                'label'   => 'ACF: ' . $acf_group['title'],
                'options' => $options
            ];
        }

        return $groups;
    }

    /**
     * ACF Groups
     * @param string $post_type
     * @return array
     */
    public static function acf_get_groups() {
        // ACF >= 5.0.0
        if ( function_exists( 'acf_get_field_groups' ) ) {
            return acf_get_field_groups();
        }
        return [];
    }

    /**
     * ACF fields by Group ID
     * @param int $group_id
     * @return array
     */
    public static function acf_get_fields_by_group( $group_id ) {
        if ( ! $group_id ) {
            return [];
        }

        // ACF >= 5.0.0
        if ( ! function_exists( 'acf_get_fields' ) ) {
            return [];
        }

        $fields = acf_get_fields( $group_id );

        if ( ! is_array( $fields ) ) {
            return [];
        }

        $options = [];

        foreach ( $fields as $handle => $field ) {
            // $key           = self::$acf_dynamic_tag . $group_id . "/" . $field['name'];
            $key           = 'acf/' . $group_id . "/" . $field['name'];
            $options[$handle]['label'] = "ACF: " . $field['label'];
            $options[$handle]['value'] = $key;
            $options[$handle]['type'] = $field['type'];
        }

        if ( empty( $options ) ) {
            return [];
        }

        // if ( 1 === count( $options ) ) {
        //     $options = [-1 => ' -- '] + $options;
        // }

        return $options;
    }
}
