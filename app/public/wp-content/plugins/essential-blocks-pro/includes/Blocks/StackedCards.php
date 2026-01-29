<?php
namespace EssentialBlocks\Pro\Blocks;

use EssentialBlocks\Core\Block;

class StackedCards extends Block
{
    protected $is_pro           = true;
    protected $editor_styles    = 'essential-blocks-pro-editor-style';
    protected $frontend_scripts = [ 'essential-blocks-pro-stacked-cards-frontend' ];

    /**
     * Unique name of the block.
     * @return string
     */
    public function get_name()
    {
        return 'pro-stacked-cards';
    }

    /**
     * Register all other scripts
     * @return void
     */
    public function register_scripts()
    {
        wpdev_essential_blocks_pro()->assets->register(
            'stacked-cards-frontend',
            $this->path() . '/frontend.js',
            [ 'essential-blocks-pro-vendor-bundle' ]
        );
    }

}
