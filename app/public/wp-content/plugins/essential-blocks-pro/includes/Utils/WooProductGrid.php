<?php
namespace EssentialBlocks\Pro\Utils;

use EssentialBlocks\Pro\Utils\Helper;
use EssentialBlocks\Traits\HasSingletone;

class WooProductGrid {
    use HasSingletone;
    public function __construct() {
        add_action( 'wp_enqueue_scripts', [$this, 'add_script'] );
        add_action( 'eb_woo_product_grid_taxonomy_filter', [$this, 'taxonomy_filter'] );
        add_filter( 'eb_frontend_scripts/woo-product-grid', [$this, 'add_pro_script_args'], 99, 1 );
        add_filter( 'eb_woo_product_grid_grid_sequence', [$this, 'add_pro_grid_sequence'], 99, 4 );
        add_filter( 'eb_woo_product_grid_list_sequence', [$this, 'add_pro_list_sequence'], 99, 4 );
    }

    public function taxonomy_filter( $essentialAttr ) {
        /**
         * Category Filter Views
         */
        $showTaxonomyFilter    = $essentialAttr['showTaxonomyFilter'];
        $selectedTaxonomy      = $essentialAttr['selectedTaxonomy'];
        $selectedTaxonomyItems = $essentialAttr['selectedTaxonomyItems'];
        $helper                = new Helper;

        if ( $showTaxonomyFilter && ! empty( $selectedTaxonomy ) && ! empty( $selectedTaxonomyItems ) ) {
            $selectedTaxonomy = json_decode( $selectedTaxonomy );
            $categories       = json_decode( $selectedTaxonomyItems );
            $helper::views(
                'woocommerce/category-filter',
                [
                    'taxonomy'      => $selectedTaxonomy->value,
                    'categories'    => $categories,
                    'essentialAttr' => $essentialAttr
                ]
            );
        }
    }

    public function add_script() {
        wpdev_essential_blocks_pro()->assets->register(
            'woo-product-grid-frontend',
            ESSENTIAL_BLOCKS_PRO_URL . "assets/blocks/woo-product-grid/frontend.js",
            [ 'essential-blocks-woo-product-grid-frontend', 'essential-blocks-pro-vendor-bundle' ]
        );
    }

    public function add_pro_script_args( $script ) {
        return array_merge( $script, ['essential-blocks-pro-woo-product-grid-frontend'] );
    }

    public function add_pro_grid_sequence( $grid_sequence, $helper, $product, $otherArgs ) {
        $helper                  = new Helper;
        $showSoldCount           = $otherArgs['showSoldCount'];
        $showSoldCountBar        = $otherArgs['showSoldCountBar'];
        $soldCountPrefix         = $otherArgs['soldCountPrefix'];
        $soldCountSuffix         = $otherArgs['soldCountSuffix'];
        $stockPercent            = $otherArgs['stockPercent'];
        $soldCount['sold_count'] = function () use ( $helper, $product, $showSoldCount, $showSoldCountBar, $soldCountPrefix, $soldCountSuffix, $stockPercent ) {
            if ( $showSoldCount ) {
                $helper::views(
                    'woocommerce/sold-count',
                    [
                        'product'          => $product,
                        'showSoldCount'    => $showSoldCount,
                        'showSoldCountBar' => $showSoldCountBar,
                        'soldCountPrefix'  => $soldCountPrefix,
                        'soldCountSuffix'  => $soldCountSuffix,
                        'stockPercent'     => $stockPercent
                    ]
                );
            }
        };

        $grid_sequence = $helper::array_insert_after( $grid_sequence, 'price', $soldCount, true );

        return $grid_sequence;
    }

    public function add_pro_list_sequence( $list_sequence, $helper, $product, $otherArgs ) {
        $helper                  = new Helper;
        $showSoldCount           = $otherArgs['showSoldCount'];
        $showSoldCountBar        = $otherArgs['showSoldCountBar'];
        $soldCountPrefix         = $otherArgs['soldCountPrefix'];
        $soldCountSuffix         = $otherArgs['soldCountSuffix'];
        $stockPercent            = $otherArgs['stockPercent'];
        $soldCount['sold_count'] = function () use ( $helper, $product, $showSoldCount, $showSoldCountBar, $soldCountPrefix, $soldCountSuffix, $stockPercent ) {
            if ( $showSoldCount ) {
                $helper::views(
                    'woocommerce/sold-count',
                    [
                        'product'          => $product,
                        'showSoldCount'    => $showSoldCount,
                        'showSoldCountBar' => $showSoldCountBar,
                        'soldCountPrefix'  => $soldCountPrefix,
                        'soldCountSuffix'  => $soldCountSuffix,
                        'stockPercent'     => $stockPercent
                    ]
                );
            }
        };

        $list_sequence = $helper::array_insert_after( $list_sequence, 'rating', $soldCount, true );

        return $list_sequence;
    }
}
