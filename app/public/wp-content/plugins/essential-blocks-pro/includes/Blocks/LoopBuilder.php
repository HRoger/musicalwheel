<?php

namespace EssentialBlocks\Pro\Blocks;

use EssentialBlocks\Core\Block;

class LoopBuilder extends Block
{
    protected $is_pro           = true;
    protected $editor_styles    = 'essential-blocks-pro-editor-style';
    protected $frontend_scripts = ['essential-blocks-pro-loop-builder-frontend'];
    protected $frontend_styles  = [];
    protected static $default_attributes;

    public function __construct()
    {
        self::$default_attributes = [
            // Query attributes
            'queryType'       => 'posts',
            'postType'        => 'post',
            'postsPerPage'    => 6,
            'orderBy'         => 'date',
            'order'           => 'desc',
            'includeIds'      => '',
            'excludeIds'      => '',
            'taxonomyFilters' => [],
            'metaQuery'       => [],
            'dateQuery'       => [],
            'authorIds'       => [],

            // Layout attributes
            'layoutMode'      => 'grid',
            'paginationType'  => 'none',
            'showPreviewRows' => true,
            'previewRowCount' => 3,

            // Responsive columns
            'columnsDesktop'  => 3,
            'columnsTab'      => 2,
            'columnsMobile'   => 1,

            // Grid gap
            'gridGapDesktop'  => 20,
            'gridGapTab'      => 20,
            'gridGapMobile'   => 20,
            'gridGapUnit'     => 'px'
        ];
    }

    /**
     * Unique name of the block.
     * @return string
     */
    public function get_name()
    {
        return 'pro-loop-builder';
    }

    /**
     * Register all other scripts
     * @return void
     */
    public function register_scripts()
    {
        wpdev_essential_blocks_pro()->assets->register(
            'loop-builder-frontend',
            $this->path() . '/frontend.js'
        );
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
        $block_id        = isset($attributes['blockId']) ? $attributes['blockId'] : '';
        $query_id        = isset($attributes['queryId']) ? $attributes['queryId'] : $block_id; // Fallback to blockId if queryId not set
        $class_hook      = isset($attributes['classHook']) ? $attributes['classHook'] : '';
        $query_data      = isset($attributes['queryData']) ? $attributes['queryData'] : [];
        
        // Inject context for child blocks using render_block_context filter
        $filter_block_context = function ($context, $parsed_block, $parent_block) use ($query_id, $query_data) {
            // Only apply to Essential Blocks
            if (isset($parsed_block['blockName']) &&
                (strpos($parsed_block['blockName'], 'essential-blocks/') === 0)) {

                $context['essential-blocks/queryId'] = $query_id;
                $context['essential-blocks/isLoopBuilder'] = true;
                $context['essential-blocks/query'] = $query_data;
            }
            return $context;
        };

        add_filter('render_block_context', $filter_block_context, 10, 3);

        // Get block wrapper attributes for proper Gutenberg class handling (includes wp-block-* classes and additional CSS classes)
        $wrapper_attributes = get_block_wrapper_attributes([
            'class' => 'root-' . $block_id
        ]);

        // Start output buffering
        ob_start();

?>
        <div <?php echo wp_kses_data($wrapper_attributes); ?>>
            <div class="eb-parent-wrapper eb-parent-<?php echo esc_attr($block_id); ?> <?php echo esc_attr($class_hook); ?>">
                <div class="eb-loop-builder-wrapper <?php echo esc_attr($block_id); ?>" data-query-id="<?php echo esc_attr($query_id); ?>" id="<?php echo esc_attr( $query_id ? 'eb-loop-builder-query-' . $query_id : 'eb-loop-builder-' . $block_id ); ?>">
                    <div class="eb-loop-builder-container">
                        <div class="eb-loop-builder-content">
                            <?php
                            // Render inner blocks content with context
                            echo $this->render_inner_blocks_with_context($content, $block);
                            ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
<?php

        // Remove the context filter
        remove_filter('render_block_context', $filter_block_context, 10);

        return ob_get_clean();
    }

    /**
     * Render inner blocks with proper context injection
     *
     * @param string $content The block content
     * @param object $block The block object
     * @return string Rendered content
     */
    private function render_inner_blocks_with_context($content, $block)
    {
        if (empty($content)) {
            return '';
        }

        // Context is now handled automatically by WordPress via block.json providesContext
        // Just render the content directly
        return $content;
    }
}
