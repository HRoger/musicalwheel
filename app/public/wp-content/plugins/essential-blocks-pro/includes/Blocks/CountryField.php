<?php
namespace EssentialBlocks\Pro\Blocks;

use EssentialBlocks\Core\Block;

class CountryField extends Block
{
    protected $is_pro           = true;
    protected $editor_styles    = 'essential-blocks-pro-editor-style';
    protected $frontend_styles  = [ 'essential-blocks-pro-vendor-style' ];
    protected $frontend_scripts = [ 'essential-blocks-pro-country-frontend' ];

    /**
     * Unique name of the block.
     * @return string
     */
    public function get_name()
    {
        return 'form-country-field';
    }

    /**
     * Register all other scripts
     * @return void
     */
    public function register_scripts()
    {
        wpdev_essential_blocks_pro()->assets->register(
            'country-frontend',
            $this->path() . '/frontend.js',
            [ 'essential-blocks-pro-vendor-bundle' ]
        );
    }
}
