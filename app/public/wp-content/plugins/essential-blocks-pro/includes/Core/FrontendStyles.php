<?php
namespace EssentialBlocks\Pro\Core;

use EssentialBlocks\Traits\HasSingletone;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class FrontendStyles
{
    use HasSingletone;

    protected $blocks_style = [
        'post-grid',
        'woo-product-grid',
        'countdown',
        'image-gallery',
		'form'
     ];

    protected $blocks_script = [
        'post-grid',
        'image-gallery',
		'form'
     ];

    public function __construct()
    {
        foreach ( $this->blocks_style as $block ) {
            add_filter( "eb_fixed_frontend_styles/{$block}", [ $this, 'handle_frontend_style' ], 99, 2 );
        }

        foreach ( $this->blocks_script as $block ) {
            add_filter( "eb_frontend_scripts/{$block}", function ( $scripts ) use ( $block ) {
                return $this->handle_frontend_scripts( $scripts, $block );
            }, 99, 2 );
        }
    }

    /**
     * Generic handler for all blocks to load styles
     *
     * @param string $blockname The block name passed by the filter.
     * @param string $css Existing CSS.
     *
     * @return string Updated CSS with file contents appended.
     */
    public function handle_frontend_style( $css, $blockname )
    {
        $filepath = 'blocks' . DIRECTORY_SEPARATOR . $blockname . DIRECTORY_SEPARATOR . 'style.css';
        $dir      = ESSENTIAL_BLOCKS_PRO_DIR_PATH . 'assets' . DIRECTORY_SEPARATOR . $filepath;

        if ( file_exists( $dir ) ) {
            return $css . file_get_contents( $dir );
        }

        return $css; // Return existing CSS if file doesn't exist
    }

    /**
     * Generic handler for all blocks to load Scripts
     *
     * @param string $scripts Existing scripts array.
     * @param string $blockname The block name passed by the filter.
     *
     * @return string Updated scripts array with new frontend scripts handler.
     */
    public function handle_frontend_scripts( $scripts, $blockname )
    {
        $filepath = 'blocks' . DIRECTORY_SEPARATOR . $blockname . DIRECTORY_SEPARATOR . 'frontend.js';
        $dir      = ESSENTIAL_BLOCKS_PRO_DIR_PATH . 'assets' . DIRECTORY_SEPARATOR . $filepath;

        if ( file_exists( $dir ) ) {
            wpdev_essential_blocks_pro()->assets->register(
                "$blockname-frontend",
                $filepath,
                [  ]
            );
            return array_merge( $scripts, [ "essential-blocks-pro-$blockname-frontend" ] );
        }

        return $scripts; // Return existing Scripts Array if file doesn't exist
    }
}