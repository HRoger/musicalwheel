<?php

namespace EssentialBlocks\Pro\Utils;

use EssentialBlocks\Traits\HasSingletone;

class PostGrid
{
    use HasSingletone;

    public function __construct()
    {
        add_action( "eb_post_grid_search_form", [ $this, "add_search_form" ] );
    }

    public function add_search_form( $attributes )
    {
        $show_search        = isset( $attributes[ 'showSearch' ] ) ? $attributes[ 'showSearch' ] : false;
        $enable_ajax_search = isset( $attributes[ 'enableAjaxSearch' ] ) ? $attributes[ 'enableAjaxSearch' ] : false;
        if ( $show_search ) {
            Helper::views( 'post-partials/search-form', [
                'show_search'        => $show_search,
                'enable_ajax_search' => $enable_ajax_search
             ] );
        }
    }
}
