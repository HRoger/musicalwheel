<?php

namespace EssentialBlocks\Pro\Blocks;

use EssentialBlocks\Core\Block;

class LoopPagination extends Block
{
    protected $is_pro        = true;
    protected $editor_styles = 'essential-blocks-pro-editor-style';
    protected $frontend_scripts = ['essential-blocks-pro-loop-pagination-frontend'];

    /**
     * Unique name of the block.
     * @return string
     */
    public function get_name()
    {
        return 'pro-loop-pagination';
    }

    /**
     * Register all other scripts
     * @return void
     */
    public function register_scripts()
    {
        wpdev_essential_blocks_pro()->assets->register(
            'loop-pagination-frontend',
            $this->path() . '/frontend.js'
        );
    }


    /**
     * Block render callback.
     *
     * @param mixed $attributes
     * @param mixed $content
     * @param mixed $block
     * @return mixed
     */
    public function render_callback($attributes, $content, $block = null)
    {
        if (is_admin()) {
            return;
        }

        // Get block attributes
        $block_id             = $attributes['blockId'] ?? '';
        $class_hook           = $attributes['classHook'] ?? '';
        $pagination_alignment = $attributes['paginationAlignment'] ?? 'center';
        $pagination_arrow     = $attributes['paginationArrow'] ?? 'none';
        $show_label           = $attributes['showLabel'] ?? true;
        $mid_size             = $attributes['midSize'] ?? 2;
        $previous_label       = $attributes['previousLabel'] ?? __('Previous', 'essential-blocks-pro');
        $next_label           = $attributes['nextLabel'] ?? __('Next', 'essential-blocks-pro');
        $show_numbers         = $attributes['showNumbers'] ?? true;
        $show_prev_next       = $attributes['showPrevNext'] ?? true;
        $show_first_last      = $attributes['showFirstLast'] ?? false;
        $first_label          = $attributes['firstLabel'] ?? __('First', 'essential-blocks-pro');
        $last_label           = $attributes['lastLabel'] ?? __('Last', 'essential-blocks-pro');

        // Get context from parent Loop Builder
        $query_id        = $block->context['essential-blocks/queryId'] ?? $block->context['queryId'] ?? null;
        $query           = $block->context['essential-blocks/query'] ?? $block->context['query'] ?? null;
        $is_loop_builder = $block->context['essential-blocks/isLoopBuilder'] ?? false;



        // Get pagination parameters
        $page_key       = $query_id ? 'query-' . $query_id . '-page' : 'query-page';
        $current_page   = max(1, (int) ($_GET[$page_key] ?? 1));
        $posts_per_page = $query['per_page'] ?? get_option('posts_per_page', 6);

        // Create a new WP_Query to get total posts count
        $query_args       = $this->build_query_args($query, $current_page, $posts_per_page);
        $pagination_query = new \WP_Query($query_args);

        $total_posts = $pagination_query->found_posts;
        $total_pages = $pagination_query->max_num_pages;
        // Reset global post data
        // wp_reset_postdata();

        // Don't show pagination if only one page
        if ($total_pages <= 1) {
            return '';
        }

        // Generate pagination data
        $pagination_data = [
            'current_page'      => $current_page,
            'total_pages'       => $total_pages,
            'has_next_page'     => $current_page < $total_pages,
            'has_previous_page' => $current_page > 1
        ];

        // Determine loop target id from context for ebTarget param
        $loop_target_id = $query_id ? 'eb-loop-builder-query-' . $query_id : ( $block_id ? 'eb-loop-builder-' . $block_id : '' );

        // Generate wrapper attributes
        $wrapper_attributes = get_block_wrapper_attributes([
            'class' => "eb-parent-wrapper eb-parent-{$block_id} {$class_hook}"
        ]);

        ob_start();
?>
        <div <?php echo wp_kses_data($wrapper_attributes); ?>>
            <div class="eb-loop-pagination-wrapper <?php echo esc_attr($block_id); ?>">
                <div class="eb-loop-pagination-container alignment-<?php echo esc_attr($pagination_alignment); ?>">
                    <nav class="eb-pagination" role="navigation" aria-label="<?php esc_attr_e('Posts pagination', 'essential-blocks-pro'); ?>">
                        <div class="eb-pagination-list">
                            <?php echo $this->render_pagination_items($pagination_data, $attributes, $page_key, $loop_target_id); ?>
                        </div>
                    </nav>
                </div>
            </div>
        </div>
<?php
        return ob_get_clean();
    }

