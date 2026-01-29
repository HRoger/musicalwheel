<?php
namespace EssentialBlocks\Pro\Integrations;

use Error;
use EssentialBlocks\Integrations\ThirdPartyIntegration;

class AdvSearch extends ThirdPartyIntegration {
    /**
     * Base URL for Adv Search
     * @var string
     */

    public function __construct() {
        $this->add_ajax( [
            'adv_search_result_content'   => [
                'callback' => 'search_result',
                'public'   => true
            ],
            'adv_search_loadmore_content' => [
                'callback' => 'loadmore_result',
                'public'   => true
            ],
            'adv_search_popular_keywords' => [
                'callback' => 'ajax_popular_keywords',
                'public'   => true
            ]
        ] );
    }

    /**
     * Search query
     */
    public function search_result() {
        if ( ! wp_verify_nonce( $_POST['adv_search_nonce'], 'eb-adv-search-nonce' ) ) {
            die( esc_html__( 'Nonce did not match', 'essential-blocks-pro' ) );
        }

        $search_input = isset( $_POST['searchText'] ) ? sanitize_text_field( $_POST['searchText'] ) : '';
        $search_input = preg_replace( '/[^A-Za-z0-9_\- ][]]/', '', strtolower( $search_input ) );

        $search_post_type = $_POST['postType'] == 'all' ? '' : sanitize_text_field( $_POST['postType'] );
        $search_tax       = isset( $_POST['selectedTaxonomy'] ) ? $_POST['selectedTaxonomy'] : '';
        $search_cat       = isset( $_POST['catName'] ) ? wp_strip_all_tags( $_POST['catName'] ) : '';
        $search_exclude_cat = isset( $_POST['excludedTaxonomyItems'] ) ? $_POST['excludedTaxonomyItems'] : '';
        $search_limit     = ! empty( $_POST['initialValue'] ) ? intval( $_POST['initialValue'] ) : -1;

        $args = [
            'post_status'      => 'publish',
            'posts_per_page'   => $search_limit,
            'suppress_filters' => true,
            's'                => $search_input
        ];

        if ( ! empty( $search_post_type ) ) {
            $args['post_type'] = $search_post_type;
        }

        // todo: check 1. show cat 2. taxonomy type
        if ( ! empty( $search_tax ) && $search_cat ) {
            $args['tax_query'][] = [
                'taxonomy'         => $search_tax,
                'field'            => 'slug',
                'terms'            => $search_cat,
                'operator'         => 'IN',
                'include_children' => true
            ];
        }

        if ( ! empty( $search_tax ) && $search_exclude_cat ) {
            $exclude_terms = json_decode(stripslashes($search_exclude_cat),true);
            $exclude_terms = array_column($exclude_terms, 'value');
            $args['tax_query'][] = [
                'taxonomy'         => $search_tax,
                'field'            => 'slug',
                'terms'            => $exclude_terms,
                'operator'         => 'NOT IN',
                'include_children' => true
            ];
        }

        $query = new \WP_Query( $args );

        $response = [
            'post_lists' => "",
            'post_count' => 0
        ];

        $post_lists = '';
        if ( $query->have_posts() ) {
            while ( $query->have_posts() ) {
                $query->the_post();
                $post_lists .= sprintf( '<a href="%s" class="eb-adv-search-content-item">', esc_url( get_the_permalink() ) );
                if ( $_POST['displayContentImage'] === "true" ) {
                    $image = has_post_thumbnail() ? wp_get_attachment_image_src( get_post_thumbnail_id( get_the_ID() ), 'single-post-thumbnail' ) : ( get_post_type() == 'attachment' ? wp_get_attachment_image_src( get_the_ID(), 'thumbnail', true ) : '' );
                    $post_lists .= is_array( $image ) ? sprintf( '<div class="item-thumb"><img src="%s"></div>', current( $image ) ) : '';
                }
                $title = '<h4>' . $this->highlight_search_keyword( strip_tags( get_the_title() ), ucwords( $search_input ) ) . '</h4>';

                $content = '<p>' . $this->highlight_search_keyword( wp_trim_words( strip_shortcodes( get_the_excerpt() ), 30 ), $search_input ) . '</p>';

                $post_lists .= sprintf( '<div class="item-content">%s %s</div>', $title, $content );
                $post_lists .= '</a>';
            }
            wp_reset_postdata();

            $response['post_lists'] = $post_lists;
            $response['post_count'] = $query->found_posts;
            $response['page_count'] = $query->max_num_pages;
        }

        // popular keywords
        $show_popular_keyword         = ! empty( $_POST['showPopularKeywords'] );
        $popular_keywords_rank_length = isset( $_POST['popularKeywordsRankLength'] ) ? $_POST['popularKeywordsRankLength'] : 4;

        if ( strlen( $search_input ) >= $popular_keywords_rank_length && $show_popular_keyword ) {
            $is_found         = ! empty( $response['post_lists'] );
            $popular_keywords = $this->manage_popular_keyword( $search_input, $show_popular_keyword, $is_found );
            if ( $show_popular_keyword ) {
                $response['popular_keyword'] = $popular_keywords;
            }
        }

        wp_send_json_success( $response );
    }

