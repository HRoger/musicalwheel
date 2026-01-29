<?php
namespace EssentialBlocks\Pro\Blocks;

use WP_Query;
use EssentialBlocks\Core\Block;
use EssentialBlocks\API\Product;
use EssentialBlocks\Pro\Utils\Helper;

class WooProductCarousel extends Block
{
    protected $is_pro           = true;
    protected $frontend_styles  = [ 'essential-blocks-slick-style', 'essential-blocks-fontawesome', 'essential-blocks-common-style' ];
    protected $frontend_scripts = [ 'essential-blocks-pro-woo-product-carousel-frontend', 'essential-blocks-slickjs' ];

    /**
     * Unique name of the block.
     * @return string
     */
    public function get_name()
    {
        return 'pro-woo-product-carousel';
    }

    /**
     * Register all other scripts
     * @return void
     */
    public function register_scripts()
    {

        wpdev_essential_blocks_pro()->assets->register(
            'woo-product-carousel-frontend',
            $this->path() . '/frontend.js',
        );
    }

    public function get_array_column( $data, $handle )
    {
        $_no_error = true;
        if ( ! is_array( $data ) ) {
            $data      = json_decode( $data, true );
            $_no_error = json_last_error() === JSON_ERROR_NONE;
        }

        return $_no_error ? array_column( $data, $handle ) : $data;
    }

    /**
     * Render Callback
     *
     * @param mixed $attributes
     * @param mixed $content
     * @return void|string
     */
    public function render_callback( $attributes, $content )
    {
        if ( ! function_exists( '\WC' ) || is_admin() ) {
            return;
        }

        $_essential_attributes = [
            'carouselPreset'   => 'preset-1',
            'saleBadgeAlign'   => 'align-left',
            'saleText'         => 'sale',
            'showRating'       => true,
            'ratingStyle'      => 'star',
            'showPrice'        => true,
            'showSaleBadge'    => true,
            'showCategory'     => false,
            'isCustomCartBtn'  => false,
            'simpleCartText'   => esc_html__( 'Buy Now', 'essential-blocks-pro' ),
            'variableCartText' => esc_html__( 'Select Options', 'essential-blocks-pro' ),
            'groupedCartText'  => esc_html__( 'View Products', 'essential-blocks-pro' ),
            'externalCartText' => esc_html__( 'Buy Now', 'essential-blocks-pro' ),
            'defaultCartText'  => esc_html__( 'Read More', 'essential-blocks-pro' ),
            'buttonText'       => esc_html__( "View Product", 'essential-blocks-pro' ),
            'dotPreset'        => 'dot-style-default',
            'adaptiveHeight'   => true,
            'imageSize'        => 'full',
            'sectionTitle'     => __( "Popular Products", "essential-blocks-pro" ),
            'ratingStyle'      => 'star',
            'showBlockContent' => true,
			'titleTag'         => 'h3',
         ];

        $_essential_attrs = [  ];
        array_walk( $_essential_attributes, function ( $value, $key ) use ( $attributes, &$_essential_attrs ) {
            $_essential_attrs[ $key ] = isset( $attributes[ $key ] ) ? $attributes[ $key ] : $value;
        } );

        $_slider_settings = [
            'centerMode'          => $_essential_attrs[ 'carouselPreset' ] == 'preset-2' ? true : false,
            'arrows'              => true,
            'dots'                => true,
            'autoplaySpeed'       => 3000,
            'speed'               => 500,
            'autoplay'            => true,
            'infinite'            => true,
            'pauseOnHover'        => true,
            'slideToShowRange'    => 3,
            'TABslideToShowRange' => 2,
            'MOBslideToShowRange' => 1,
            'carouselPreset'      => "preset-1"
         ];

        $_slider_controls = [  ];
        array_walk( $_slider_settings, function ( $value, $key ) use ( $attributes, &$_slider_controls ) {
            $_slider_controls[ $key ] = isset( $attributes[ $key ] ) ? $attributes[ $key ] : $value;
        } );

        if ( isset( $_essential_attrs[ 'showBlockContent' ] ) && $_essential_attrs[ 'showBlockContent' ] === false ) {
            return;
        }

        $args       = isset( $attributes[ 'queryData' ] ) ? $attributes[ 'queryData' ] : [  ];
        $query_type = isset( $args[ 'query_type' ] ) ? $args[ 'query_type' ] : 'custom_query';

        $_normalize = [
            'orderby'         => 'date',
            'order'           => 'desc',
            'category'        => [  ],
            'tag'             => [  ],
            'include'         => [  ],
            'exclude'         => [  ],
            'excludeCategory' => [  ],
            'excludeTag'      => [  ]
         ];

        foreach ( $_normalize as $key => $value ) {
            $args[ $key ] = ! empty( $args[ $key ] ) ? implode( ',', $this->get_array_column( $args[ $key ], 'value' ) ) : $value;
        }

        $args = wp_parse_args( $args, [
            'per_page' => 10,
            'offset'   => 0
         ] );

        if ( "related_products" === $query_type ) {
            $product          = json_decode( $args[ "product" ], true );
            $product_id       = isset( $product[ "value" ] ) && "current" !== $product[ "value" ] ? $product[ "value" ] : get_the_ID();
            $per_page         = $args[ 'per_page' ];
            $exclude_products = isset( $args[ 'exclude_products' ] ) ? Helper::get_value_from_json_array( json_decode( $args[ 'exclude_products' ], true ) ) : [  ];
            $related_products = wc_get_related_products( $product_id, $args[ 'per_page' ], $exclude_products );
            unset( $args );
            $args[ 'post__in' ] = is_array( $related_products ) && count( $related_products ) > 0 ? $related_products : [  ];
            $args[ 'per_page' ] = $per_page;
        }

        $query = new WP_Query( Product::query_builder( $args ) );

        $blockId   = isset( $attributes[ "blockId" ] ) ? $attributes[ "blockId" ] : "";
        $classHook = isset( $attributes[ "classHook" ] ) ? $attributes[ "classHook" ] : "";

        ob_start();

        Helper::views( 'product-carousel', array_merge( $attributes, [
            'blockId'        => $blockId,
            'classHook'      => $classHook,
            'query'          => $query,
            'essentialAttr'  => $_essential_attrs,
            'sliderSettings' => $_slider_controls,
            'queryData'      => $args
         ] ) );

        return ob_get_clean();
    }
}