    /**
     * Build query arguments from Loop Builder query
     * Mirrors QueryHelper::get_posts mapping so pagination counts match the Loop
     */
    private function build_query_args($query, $current_page, $posts_per_page)
    {
        // Normalize basic params
        $source  = $query['source'] ?? $query['postType'] ?? 'post';
        $source  = ($source === 'posts') ? 'post' : $source;
        $orderby = $query['orderby'] ?? $query['orderBy'] ?? 'date';
        $orderby = ($orderby === 'id') ? 'ID' : $orderby;
        $order   = $query['order'] ?? 'desc';

        $args = [
            'post_status'      => 'publish',
            'post_type'        => $source,
            'posts_per_page'   => (int) $posts_per_page,
            'paged'            => max(1, (int) $current_page),
            'order'            => $order,
            'orderby'          => $orderby,
            'suppress_filters' => false
        ];

        // Search
        if (! empty($query['s'])) {
            $args['s'] = $query['s'];
        } elseif (! empty($query['search'])) { // legacy
            $args['s'] = $query['search'];
        }

        // Include / Exclude specific posts (accept array or JSON string or CSV)
        if (! empty($query['include'])) {
            $includeArray = [];
            if (is_array($query['include'])) {
                foreach ($query['include'] as $inc) {
                    if (is_array($inc) && isset($inc['value'])) {
                        $includeArray[] = (int) $inc['value'];
                    } elseif (is_numeric($inc)) {
                        $includeArray[] = (int) $inc;
                    }
                }
            } elseif (is_string($query['include'])) {
                $decoded = json_decode($query['include']);
                if (is_array($decoded)) {
                    foreach ($decoded as $item) {
                        if (is_object($item) && isset($item->value)) {
                            $includeArray[] = (int) $item->value;
                        }
                    }
                } else {
                    // Fallback CSV
                    $parts = array_filter(array_map('trim', explode(',', $query['include'])));
                    foreach ($parts as $p) {
                        if (is_numeric($p)) {
                            $includeArray[] = (int) $p;
                        }
                    }
                }
            }
            if (! empty($includeArray)) {
                $args['post__in'] = $includeArray;
            }
        }

        if (! empty($query['exclude'])) {
            $excludeArray = [];
            if (is_array($query['exclude'])) {
                foreach ($query['exclude'] as $exc) {
                    if (is_array($exc) && isset($exc['value'])) {
                        $excludeArray[] = (int) $exc['value'];
                    } elseif (is_numeric($exc)) {
                        $excludeArray[] = (int) $exc;
                    }
                }
            } elseif (is_string($query['exclude'])) {
                $decoded = json_decode($query['exclude']);
                if (is_array($decoded)) {
                    foreach ($decoded as $item) {
                        if (is_object($item) && isset($item->value)) {
                            $excludeArray[] = (int) $item->value;
                        }
                    }
                } else {
                    // Fallback CSV
                    $parts = array_filter(array_map('trim', explode(',', $query['exclude'])));
                    foreach ($parts as $p) {
                        if (is_numeric($p)) {
                            $excludeArray[] = (int) $p;
                        }
                    }
                }
            }
            if (! empty($excludeArray)) {
                $args['post__not_in'] = isset($args['post__not_in']) ? array_merge($args['post__not_in'], $excludeArray) : $excludeArray;
            }
        }

        // Authors (accept array or JSON string)
        if (! empty($query['author'])) {
            $authorArray = [];
            if (is_array($query['author'])) {
                foreach ($query['author'] as $author) {
                    if (is_array($author) && isset($author['value'])) {
                        $authorArray[] = (int) $author['value'];
                    } elseif (is_numeric($author)) {
                        $authorArray[] = (int) $author;
                    }
                }
            } elseif (is_string($query['author'])) {
                $decoded = json_decode($query['author']);
                if (is_array($decoded)) {
                    foreach ($decoded as $item) {
                        if (is_object($item) && isset($item->value)) {
                            $authorArray[] = (int) $item->value;
                        }
                    }
                }
            }
            if (! empty($authorArray)) {
                $args['author__in'] = $authorArray;
            }
        }

        // Exclude current post if requested
        if (! empty($query['exclude_current'])) {
            $post_id = get_the_ID();
            if (empty($post_id)) {
                $url = wp_get_referer();
                if ($url) {
                    $post_id = url_to_postid($url);
                }
            }
            if ($post_id) {
                $args['post__not_in'] = isset($args['post__not_in']) ? array_merge($args['post__not_in'], [(int) $post_id]) : [(int) $post_id];
            }
        }

        // Sticky posts handling: remove sticky when ignoring
        if (! empty($query['ignore_sticky_posts'])) {
            $args['ignore_sticky_posts'] = true;
            $sticky_posts                  = get_option('sticky_posts');
            if (! empty($sticky_posts) && is_array($sticky_posts)) {
                $args['post__not_in'] = isset($args['post__not_in']) ? array_merge($args['post__not_in'], $sticky_posts) : $sticky_posts;
            }
        } elseif (isset($query['sticky'])) {
            // Explicitly include sticky (default WP behavior)
            $args['ignore_sticky_posts'] = ! $query['sticky'] ? true : false;
            if (! $args['ignore_sticky_posts']) {
                // do not exclude sticky
            }
        }

        // Exclude password protected
        if (isset($query['exclude_password_protected']) && $query['exclude_password_protected'] === true) {
            $args['has_password'] = false;
        } else {
            $args['has_password'] = null;
        }

        // Taxonomy filters (new format)
        if (! empty($query['taxonomies']) && is_array($query['taxonomies'])) {
            $tax_query = [];
            foreach ($query['taxonomies'] as $taxonomy_key => $taxonomy) {
                if (is_array($taxonomy) && ! empty($taxonomy['value'])) {
                    $vals = json_decode($taxonomy['value']);
                    $ids  = [];
                    if (is_array($vals)) {
                        foreach ($vals as $v) {
                            if (isset($v->value)) {
                                $ids[] = (int) $v->value;
                            }
                        }
                    }
                    if (! empty($ids)) {
                        $tax_query[] = [
                            'taxonomy' => $taxonomy_key,
                            'field'    => 'id',
                            'terms'    => $ids
                        ];
                    }
                }
                if (is_array($taxonomy) && ! empty($taxonomy['exclude'])) {
                    $vals = json_decode($taxonomy['exclude']);
                    $ids  = [];
                    if (is_array($vals)) {
                        foreach ($vals as $v) {
                            if (isset($v->value)) {
                                $ids[] = (int) $v->value;
                            }
                        }
                    }
                    if (! empty($ids)) {
                        $tax_query[] = [
                            'taxonomy' => $taxonomy_key,
                            'field'    => 'id',
                            'terms'    => $ids,
                            'operator' => 'NOT IN'
                        ];
                    }
                }
            }
            if (! empty($tax_query)) {
                $args['tax_query'] = $tax_query;
            }
        } elseif (! empty($query['taxQuery'])) { // fallback
            $args['tax_query'] = $query['taxQuery'];
        }

        // Meta query
        if (! empty($query['metaQuery']) && is_array($query['metaQuery'])) {
            $meta_query = [];
            foreach ($query['metaQuery'] as $cond) {
                if (! empty($cond['key'])) {
                    $item = [
                        'key'     => $cond['key'],
                        'compare' => $cond['operator'] ?? '=',
                        'type'    => $cond['type'] ?? 'CHAR'
                    ];
                    $op = $cond['operator'] ?? '=';
                    if (! in_array($op, ['EXISTS', 'NOT EXISTS'], true)) {
                        $item['value'] = $cond['value'] ?? '';
                    }
                    $meta_query[] = $item;
                }
            }
            if (! empty($meta_query)) {
                if (count($meta_query) > 1) {
                    $meta_query['relation'] = 'AND';
                }
                $args['meta_query'] = $meta_query;
            }
        }

        // Date query
        if (! empty($query['dateQuery']) && is_array($query['dateQuery']) && ! empty($query['dateQuery']['type']) && $query['dateQuery']['type'] !== 'none') {
            $dq   = [];
            $type = $query['dateQuery']['type'];
            switch ($type) {
                case 'last_days':
                    $days = isset($query['dateQuery']['days']) ? (int) $query['dateQuery']['days'] : 7;
                    $dq   = ['after' => $days . ' days ago'];
                    break;
                case 'date_range':
                    if (! empty($query['dateQuery']['after'])) {
                        $dq['after'] = $query['dateQuery']['after'];
                    }
                    if (! empty($query['dateQuery']['before'])) {
                        $dq['before'] = $query['dateQuery']['before'];
                    }
                    break;
                case 'this_week':
                    $dq = ['year' => date('Y'), 'week' => date('W')];
                    break;
                case 'this_month':
                    $dq = ['year' => date('Y'), 'month' => date('n')];
                    break;
                case 'this_year':
                    $dq = ['year' => date('Y')];
                    break;
                case 'custom':
                    $map = ['year', 'month', 'day', 'hour', 'minute', 'second', 'compare', 'column'];
                    foreach ($map as $k) {
                        if (! empty($query['dateQuery'][$k])) {
                            $dq[$k] = $query['dateQuery'][$k];
                        }
                    }
                    break;
            }
            if (! empty($dq)) {
                $args['date_query'] = [$dq];
            }
        }

        return $args;
    }

