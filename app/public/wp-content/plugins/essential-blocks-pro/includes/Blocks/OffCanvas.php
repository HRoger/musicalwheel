<?php
namespace EssentialBlocks\Pro\Blocks;

use EssentialBlocks\Core\Block;

class OffCanvas extends Block
{
    protected $is_pro           = true;
    protected $editor_styles    = 'essential-blocks-pro-editor-style';
    protected $frontend_scripts = [ 'essential-blocks-pro-off-canvas-frontend' ];
    protected $frontend_styles  = [ 'essential-blocks-fontawesome' ];

    /**
     * Unique name of the block.
     * @return string
     */
    public function get_name()
    {
        return 'pro-off-canvas';
    }

    /**
     * Register all other scripts
     * @return void
     */
    public function register_scripts()
    {
        wpdev_essential_blocks_pro()->assets->register(
            'off-canvas-frontend',
            $this->path() . '/frontend.js',
            [ 'essential-blocks-pro-vendor-bundle' ]
        );
    }

    /**
     * Render callback
     */
    public function render_callback( $attributes, $content )
    {
        if ( isset( $attributes[ 'toggleSource' ] ) && 'icon' === $attributes[ 'toggleSource' ] ) {
            wpdev_essential_blocks_pro()->assets->enqueue(
                'hamburger',
                'css/hamburgers.min.css',
            );
        }

        return $content;
    }
}
