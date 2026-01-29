<?php

namespace EssentialBlocks\Pro\Integrations;

use EssentialBlocks\Integrations\ThirdPartyIntegration;

class LoopPagination extends ThirdPartyIntegration
{
    public function __construct()
    {
        $this->add_ajax([
            'eb_loop_pagination_load_more' => [
                'callback' => 'load_more_callback',
                'public' => true
            ],
            'eb_loop_pagination_infinite_scroll' => [
                'callback' => 'infinite_scroll_callback',
                'public' => true
            ],
            'eb_loop_pagination_numbered' => [
                'callback' => 'numbered_pagination_callback',
                'public' => true
            ]
        ]);
    }

    /**
     * Handle Load More AJAX request
     */
    public function load_more_callback()
    {
        // Verify nonce
        if (!wp_verify_nonce(sanitize_key($_POST['nonce']), 'eb_loop_pagination_nonce')) {
            wp_send_json_error(['message' => __('Security check failed', 'essential-blocks-pro')]);
        }

        $page = isset($_POST['page']) ? intval($_POST['page']) : 1;
        $query_data = isset($_POST['queryData']) ? json_decode(wp_unslash($_POST['queryData']), true) : [];
        $query_id = isset($_POST['queryId']) ? sanitize_text_field($_POST['queryId']) : '';
        $block_id = isset($_POST['blockId']) ? sanitize_text_field($_POST['blockId']) : '';

        if (empty($query_data)) {
            wp_send_json_error(['message' => __('Invalid query data', 'essential-blocks-pro')]);
        }

        // Build query arguments
        $query_args = $this->build_query_args($query_data, $page);
        
        // Execute query
        $query = new \WP_Query($query_args);

        if (!$query->have_posts()) {
            wp_send_json_error(['message' => __('No more posts to load', 'essential-blocks-pro')]);
        }

        // Generate HTML for new posts
        $html = $this->generate_posts_html($query, $query_id, $block_id);

        // Prepare response
        $response = [
            'html' => $html,
            'hasMore' => $page < $query->max_num_pages,
            'nextPage' => $page + 1,
            'totalPages' => $query->max_num_pages,
            'currentPage' => $page
        ];

        wp_reset_postdata();
        wp_send_json_success($response);
    }

    /**
     * Handle Infinite Scroll AJAX request
     */
    public function infinite_scroll_callback()
    {
        // Use the same logic as load more
        $this->load_more_callback();
    }

    /**
     * Handle Numbered Pagination AJAX request
     */
    public function numbered_pagination_callback()
    {
        // Verify nonce
        if (!wp_verify_nonce(sanitize_key($_POST['nonce']), 'eb_loop_pagination_nonce')) {
            wp_send_json_error(['message' => __('Security check failed', 'essential-blocks-pro')]);
        }

        $page = isset($_POST['page']) ? intval($_POST['page']) : 1;
        $query_data = isset($_POST['queryData']) ? json_decode(wp_unslash($_POST['queryData']), true) : [];
        $query_id = isset($_POST['queryId']) ? sanitize_text_field($_POST['queryId']) : '';
        $block_id = isset($_POST['blockId']) ? sanitize_text_field($_POST['blockId']) : '';

        if (empty($query_data)) {
            wp_send_json_error(['message' => __('Invalid query data', 'essential-blocks-pro')]);
        }

        // Build query arguments
        $query_args = $this->build_query_args($query_data, $page);
        
        // Execute query
        $query = new \WP_Query($query_args);

        if (!$query->have_posts()) {
            wp_send_json_error(['message' => __('No posts found', 'essential-blocks-pro')]);
        }

        // Generate HTML for posts
        $html = $this->generate_posts_html($query, $query_id, $block_id);

        // Prepare response
        $response = [
            'html' => $html,
            'currentPage' => $page,
            'totalPages' => $query->max_num_pages
        ];

        wp_reset_postdata();
        wp_send_json_success($response);
    }

