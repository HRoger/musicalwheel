<?php
namespace EssentialBlocks\Pro\Core\DynamicTags;

use EssentialBlocks\Pro\Utils\Helper;
use EssentialBlocks\Traits\HasSingletone;
use EssentialBlocks\Pro\Core\DynamicTags\Acf\AcfData;
use EssentialBlocks\Pro\Core\DynamicTags\Post\PostFields;
use EssentialBlocks\Pro\Core\DynamicTags\Site\SiteFields;

class HandleTagsResult
{
    use HasSingletone;

    public function __construct()
    {
        add_filter( 'render_block', [ $this, 'handle_dynamic_tag_result' ], 10, 2 );
        add_filter( 'eb_dynamic_tag_value', [ $this, 'eb_dynamic_tag_value_result' ], 10, 3 );
        add_filter( 'eb_dynamic_tag_form_field_value', [ $this, 'eb_dynamic_tag_form_field_value_result' ], 10, 4 );
    }

    public function eb_dynamic_tag_value_result( $attrValue, $final_content, $return_value = false )
    {

        // $pattern = "/\b" . ESSENTIAL_BLOCKS_DYNAMIC_TAGS . "\/[\w\/\-\_]+\b/";
        $pattern = "/^" . ESSENTIAL_BLOCKS_DYNAMIC_TAGS . "\/[\w\/\-_]+\/settings=.+/";
        // Find matches
        preg_match_all( $pattern, $attrValue, $matches );
        // Display the matches
        if ( ! empty( $matches[ 0 ] ) ) {
            foreach ( $matches[ 0 ] as $match ) {
                $value = self::get_value_form_dynamic_tag( $match );
                if ( is_string( $value ) ) {
                    if ( $return_value ) {return $value;}
                    $final_content = str_replace( $match, $value, $final_content );
                }
            }
        }

        return $final_content;
    }

    // select field
    public function eb_dynamic_tag_form_field_value_result( $attrValue, $final_content, $return_value = false )
    {
        // $pattern = "/\b" . ESSENTIAL_BLOCKS_DYNAMIC_TAGS . "\/[\w\/\-\_]+\b/";
        $pattern = "/^" . ESSENTIAL_BLOCKS_DYNAMIC_TAGS . "\/[\w\/\-_]+\/settings=.+/";
        // Find matches
        preg_match_all( $pattern, $attrValue, $matches );
        // Display the matches
        if ( ! empty( $matches[ 0 ] ) ) {
            foreach ( $matches[ 0 ] as $match ) {
                $value = self::get_value_form_dynamic_tag( $match );
                if ( is_string( $value ) ) {
                    $final_content = Helper::replace_options_in_content( $final_content, Helper::parse_options_from_string( $value ) );
                }
            }
        }

        return $final_content;
    }

    public function handle_dynamic_tag_result( $block_content, $block )
    {
        $final_content = $block_content;

        if ( isset( $block[ 'blockName' ] ) && str_contains( $block[ 'blockName' ], 'essential-blocks/' ) ) {
            if ( isset( $block[ 'attrs' ] ) && is_array( $block[ 'attrs' ] ) ) {
                foreach ( $block[ 'attrs' ] as $index => $attrValue ) {
                    if ( ( 'dynamicOptionType' === $index ) && $attrValue === 'dynamic' && isset( $block[ 'attrs' ][ 'dynamicValue' ] ) ) {
                        $final_content = apply_filters( 'eb_dynamic_tag_form_field_value', $block[ 'attrs' ][ 'dynamicValue' ], $final_content, false );
                    } else if ( is_string( $attrValue ) ) {
                        $final_content = apply_filters( 'eb_dynamic_tag_value', $attrValue, $final_content, false );
                    } else if ( is_array( $attrValue ) ) {
                        $final_content = $this->process_dynamic_attrs( $attrValue, $final_content );
                    }
                }
            }
        }
        return $final_content;
    }

    /**
     * Process attrs value recursively for array and string too
     */
    private function process_dynamic_attrs( $attrs, $current_content )
    {
        foreach ( $attrs as $key => $value ) {
            if ( is_array( $value ) ) {
                // Recursively process nested arrays and update content
                $current_content = $this->process_dynamic_attrs( $value, $current_content );
            } elseif ( is_string( $value ) ) {
                // Apply a filter or modify string values
                $current_content = apply_filters( 'eb_dynamic_tag_value', $value, $current_content, false );
            }
        }

        return $current_content;
    }

