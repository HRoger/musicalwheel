<?php
namespace EssentialBlocks\Pro\Integrations;

use EssentialBlocks\Pro\Utils\Helper;
use EssentialBlocks\Utils\QueryHelper;
use EssentialBlocks\Integrations\ThirdPartyIntegration;

class PostGridSearch extends ThirdPartyIntegration {
    /**
     * Base URL for Post Grid Search
     * @var string
     */

    public function __construct() {
        $this->add_ajax( [
            'post_grid_search_result_content' => [
                'callback' => 'search_result',
                'public'   => true
            ]
        ] );
    }

    /**
     * Search query
     */
    public function search_result() {
        if ( ! wp_verify_nonce( $_POST['post_grid_search_nonce'], 'eb-post-grid-search-nonce' ) ) {
            die( __( 'Nonce did not match', 'essential-blocks-pro' ) );
        }

        $search_input       = isset( $_POST['searchKey'] ) ? sanitize_text_field( $_POST['searchKey'] ) : '';
        $search_input       = preg_replace( '/[^A-Za-z0-9_\- ][]]/', '', strtolower( $search_input ) );
        $query              = json_decode( stripslashes( $_POST['query_data'] ), true );
        $attributes         = json_decode( stripslashes( $_POST['attributes'] ), true );
        $query['s']         = $search_input;
        $query_param_string = isset( $_POST['queryParamString'] ) ? sanitize_text_field( $_POST['queryParamString'] ) : '';
        $request            = [];
        $value              = ltrim( $query_param_string, '&' );
        parse_str( $value, $request );

        if ( isset( $request["taxonomy"] ) && isset( $request["category"] ) ) {
            $category  = get_term_by( 'slug', sanitize_text_field( $request["category"] ), sanitize_text_field( $request["taxonomy"] ) );
            $catString = json_encode( [[
                "label" => $category->name,
                "value" => $category->term_id
            ]] );
            $filterQuery = [
                $request["taxonomy"] => [
                    "name"  => sanitize_text_field( $request["category"] ),
                    "slug"  => sanitize_text_field( $request["category"] ),
                    "value" => $catString
                ]
            ];
            $query["taxonomies"] = $filterQuery;
        }

        $posts = QueryHelper::get_posts( $query, true );

        $post_lists = '';
        if ( $posts->have_posts() ) {
            while ( $posts->have_posts() ) {
                $posts->the_post();
                $post_lists .= sprintf( '<a href="%s" class="eb-post-grid-search-content-item">', esc_url( get_the_permalink() ) );
                // if ( $_POST['displayContentImage'] === "true" ) {
                $image = has_post_thumbnail() ? wp_get_attachment_image_src( get_post_thumbnail_id( get_the_ID() ), 'single-post-thumbnail' ) : ( get_post_type() == 'attachment' ? wp_get_attachment_image_src( get_the_ID(), 'thumbnail', true ) : '' );
                $post_lists .= is_array( $image ) ? sprintf( '<div class="eb-post-grid-search-item-thumb"><img src="%s"></div>', current( $image ) ) : '';
                // }
                $title = '<h4>' . Helper::highlight_search_keyword( strip_tags( get_the_title() ), ucwords( $search_input ) ) . '</h4>';

                $post_lists .= sprintf( '<div class="eb-post-grid-search-item-content">%s</div>', $title );
                $post_lists .= '</a>';
            }
            wp_reset_postdata();
        }

        wp_send_json_success( $post_lists );
    }
}
