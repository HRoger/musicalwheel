<?php

namespace EssentialBlocks\Pro\Blocks;

use EssentialBlocks\Core\Block;

class PostTemplate extends Block
{
    protected $is_pro           = true;
    protected $editor_styles    = 'essential-blocks-pro-editor-style';
    protected static $default_attributes;

    public function __construct()
    {
        self::$default_attributes = [
            // Responsive columns
            'columnsDesktop'    => 3,
            'columnsTab'        => 2,
            'columnsMobile'     => 1,

            // Grid gap
            'gridGapDesktop'    => 20,
            'gridGapTab'        => 20,
            'gridGapMobile'     => 20,
            'gridGapUnit'       => 'px',
        ];
    }

    /**
     * Unique name of the block.
     * @return string
     */
    public function get_name()
    {
        return 'pro-post-template';
    }

    public function get_default_attributes()
    {
        return self::$default_attributes;
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

        $attributes = wp_parse_args($attributes, $this->get_default_attributes());

        // Extract attributes
        $block_id = isset($attributes['blockId']) ? $attributes['blockId'] : '';
        $class_hook = isset($attributes['classHook']) ? $attributes['classHook'] : '';
        
        // Get context from parent Loop Builder
        $context = $block->context ?? [];
        $query = $context['essential-blocks/query'] ?? $context['query'] ?? null;
        $query_id = $context['essential-blocks/queryId'] ?? $context['queryId'] ?? null;
        $is_loop_builder = $context['essential-blocks/isLoopBuilder'] ?? false;

        // Get block wrapper attributes for proper Gutenberg class handling (includes wp-block-* classes and additional CSS classes)
        $wrapper_attributes = get_block_wrapper_attributes([
            'class' => 'root-' . $block_id
        ]);

        // Extract query parameters from context
        $post_type = $query['source'] ?? $query['postType'] ?? 'post';
        $posts_per_page = $query['per_page'] ?? $query['perPage'] ?? 6;
        $order_by = $query['orderby'] ?? $query['orderBy'] ?? 'date';
        $order = $query['order'] ?? 'desc';
        $offset = $query['offset'] ?? 0;

        // Handle pagination
        $page_key = $query_id ? 'query-' . $query_id . '-page' : 'query-page';
        $current_page = max(1, (int) ($_GET[$page_key] ?? 1));

        // Calculate offset for pagination
        $pagination_offset = ($current_page - 1) * $posts_per_page;
        $total_offset = $offset + $pagination_offset;

        // Build query arguments
        $query_args = array(
            'post_type' => $post_type,
            'posts_per_page' => $posts_per_page,
            'orderby' => $order_by,
            'order' => $order,
            'post_status' => 'publish',
            'offset' => $total_offset,
            'paged' => $current_page, // Add paged parameter for proper pagination
        );

        // Add include/exclude if specified (support JSON strings, arrays of objects, comma strings)
        if (!empty($query['include'])) {
            $include_ids = array();
            $raw = $query['include'];

            if (is_string($raw)) {
                $decoded = json_decode($raw, true);
                if (is_array($decoded)) {
                    foreach ($decoded as $item) {
                        if (is_array($item) && isset($item['value']) && is_numeric($item['value'])) {
                            $include_ids[] = (int) $item['value'];
                        } elseif (is_array($item) && isset($item['id']) && is_numeric($item['id'])) {
                            $include_ids[] = (int) $item['id'];
                        } elseif (is_numeric($item)) {
                            $include_ids[] = (int) $item;
                        }
                    }
                } else {
                    $parts = array_filter(array_map('trim', explode(',', $raw)));
                    foreach ($parts as $part) {
                        if (is_numeric($part)) {
                            $include_ids[] = (int) $part;
                        }
                    }
                }
            } elseif (is_array($raw)) {
                foreach ($raw as $item) {
                    if (is_array($item) && isset($item['value']) && is_numeric($item['value'])) {
                        $include_ids[] = (int) $item['value'];
                    } elseif (is_array($item) && isset($item['id']) && is_numeric($item['id'])) {
                        $include_ids[] = (int) $item['id'];
                    } elseif (is_numeric($item)) {
                        $include_ids[] = (int) $item;
                    }
                }
            }

            if (!empty($include_ids)) {
                $query_args['post__in'] = $include_ids;
            }
        }
        
        if (!empty($query['exclude'])) {
            $exclude_ids = array();
            $raw = $query['exclude'];

            if (is_string($raw)) {
                $decoded = json_decode($raw, true);
                if (is_array($decoded)) {
                    foreach ($decoded as $item) {
                        if (is_array($item) && isset($item['value']) && is_numeric($item['value'])) {
                            $exclude_ids[] = (int) $item['value'];
                        } elseif (is_array($item) && isset($item['id']) && is_numeric($item['id'])) {
                            $exclude_ids[] = (int) $item['id'];
                        } elseif (is_numeric($item)) {
                            $exclude_ids[] = (int) $item;
                        }
                    }
                } else {
                    $parts = array_filter(array_map('trim', explode(',', $raw)));
                    foreach ($parts as $part) {
                        if (is_numeric($part)) {
                            $exclude_ids[] = (int) $part;
                        }
                    }
                }
            } elseif (is_array($raw)) {
                foreach ($raw as $item) {
                    if (is_array($item) && isset($item['value']) && is_numeric($item['value'])) {
                        $exclude_ids[] = (int) $item['value'];
                    } elseif (is_array($item) && isset($item['id']) && is_numeric($item['id'])) {
                        $exclude_ids[] = (int) $item['id'];
                    } elseif (is_numeric($item)) {
                        $exclude_ids[] = (int) $item;
                    }
                }
            }

            if (!empty($exclude_ids)) {
                $query_args['post__not_in'] = $exclude_ids;
            }
        }

        if (!empty($query['author'])) {
            if (is_array($query['author'])) {
                $author_ids = array();
                foreach ($query['author'] as $author) {
                    if (is_array($author) && isset($author['value'])) {
                        // Handle author objects with label/value structure
                        $author_ids[] = $author['value'];
                    } elseif (is_numeric($author)) {
                        // Handle simple numeric author IDs
                        $author_ids[] = $author;
                    }
                }
                if (!empty($author_ids)) {
                    $query_args['author'] = implode(',', $author_ids);
                }
            } else {
                $query_args['author'] = $query['author'];
            }
        }

        // Handle Advanced Query Options

        // Handle sticky posts options
        if (isset($query['ignore_sticky_posts']) && $query['ignore_sticky_posts']) {
            $query_args['ignore_sticky_posts'] = true;
            // When ignoring sticky posts, also exclude them from results
            $sticky_posts = get_option('sticky_posts');
            if (!empty($sticky_posts)) {
                $existing_excludes = isset($query_args['post__not_in']) ? $query_args['post__not_in'] : array();
                $query_args['post__not_in'] = array_merge($existing_excludes, $sticky_posts);
            }
        } elseif (isset($query['sticky']) && $query['sticky']) {
            // Include sticky posts (this is WordPress default behavior, but we make it explicit)
            $query_args['ignore_sticky_posts'] = false;
        }

        // Handle exclude current post
        if (isset($query['exclude_current']) && $query['exclude_current']) {
            $current_post_id = get_the_ID();
            if ($current_post_id) {
                $existing_excludes = isset($query_args['post__not_in']) ? $query_args['post__not_in'] : array();
                $query_args['post__not_in'] = array_merge($existing_excludes, array($current_post_id));
            }
        }

        // Handle exclude password protected posts
        if (isset($query['exclude_password_protected']) && $query['exclude_password_protected']) {
            $query_args['has_password'] = false;
        }

        // Handle taxonomy filters
        if (isset($query['taxonomies']) && is_array($query['taxonomies']) && count($query['taxonomies']) > 0) {
            $tax_query = array();
            foreach ($query['taxonomies'] as $taxonomy_key => $taxonomy) {
                // If taxonomy is array and has value
                if (is_array($taxonomy) && count($taxonomy) > 0 && isset($taxonomy['value'])) {
                    $tax_value_obj = json_decode($taxonomy['value']); // decode value from json string to array
                    $tax_values = array();

                    // If value is Array and has value, push the value to $tax_values array
                    if (is_array($tax_value_obj) && count($tax_value_obj) > 0) {
                        foreach ($tax_value_obj as $tax_item) {
                            array_push($tax_values, $tax_item->value);
                        }

                        // Push taxonomy array to $tax_query
                        array_push(
                            $tax_query,
                            array(
                                'taxonomy' => $taxonomy_key,
                                'field'    => 'id',
                                'terms'    => $tax_values
                            )
                        );
                    }
                }

                if (is_array($taxonomy) && count($taxonomy) > 0 && isset($taxonomy['exclude'])) {
                    $tax_exclude_obj = json_decode($taxonomy['exclude']); // decode value from json string to array
                    $tax_values = array();

                    // If value is Array and has value, push the value to $tax_values array
                    if (is_array($tax_exclude_obj) && count($tax_exclude_obj) > 0) {
                        foreach ($tax_exclude_obj as $tax_item) {
                            array_push($tax_values, $tax_item->value);
                        }

                        // Push taxonomy array to $tax_query
                        array_push(
                            $tax_query,
                            array(
                                'taxonomy' => $taxonomy_key,
                                'field'    => 'id',
                                'terms'    => $tax_values,
                                'operator' => 'NOT IN',
                            )
                        );
                    }
                }
            }

            if (count($tax_query) > 0) {
                $query_args['tax_query'] = $tax_query;
            }
        }

        // Handle meta queries
        if (isset($query['metaQuery']) && is_array($query['metaQuery']) && count($query['metaQuery']) > 0) {
            $meta_query = array();
            foreach ($query['metaQuery'] as $meta_condition) {
                if (isset($meta_condition['key']) && !empty($meta_condition['key'])) {
                    $meta_query_item = array(
                        'key' => $meta_condition['key'],
                        'compare' => isset($meta_condition['operator']) ? $meta_condition['operator'] : '=',
                        'type' => isset($meta_condition['type']) ? $meta_condition['type'] : 'CHAR',
                    );

                    // Add value for operators that require it
                    if (!in_array($meta_condition['operator'] ?? '=', array('EXISTS', 'NOT EXISTS'))) {
                        $meta_query_item['value'] = isset($meta_condition['value']) ? $meta_condition['value'] : '';
                    }

                    $meta_query[] = $meta_query_item;
                }
            }

            if (count($meta_query) > 0) {
                // Add relation if there are multiple conditions
                if (count($meta_query) > 1) {
                    $meta_query['relation'] = 'AND';
                }
                $query_args['meta_query'] = $meta_query;
            }
        }

        // Handle date queries
        if (isset($query['dateQuery']) && is_array($query['dateQuery']) && !empty($query['dateQuery']['type']) && $query['dateQuery']['type'] !== 'none') {
            $date_query = array();
            $date_type = $query['dateQuery']['type'];

            switch ($date_type) {
                case 'last_days':
                    $days = isset($query['dateQuery']['days']) ? intval($query['dateQuery']['days']) : 7;
                    $date_query = array(
                        'after' => $days . ' days ago',
                    );
                    break;

                case 'date_range':
                    if (!empty($query['dateQuery']['after']) || !empty($query['dateQuery']['before'])) {
                        if (!empty($query['dateQuery']['after'])) {
                            $date_query['after'] = $query['dateQuery']['after'];
                        }
                        if (!empty($query['dateQuery']['before'])) {
                            $date_query['before'] = $query['dateQuery']['before'];
                        }
                    }
                    break;

                case 'this_week':
                    $date_query = array(
                        'year' => date('Y'),
                        'week' => date('W'),
                    );
                    break;

                case 'this_month':
                    $date_query = array(
                        'year' => date('Y'),
                        'month' => date('n'),
                    );
                    break;

                case 'this_year':
                    $date_query = array(
                        'year' => date('Y'),
                    );
                    break;

                case 'custom':
                    $custom_date = array();
                    if (!empty($query['dateQuery']['year'])) {
                        $custom_date['year'] = intval($query['dateQuery']['year']);
                    }
                    if (!empty($query['dateQuery']['month'])) {
                        $custom_date['month'] = intval($query['dateQuery']['month']);
                    }
                    if (!empty($query['dateQuery']['day'])) {
                        $custom_date['day'] = intval($query['dateQuery']['day']);
                    }
                    if (!empty($query['dateQuery']['hour'])) {
                        $custom_date['hour'] = intval($query['dateQuery']['hour']);
                    }
                    if (!empty($query['dateQuery']['minute'])) {
                        $custom_date['minute'] = intval($query['dateQuery']['minute']);
                    }
                    if (!empty($query['dateQuery']['second'])) {
                        $custom_date['second'] = intval($query['dateQuery']['second']);
                    }
                    if (!empty($query['dateQuery']['compare'])) {
                        $custom_date['compare'] = $query['dateQuery']['compare'];
                    }
                    if (!empty($query['dateQuery']['column'])) {
                        $custom_date['column'] = $query['dateQuery']['column'];
                    }
                    $date_query = $custom_date;
                    break;
            }

            if (!empty($date_query)) {
                $query_args['date_query'] = array($date_query);
            }
        }

        // Execute query
        $loop_query = new \WP_Query($query_args);

        // Start output buffering
        ob_start();

        if ($loop_query->have_posts()) {
        ?>
            <div <?php echo wp_kses_data($wrapper_attributes); ?>>
                <div class="eb-parent-wrapper eb-parent-<?php echo esc_attr($block_id); ?> <?php echo esc_attr($class_hook); ?>">
                    <div class="eb-post-template-wrapper <?php echo esc_attr($block_id); ?>">
                        <div class="eb-post-template-container">
                            <div class="eb-post-template-items">
                                <?php
                                while ($loop_query->have_posts()) {
                                    $loop_query->the_post();
                                    $current_post_id = get_the_ID();
                                    $current_post_type = get_post_type();
                                ?>
                                    <div class="eb-post-template-item" data-post-id="<?php echo esc_attr($current_post_id); ?>">
                                        <?php
                                        // Inject context for this specific post using render_block_context filter
                                        $filter_block_context = function ($context) use ($current_post_id, $current_post_type, $query_id, $query_args) {
                                            // Add Post Template context
                                            $context['postId'] = $current_post_id;
                                            $context['postType'] = $current_post_type;
                                            $context['essential-blocks/postId'] = $current_post_id;
                                            $context['essential-blocks/postType'] = $current_post_type;
                                            $context['essential-blocks/queryId'] = $query_id;
                                            $context['essential-blocks/isLoopBuilder'] = true;
                                            $context['essential-blocks/query'] = $query_args;

                                            return $context;
                                        };

                                        // Add the filter with high priority to ensure it's applied early
                                        add_filter('render_block_context', $filter_block_context, 1);

                                        // Render the inner blocks content for each post with context
                                        echo $this->render_inner_blocks_with_context($content, $block);

                                        // Remove the filter to prevent context leakage
                                        remove_filter('render_block_context', $filter_block_context, 1);
                                        ?>
                                    </div>
                                <?php
                                }
                                ?>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        <?php
        } else {
            // Get block wrapper attributes for proper Gutenberg class handling (includes wp-block-* classes and additional CSS classes)
            $wrapper_attributes = get_block_wrapper_attributes([
                'class' => 'root-' . $block_id
            ]);
        ?>
            <div <?php echo wp_kses_data($wrapper_attributes); ?>>
                <div class="eb-parent-wrapper eb-parent-<?php echo esc_attr($block_id); ?> <?php echo esc_attr($class_hook); ?>">
                    <div class="eb-post-template-wrapper <?php echo esc_attr($block_id); ?>">
                        <div class="eb-post-template-no-posts">
                            <p><?php esc_html_e('No posts found.', 'essential-blocks-pro'); ?></p>
                        </div>
                    </div>
                </div>
            </div>
<?php
        }

        // Reset post data
        wp_reset_postdata();

        return ob_get_clean();
    }

    /**
     * Render inner blocks with context
     *
     * @param string $content
     * @param object $block
     * @return string
     */
    private function render_inner_blocks_with_context($content, $block)
    {
        // Check if we have a proper block object with parsed_block data
        if (!$block || !isset($block->parsed_block['innerBlocks'])) {
            return $content;
        }

        $rendered_content = '';

        // Render each inner block individually to avoid Loop Builder wrapper HTML
        foreach ($block->parsed_block['innerBlocks'] as $inner_block) {
            // Create a WP_Block instance for each inner block
            // Context will be automatically injected via the render_block_context filter
            $block_instance = new \WP_Block($inner_block);
            $rendered_content .= $block_instance->render();
        }

        return $rendered_content;
    }
}
