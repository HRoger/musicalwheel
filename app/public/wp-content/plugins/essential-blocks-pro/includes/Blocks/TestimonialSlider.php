<?php
namespace EssentialBlocks\Pro\Blocks;

use EssentialBlocks\Core\Block;

class TestimonialSlider extends Block
{
    protected $is_pro           = true;
    protected $editor_styles    = 'essential-blocks-pro-editor-style';
    protected $frontend_scripts = [ 'essential-blocks-pro-testimonial-slider-frontend', 'essential-blocks-slickjs' ];
    protected $frontend_styles  = [ 'essential-blocks-fontawesome', 'essential-blocks-slick-style', 'essential-blocks-common-style' ];

    /**
     * Unique name of the block.
     * @return string
     */
    public function get_name()
    {
        return 'pro-testimonial-slider';
    }

    /**
     * Register all other scripts
     * @return void
     */
    public function register_scripts()
    {
        wpdev_essential_blocks_pro()->assets->register(
            'testimonial-slider-frontend',
            $this->path() . '/frontend.js',
            [ 'jquery', 'essential-blocks-controls-frontend' ]
        );
    }
}