    /**
     * Render pagination items
     */
    private function render_pagination_items($pagination_data, $attributes, $page_key, $loop_target_id = '')
    {
        $current_page      = $pagination_data['current_page'];
        $total_pages       = $pagination_data['total_pages'];
        $has_next_page     = $pagination_data['has_next_page'];
        $has_previous_page = $pagination_data['has_previous_page'];

        $pagination_arrow = $attributes['paginationArrow'] ?? 'none';
        $show_label       = $attributes['showLabel'] ?? true;
        $mid_size         = $attributes['midSize'] ?? 2;
        $previous_label   = $attributes['previousLabel'] ?? __('Previous', 'essential-blocks-pro');
        $next_label       = $attributes['nextLabel'] ?? __('Next', 'essential-blocks-pro');
        $show_numbers     = $attributes['showNumbers'] ?? true;
        $show_prev_next   = $attributes['showPrevNext'] ?? true;
        $show_first_last  = $attributes['showFirstLast'] ?? false;
        $first_label      = $attributes['firstLabel'] ?? __('First', 'essential-blocks-pro');
        $last_label       = $attributes['lastLabel'] ?? __('Last', 'essential-blocks-pro');

        $output = '';

        // First Page Link
        if ($show_first_last && $current_page > 1) {
            $first_url = add_query_arg($page_key, 1);
            if ($loop_target_id) { $first_url = add_query_arg('ebTarget', $loop_target_id, $first_url); }
            $output .= sprintf(
                '<span class="eb-pagination-item eb-pagination-first"><a href="%s" class="eb-pagination-link">%s</a></span>',
                esc_url($first_url),
                $show_label ? esc_html($first_label) : ''
            );
        }

        // Previous Page Link
        if ($show_prev_next && $has_previous_page) {
            $prev_url = add_query_arg($page_key, $current_page - 1);
            if ($loop_target_id) { $prev_url = add_query_arg('ebTarget', $loop_target_id, $prev_url); }
            $arrow    = $this->get_arrow_html('prev', $pagination_arrow);
            $output .= sprintf(
                '<span class="eb-pagination-item eb-pagination-previous"><a href="%s" class="eb-pagination-link">%s%s</a></span>',
                esc_url($prev_url),
                $arrow,
                $show_label ? '<span class="eb-pagination-label">' . esc_html($previous_label) . '</span>' : ''
            );
        }

        // Page Numbers
        if ($show_numbers) {
            $output .= $this->render_page_numbers($current_page, $total_pages, $mid_size, $page_key, $loop_target_id);
        }

        // Next Page Link
        if ($show_prev_next && $has_next_page) {
            $next_url = add_query_arg($page_key, $current_page + 1);
            if ($loop_target_id) { $next_url = add_query_arg('ebTarget', $loop_target_id, $next_url); }
            $arrow    = $this->get_arrow_html('next', $pagination_arrow);
            $output .= sprintf(
                '<span class="eb-pagination-item eb-pagination-next"><a href="%s" class="eb-pagination-link">%s%s</a></span>',
                esc_url($next_url),
                $show_label ? '<span class="eb-pagination-label">' . esc_html($next_label) . '</span>' : '',
                $arrow
            );
        }

        // Last Page Link
        if ($show_first_last && $current_page < $total_pages) {
            $last_url = add_query_arg($page_key, $total_pages);
            if ($loop_target_id) { $last_url = add_query_arg('ebTarget', $loop_target_id, $last_url); }
            $output .= sprintf(
                '<span class="eb-pagination-item eb-pagination-last"><a href="%s" class="eb-pagination-link">%s</a></span>',
                esc_url($last_url),
                $show_label ? esc_html($last_label) : ''
            );
        }

        return $output;
    }