    public function highlight_search_keyword( $content, $search ) {
        $search_keys = implode( '|', explode( ' ', $search ) );
        $content     = preg_replace( '/(' . $search_keys . ')/iu', "<strong>$1</strong>", $content );

        return $content;
    }

    /**
     * loadmore_result
     */
    public function loadmore_result() {
        if ( ! wp_verify_nonce( $_POST['adv_search_nonce'], 'eb-adv-search-nonce' ) ) {
            die( esc_html__( 'Nonce did not match', 'essential-blocks-pro' ) );
        }

        $search_input = isset( $_POST['searchText'] ) ? sanitize_text_field( $_POST['searchText'] ) : '';
        $search_input = preg_replace( '/[^A-Za-z0-9_\- ][]]/', '', strtolower( $search_input ) );

        $search_post_type = $_POST['postType'] == 'all' ? '' : sanitize_text_field( $_POST['postType'] );
        $search_tax       = isset( $_POST['selectedTaxonomy'] ) ? $_POST['selectedTaxonomy'] : '';
        $search_exclude_cat = isset( $_POST['excludedTaxonomyItems'] ) ? $_POST['excludedTaxonomyItems'] : '';
        $search_cat       = isset( $_POST['catName'] ) ? wp_strip_all_tags( $_POST['catName'] ) : '';
        $search_limit     = ! empty( $_POST['initialValue'] ) ? intval( $_POST['initialValue'] ) : -1;
        $paged            = ! empty( $_POST['currentPage'] ) ? intval( $_POST['currentPage'] ) : 1;
        // $showLoadMore     = $_POST['showLoadMore'];

        $args = [
            'post_status'      => 'publish',
            'posts_per_page'   => $search_limit,
            'suppress_filters' => true,
            's'                => $search_input
        ];

        if ( ! empty( $search_post_type ) ) {
            $args['post_type'] = $search_post_type;
        }

        // todo: check 1. show cat 2. taxonomy type
        if ( ! empty( $search_tax ) && $search_cat ) {
            $args['tax_query'][] = [
                'taxonomy'         => $search_tax,
                'field'            => 'slug',
                'terms'            => $search_cat,
                'operator'         => 'AND',
                'include_children' => true
            ];
        }

        if ( ! empty( $search_tax ) && $search_exclude_cat ) {
            $exclude_terms = json_decode(stripslashes($search_exclude_cat),true);
            $exclude_terms = array_column($exclude_terms, 'value');
            $args['tax_query'][] = [
                'taxonomy'         => $search_tax,
                'field'            => 'slug',
                'terms'            => $exclude_terms,
                'operator'         => 'NOT IN',
                'include_children' => true
            ];
        }

        // if ( $showLoadMore ) {
        $args['paged'] = $paged;
        // }

        $query = new \WP_Query( $args );

        $response = [
            'post_lists' => "",
            'post_count' => 0
        ];

        $post_lists = '';
        if ( $query->have_posts() ) {
            while ( $query->have_posts() ) {
                $query->the_post();
                $post_lists .= sprintf( '<a href="%s" class="eb-adv-search-content-item">', esc_url( get_the_permalink() ) );
                if ( $_POST['displayContentImage'] === "true" ) {
                    $image = has_post_thumbnail() ? wp_get_attachment_image_src( get_post_thumbnail_id( get_the_ID() ), 'single-post-thumbnail' ) : ( get_post_type() == 'attachment' ? wp_get_attachment_image_src( get_the_ID(), 'thumbnail', true ) : '' );
                    $post_lists .= is_array( $image ) ? sprintf( '<div class="item-thumb"><img src="%s"></div>', current( $image ) ) : '';
                }
                $title = '<h4>' . $this->highlight_search_keyword( strip_tags( get_the_title() ), ucwords( $search_input ) ) . '</h4>';

                $content = '<p>' . $this->highlight_search_keyword( wp_trim_words( strip_shortcodes( get_the_excerpt() ), 30 ), $search_input ) . '</p>';

                $post_lists .= sprintf( '<div class="item-content">%s %s</div>', $title, $content );
                $post_lists .= '</a>';
            }
            wp_reset_postdata();

            $response['post_lists'] = $post_lists;
            $response['post_count'] = $query->found_posts;
        }

        wp_send_json_success( $response );
    }

