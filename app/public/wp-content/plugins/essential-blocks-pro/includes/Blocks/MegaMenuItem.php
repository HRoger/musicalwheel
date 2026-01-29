<?php
namespace EssentialBlocks\Pro\Blocks;

use EssentialBlocks\Core\Block;

class MegaMenuItem extends Block
{
    protected $is_pro           = true;
    protected $editor_styles    = 'essential-blocks-pro-editor-style';
    protected $frontend_scripts = [ 'essential-blocks-pro-mega-menu-item-frontend' ];

    /**
     * Unique name of the block.
     * @return string
     */
    public function get_name()
    {
        return 'pro-mega-menu-item';
    }

    /**
     * Register all other scripts
     * @return void
     */
    public function register_scripts()
    {
        wpdev_essential_blocks_pro()->assets->register(
            'mega-menu-item-frontend',
            $this->path() . '/frontend.js',
            [ 'essential-blocks-pro-vendor-bundle' ]
        );
    }
}