    /**
     * Render page numbers
     */
    private function render_page_numbers($current_page, $total_pages, $mid_size, $page_key, $loop_target_id = '')
    {
        $output = '';

        // Calculate range
        $start_page = max(1, $current_page - $mid_size);
        $end_page   = min($total_pages, $current_page + $mid_size);

        // Add first page if not in range
        if ($start_page > 1) {
            $first_url = add_query_arg($page_key, 1);
            if ($loop_target_id) { $first_url = add_query_arg('ebTarget', $loop_target_id, $first_url); }
            $output .= sprintf(
                '<span class="eb-pagination-item eb-pagination-number"><a href="%s" class="eb-pagination-link">1</a></span>',
                esc_url($first_url)
            );

            if ($start_page > 2) {
                $output .= '<span class="eb-pagination-item eb-pagination-dots"><span class="eb-pagination-link">...</span></span>';
            }
        }

        // Add page numbers in range
        for ($i = $start_page; $i <= $end_page; $i++) {
            if ($i === $current_page) {
                $output .= sprintf(
                    '<span class="eb-pagination-item eb-pagination-current"><span class="eb-pagination-link">%d</span></span>',
                    $i
                );
            } else {
                $page_url = add_query_arg($page_key, $i);
                if ($loop_target_id) { $page_url = add_query_arg('ebTarget', $loop_target_id, $page_url); }
                $output .= sprintf(
                    '<span class="eb-pagination-item eb-pagination-number"><a href="%s" class="eb-pagination-link">%d</a></span>',
                    esc_url($page_url),
                    $i
                );
            }
        }

        // Add last page if not in range
        if ($end_page < $total_pages) {
            if ($end_page < $total_pages - 1) {
                $output .= '<span class="eb-pagination-item eb-pagination-dots"><span class="eb-pagination-link">...</span></span>';
            }

            $last_url = add_query_arg($page_key, $total_pages);
            if ($loop_target_id) { $last_url = add_query_arg('ebTarget', $loop_target_id, $last_url); }
            $output .= sprintf(
                '<span class="eb-pagination-item eb-pagination-number"><a href="%s" class="eb-pagination-link">%d</a></span>',
                esc_url($last_url),
                $total_pages
            );
        }

        return $output;
    }

    /**
     * Get arrow HTML based on type
     */
    private function get_arrow_html($direction, $arrow_type)
    {
        if ($arrow_type === 'none') {
            return '';
        }

        $arrow_symbol = '';
        if ($direction === 'prev') {
            $arrow_symbol = $arrow_type === 'chevron' ? '‹' : '←';
        } else {
            $arrow_symbol = $arrow_type === 'chevron' ? '›' : '→';
        }

        return '<span class="eb-pagination-arrow">' . $arrow_symbol . '</span>';
    }
}