    /**
     * Build query arguments from Loop Builder data
     *
     * @param array $query_data Query data from Loop Builder
     * @param int $page Current page number
     * @return array Query arguments
     */
    private function build_query_args($query_data, $page = 1)
    {
        $query_args = [
            'post_type' => $query_data['post_type'] ?? 'post',
            'posts_per_page' => $query_data['posts_per_page'] ?? 6,
            'orderby' => $query_data['orderby'] ?? 'date',
            'order' => $query_data['order'] ?? 'desc',
            'post_status' => 'publish',
            'paged' => $page,
        ];

        // Handle include/exclude IDs
        if (!empty($query_data['include_ids'])) {
            $include_array = array_map('trim', explode(',', $query_data['include_ids']));
            $include_array = array_filter($include_array, 'is_numeric');
            if (!empty($include_array)) {
                $query_args['post__in'] = $include_array;
            }
        }

        if (!empty($query_data['exclude_ids'])) {
            $exclude_array = array_map('trim', explode(',', $query_data['exclude_ids']));
            $exclude_array = array_filter($exclude_array, 'is_numeric');
            if (!empty($exclude_array)) {
                $query_args['post__not_in'] = $exclude_array;
            }
        }

        // Handle sticky posts
        if (!($query_data['sticky_posts'] ?? false)) {
            $query_args['ignore_sticky_posts'] = true;
        }

        // Handle taxonomy filters
        if (!empty($query_data['taxonomy_filters'])) {
            $tax_query = [];
            foreach ($query_data['taxonomy_filters'] as $taxonomy => $terms) {
                if (!empty($terms)) {
                    $tax_query[] = [
                        'taxonomy' => $taxonomy,
                        'field' => 'term_id',
                        'terms' => is_array($terms) ? $terms : [$terms],
                    ];
                }
            }
            if (!empty($tax_query)) {
                $query_args['tax_query'] = $tax_query;
            }
        }

        // Handle meta query
        if (!empty($query_data['meta_query'])) {
            $query_args['meta_query'] = $query_data['meta_query'];
        }

        // Handle date query
        if (!empty($query_data['date_query'])) {
            $query_args['date_query'] = $query_data['date_query'];
        }

        // Handle author IDs
        if (!empty($query_data['author_ids'])) {
            $author_ids = is_array($query_data['author_ids']) ? $query_data['author_ids'] : [$query_data['author_ids']];
            $query_args['author__in'] = $author_ids;
        }

        return $query_args;
    }

    /**
     * Generate HTML for posts using Loop Builder template
     *
     * @param \WP_Query $query The query object
     * @param string $query_id Query ID from Loop Builder
     * @param string $block_id Block ID
     * @return string Generated HTML
     */
    private function generate_posts_html($query, $query_id, $block_id)
    {
        if (!$query->have_posts()) {
            return '';
        }

        ob_start();

        while ($query->have_posts()) {
            $query->the_post();
            $current_post_id = get_the_ID();
            $current_post_type = get_post_type();

            ?>
            <div class="eb-loop-item" data-post-id="<?php echo esc_attr($current_post_id); ?>">
                <?php
                // Create context for this post
                $context = [
                    'postId' => $current_post_id,
                    'postType' => $current_post_type,
                    'essential-blocks/postId' => $current_post_id,
                    'essential-blocks/postType' => $current_post_type,
                    'essential-blocks/queryId' => $query_id,
                    'essential-blocks/isLoopBuilder' => true,
                ];

                // This is a simplified version - in a real implementation,
                // you would need to render the actual Loop Builder template
                // For now, we'll render basic post information
                $this->render_basic_post_template($current_post_id, $current_post_type);
                ?>
            </div>
            <?php
        }

        return ob_get_clean();
    }

    /**
     * Render basic post template (fallback)
     * In a real implementation, this should render the actual Loop Builder template
     *
     * @param int $post_id Post ID
     * @param string $post_type Post type
     */
    private function render_basic_post_template($post_id, $post_type)
    {
        ?>
        <div class="eb-loop-item-content">
            <?php if (has_post_thumbnail($post_id)): ?>
                <div class="eb-loop-item-image">
                    <?php echo get_the_post_thumbnail($post_id, 'medium'); ?>
                </div>
            <?php endif; ?>
            
            <div class="eb-loop-item-text">
                <h3 class="eb-loop-item-title">
                    <a href="<?php echo esc_url(get_permalink($post_id)); ?>">
                        <?php echo esc_html(get_the_title($post_id)); ?>
                    </a>
                </h3>
                
                <div class="eb-loop-item-excerpt">
                    <?php echo wp_kses_post(get_the_excerpt($post_id)); ?>
                </div>
                
                <div class="eb-loop-item-meta">
                    <span class="eb-loop-item-date">
                        <?php echo esc_html(get_the_date('', $post_id)); ?>
                    </span>
                    <span class="eb-loop-item-author">
                        <?php echo esc_html(get_the_author_meta('display_name', get_post_field('post_author', $post_id))); ?>
                    </span>
                </div>
            </div>
        </div>
        <?php
    }
}