    public static function get_value_form_dynamic_tag( $tag, $post_id = false )
    {
        if ( ! is_string( $tag ) ) {
            return $tag;
        }

        $keys = explode( "/", $tag );
        if ( is_array( $keys ) && count( $keys ) > 0 ) {
            //First array should be ESSENTIAL_BLOCKS_DYNAMIC_TAGS
            if ( $keys[ 0 ] !== ESSENTIAL_BLOCKS_DYNAMIC_TAGS ) {
                return $tag;
            }

            //Second array should be either "current || other || site || query || terms"
            $isSite = $isQuery = $isTerms = $isTags = false;

            switch ( $keys[ 1 ] ) {
                case "current":
                    if ( ! $post_id ) {
                        global $post;
                        $post_id = isset( $post->ID ) ? $post->ID : get_the_ID();
                    }
                    break;
                case "other":
                    $post_id = (int) ( $keys[ 2 ] );
                    break;
                case "site":
                    $isSite = true;
                    break;
                case "query":
                    $isQuery = true;
                    break;
                case "terms":
                    $isTerms = true;
                    break;
                case "tags":
                    $isTags = true;
                    break;
                default:
                    return $tag;
            }

            $itemsToImplode = array_slice( $keys, 3 );
            // Implode array items with "/"
            $dynamic_key = implode( "/", $itemsToImplode );
            if ( $isSite ) {
                $dynamic_key = explode( "/", $dynamic_key );
                $value       = SiteFields::get_values( str_replace( 'site/', '', $dynamic_key[ 0 ] ) );
            } else if ( $isQuery ) {
                $value = self::get_value_for_query( $keys );
            } else if ( $isTerms || $isTags ) {
                $value = self::get_value_for_terms( $keys );
            } else {
                $value = self::get_value_for_post( $dynamic_key, $post_id );
            }

            $settingsData = explode( "=", end( $keys ) );
            if ( 'settings' === $settingsData[ 0 ] ) {
                $value = self::get_value_from_settings_data( $settingsData, $value );
            }

            return is_string( $value ) ? $value : $tag;
        }
    }

    public static function get_value_for_post( $tag, $post_id )
    {
        $keys  = explode( "/", $tag );
        $value = false;
        if ( is_array( $keys ) && count( $keys ) > 0 ) {
            switch ( $keys[ 0 ] ) {
                case 'acf':
                    $value = AcfData::acf_get_value_from_dynamic_key( $tag, $post_id );
                    break;
                case 'post':
                    $value = PostFields::get_values( $keys[ 1 ], $post_id );
                    break;
                case 'site':
                    $value = SiteFields::get_values( $keys[ 1 ] );
                    break;
                default:
                    $value = false;
            }
            $value = strval( $value );
        }
        return $value;
    }

    /**
     * Change the value according to the settings data
     */
    public static function get_value_from_settings_data( $settings, $value )
    {
        $jsonData = json_decode( $settings[ 1 ] );
        if ( is_array( $jsonData ) && in_array( 'img_tag', $jsonData ) ) {
            $value = wp_sprintf( '<img src="%1$s" class="eb-dynamic-tags-image" />', $value );
        } else if ( is_array( $jsonData ) && in_array( 'url', $jsonData ) ) {
            $newTab = in_array( 'new_tab', $jsonData ) ? '_blank' : '_self';
            $value  = wp_sprintf( '<a href="%1$s" target="%2$s">%3$s</a>', $value, $newTab, $value );
        }

        return $value;
    }

    /**
     * get_value_for_query
     */
    public static function get_value_for_query( $keys )
    {

        if ( is_array( $keys ) && count( $keys ) > 2 ) {
            $settingsValue = substr( $keys[ 2 ], strpos( $keys[ 2 ], '=' ) + 1 );
            $settingsArray = json_decode( stripslashes( $settingsValue ), true );
            $args          = [  ];

            if ( is_array( $settingsArray ) ) {
                $args = [
                    'posts_per_page' => isset( $settingsArray[ 'perPage' ] ) ? (int) $settingsArray[ 'perPage' ] : 5,
                    'order'          => isset( $settingsArray[ 'order' ] ) ? $settingsArray[ 'order' ] : 'desc',
                    'orderby'        => isset( $settingsArray[ 'orderBy' ] ) ? $settingsArray[ 'orderBy' ] : "date",
                    'post_status'    => self::get_value_arr_from_json_string( $settingsArray[ 'postStatus' ] ) ? self::get_value_arr_from_json_string( $settingsArray[ 'postStatus' ] ) : '',
                    'post_type'      => self::get_value_arr_from_json_string( $settingsArray[ 'postTypes' ] ) ? self::get_value_arr_from_json_string( $settingsArray[ 'postTypes' ] ) : ''
                 ];
            }
            $results   = [  ];
            $get_posts = get_posts( $args );

            if ( is_array( $get_posts ) && count( $get_posts ) > 0 ) {
                foreach ( $get_posts as $key => $post ) {
                    $results[ $key ][ 'id' ]    = $post->ID;
                    $results[ $key ][ 'title' ] = $post->post_title;
                }
            }

            $resultArray = [  ];
            $separator   = isset( $settingsArray[ 'separator' ] ) ? $settingsArray[ 'separator' ] : 'new_line';
            $format      = isset( $settingsArray[ 'format' ] ) ? $settingsArray[ 'format' ] : 'title';
            foreach ( $results as $item ) {
                switch ( $format ) {
                    case 'title':
                        $resultArray[  ] = $item[ 'title' ];
                        break;
                    case 'title_id':
                        $resultArray[  ] = $item[ 'title' ] . '|' . $item[ 'id' ];
                        break;
                    case 'id':
                        $resultArray[  ] = $item[ 'id' ];
                        break;
                    default:
                        // Handle invalid flag
                        break;
                }
            }

            // Convert the array to a string using the specified separator
            if ( $separator === 'new_line' ) {
                $resultString = implode( "\n", $resultArray );
            } elseif ( $separator === 'comma' ) {
                $resultString = implode( ', ', $resultArray );
            } elseif ( $separator === 'line_break' ) {
                $resultString = implode( "<br>", $resultArray );
            } else {
                // Handle invalid separator
                $resultString = "Invalid separator";
            }

            return $resultString;
        }

        return "";
    }

