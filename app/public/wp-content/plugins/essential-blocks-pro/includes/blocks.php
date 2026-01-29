<?php

use EssentialBlocks\Pro\Blocks\OffCanvas;
use EssentialBlocks\Pro\Blocks\ProForm;
use EssentialBlocks\Pro\Blocks\DataTable;
use EssentialBlocks\Pro\Blocks\FancyChart;
use EssentialBlocks\Pro\Blocks\NewsTicker;
use EssentialBlocks\Pro\Blocks\StackedCards;
use EssentialBlocks\Pro\Blocks\AdvancedSearch;
use EssentialBlocks\Pro\Blocks\TimelineSlider;
use EssentialBlocks\Pro\Blocks\TestimonialSlider;
use EssentialBlocks\Pro\Blocks\WooProductCarousel;
use EssentialBlocks\Pro\Blocks\MultiColumnPricingTable;
use EssentialBlocks\Pro\Blocks\LoopBuilder;
use EssentialBlocks\Pro\Blocks\PostTemplate;
use EssentialBlocks\Pro\Blocks\LoopPagination;
use EssentialBlocks\Pro\Blocks\MegaMenu;
use EssentialBlocks\Pro\Blocks\MegaMenuItem;
use EssentialBlocks\Pro\Blocks\BusinessHours;

return [
    'advanced_search'           => [
        'object' => AdvancedSearch::get_instance()
     ],
    'data_table'                => [
        'object' => DataTable::get_instance()
     ],
    'timeline_slider'           => [
        'object' => TimelineSlider::get_instance()
     ],
    'news_ticker'               => [
        'object' => NewsTicker::get_instance()
     ],
    'woo_product_carousel'      => [
        'object' => WooProductCarousel::get_instance()
     ],
    'form'                      => [
        'object' => ProForm::get_instance()
     ],
    'fancy_chart'               => [
        'object' => FancyChart::get_instance()
     ],
    'multicolumn_pricing_table' => [
        'object' => MultiColumnPricingTable::get_instance()
     ],
    'stacked_cards'             => [
        'object' => StackedCards::get_instance()
     ],
    'testimonial_slider'        => [
        'object' => TestimonialSlider::get_instance()
     ],
    'off_canvas'                => [
        'object' => OffCanvas::get_instance()
     ],
    'mega_menu'                 => [
        'object' => MegaMenu::get_instance()
     ],
    'mega_menu_item'            => [
        'object' => MegaMenuItem::get_instance()
     ],
    'loop_builder'              => [
        'object' => LoopBuilder::get_instance()
     ],
    'post_template'             => [
        'object' => PostTemplate::get_instance()
     ],
    'loop_pagination'           => [
        'object' => LoopPagination::get_instance()
     ],
    'business_hours'            => [
        'object' => BusinessHours::get_instance()
     ]
 ];
