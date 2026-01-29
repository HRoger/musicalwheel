<?php

namespace EssentialBlocks\Pro\Blocks;

use EssentialBlocks\Core\Block;

class BusinessHours extends Block
{
    protected $is_pro           = true;
    protected $editor_styles    = 'essential-blocks-pro-editor-style';
    protected $frontend_scripts = [ 'essential-blocks-pro-business-hours-frontend' ];
    protected $frontend_styles  = [ 'essential-blocks-fontawesome', 'essential-blocks-common-style' ];

    /**
     * Unique name of the block.
     * @return string
     */
    public function get_name()
    {
        return 'pro-business-hours';
    }

    /**
     * Register all other scripts
     * @return void
     */
    public function register_scripts()
    {
        wpdev_essential_blocks_pro()->assets->register(
            'business-hours-frontend',
            $this->path() . '/frontend.js',
            [ 'jquery', 'essential-blocks-controls-frontend' ]
        );
    }
}
