<?php
namespace EssentialBlocks\Pro\Blocks;

use EssentialBlocks\Core\Block;

class FancyChart extends Block
{
    protected $is_pro           = true;
    protected $editor_styles    = 'essential-blocks-pro-editor-style';
    protected $frontend_scripts = [ 'essential-blocks-pro-fancy-chart-frontend' ];

    /**
     * Unique name of the block.
     * @return string
     */
    public function get_name()
    {
        return 'fancy-chart';
    }

    /**
     * Register all other scripts
     * @return void
     */
    public function register_scripts()
    {
        wpdev_essential_blocks_pro()->assets->register(
            'fancy-chart-frontend',
            $this->path() . '/frontend.js',
            [ 'regenerator-runtime', 'essential-blocks-pro-vendor-bundle' ]
        );
    }
}