    /**
     * manage_popular_keyword
     * @param string $key
     * @param bool $status
     * @param bool $update
     * @return string|null
     */
    public function manage_popular_keyword( $key, $status = false, $is_found = true ) {
        global $wpdb;
        // 1. check keyword exist in table
        $search = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT *
                FROM " . ESSENTIAL_BLOCKS_SEARCH_KEYWORD_TABLE . "
                WHERE keyword = %s",
                $key
            )
        );

        // keyword exist
        if ( ! empty( $search ) ) {
            $count = $search[0]->count + 1;

            $wpdb->query(
                $wpdb->prepare(
                    "UPDATE " . ESSENTIAL_BLOCKS_SEARCH_KEYWORD_TABLE . "
                        SET count=%d
                        WHERE keyword = %s",
                    $count, $key
                )
            );
        } else {
            // keyword data found check
            if ( $is_found ) {
                $is_found = 1;
            } else {
                $is_found = 0;
            }

            // insert new key
            $insert = $wpdb->query(
                $wpdb->prepare(
                    "INSERT INTO " . ESSENTIAL_BLOCKS_SEARCH_KEYWORD_TABLE . "
                    ( keyword, count, is_found)
                    VALUES ( %s, %d, %d )",
                    [
                        $key,
                        1,
                        $is_found
                    ]
                )
            );
        }

        // fetch data
        if ( $status ) {
            $lists = $this->get_popular_keywords();
            return $lists;
        }
        return null;
    }

    /**
     * ajax_popular_keywords
     * @return array|null
     */
    Public function ajax_popular_keywords() {
        if ( ! wp_verify_nonce( $_POST['admin_nonce'], 'eb-pro-admin-nonce' ) ) {
            die( esc_html__( 'Nonce did not match', 'essential-blocks-pro' ) );
        }

        $lists                        = $this->get_popular_keywords();
        $response['popular_keywords'] = $lists;
        wp_send_json_success( $response );
    }

    /**
     * get_popular_keywords
     * @return array|null
     */
    Public function get_popular_keywords() {
        $rank                 = ! empty( $_POST['popularKeywordsRank'] ) ? intval( $_POST['popularKeywordsRank'] ) : 5;
        $popularKeywordslimit = ! empty( $_POST['popularKeywordslimit'] ) ? intval( $_POST['popularKeywordslimit'] ) : 5;

        global $wpdb;
        $popular_keywords = $wpdb->get_results(
            $wpdb->prepare(
                "
                    SELECT keyword, count, is_found
                    From " . ESSENTIAL_BLOCKS_SEARCH_KEYWORD_TABLE . "
                    WHERE count >= %d && is_found = %d
                    ORDER BY count DESC LIMIT %d
                ", $rank, 1, $popularKeywordslimit )
        );

        $lists = null;

        if ( ! empty( $popular_keywords ) ) {
            arsort( $popular_keywords );
            foreach ( $popular_keywords as $item ) {
                $keywords = ucfirst( str_replace( '_', ' ', $item->keyword ) );
                $lists .= sprintf( '<a href="javascript:void(0)" data-keyword="%1$s" class="eb-popular-keyword-item">%2$s</a>', $item->keyword, $keywords );
            }
        }

        return $lists;
    }
}