    /**
     * get_value_for_query
     */
    public static function get_value_for_terms( $keys )
    {
        if ( is_array( $keys ) && count( $keys ) > 2 ) {
            $settingsValue = substr( $keys[ 2 ], strpos( $keys[ 2 ], '=' ) + 1 );
            $settingsArray = json_decode( stripslashes( $settingsValue ), true );
            $args          = [  ];

            if ( is_array( $settingsArray ) ) {
                $args = [
                    'taxonomy'   => isset( $settingsArray[ 'taxonomy' ] ) ? $settingsArray[ 'taxonomy' ] : '',
                    'number'     => isset( $settingsArray[ 'perPage' ] ) ? (int) $settingsArray[ 'perPage' ] : 5,
                    'order'      => isset( $settingsArray[ 'order' ] ) ? $settingsArray[ 'order' ] : 'desc',
                    'orderby'    => isset( $settingsArray[ 'orderBy' ] ) ? $settingsArray[ 'orderBy' ] : "date",
                    'hide_empty' => isset( $settingsArray[ 'hideEmpty' ] ) ? $settingsArray[ 'hideEmpty' ] : false,
                    'exclude'    => isset( $settingsArray[ 'excludeTerms' ] ) && is_array( $settingsArray[ 'excludeTerms' ] ) && ! empty( $settingsArray[ 'excludeTerms' ] ) ? array_column( $settingsArray[ 'excludeTerms' ], 'value' ) : [  ]
                 ];
            }

            $results   = [  ];
            $get_terms = get_terms( $args );

            if ( is_array( $get_terms ) && count( $get_terms ) > 0 ) {
                foreach ( $get_terms as $key => $term ) {
                    $results[ $key ][ 'id' ]    = $term->term_id;
                    $results[ $key ][ 'title' ] = $term->name;
                }
            }

            $resultArray = [  ];
            $separator   = isset( $settingsArray[ 'separator' ] ) ? $settingsArray[ 'separator' ] : 'new_line';
            $format      = isset( $settingsArray[ 'format' ] ) ? $settingsArray[ 'format' ] : 'title';
            foreach ( $results as $item ) {
                switch ( $format ) {
                    case 'title':
                        $resultArray[  ] = $item[ 'title' ];
                        break;
                    case 'title_id':
                        $resultArray[  ] = $item[ 'title' ] . '|' . $item[ 'id' ];
                        break;
                    case 'id':
                        $resultArray[  ] = $item[ 'id' ];
                        break;
                    default:
                        // Handle invalid flag
                        break;
                }
            }

            // Convert the array to a string using the specified separator
            if ( $separator === 'new_line' ) {
                $resultString = implode( "\n", $resultArray );
            } elseif ( $separator === 'comma' ) {
                $resultString = implode( ', ', $resultArray );
            } elseif ( $separator === 'line_break' ) {
                $resultString = implode( "<br>", $resultArray );
            } else {
                // Handle invalid separator
                $resultString = "Invalid separator";
            }

            return $resultString;
        }
        return "";
    }

    public static function get_value_arr_from_json_string( $arrayData )
    {
        if ( is_array( $arrayData ) && ! empty( $arrayData ) ) {
            $valuesArray = array_column( $arrayData, 'value' );
            return $valuesArray;
        }
        return false;
    }
}
