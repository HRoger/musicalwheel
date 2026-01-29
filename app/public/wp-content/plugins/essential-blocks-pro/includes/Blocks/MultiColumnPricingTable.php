<?php
namespace EssentialBlocks\Pro\Blocks;

use EssentialBlocks\Core\Block;

use function PHPSTORM_META\map;

class MultiColumnPricingTable extends Block
{
    protected $is_pro           = true;
    protected $editor_styles    = 'essential-blocks-pro-editor-style';
    protected $frontend_scripts = [ 'essential-blocks-pro-multicolumn-pricing-frontend' ];

    /**
     * Register all other scripts
     * @return void
     */
    public function register_scripts()
    {

        wpdev_essential_blocks_pro()->assets->register(
            'multicolumn-pricing-frontend',
            $this->path() . '/frontend.js',
            ['essential-blocks-controls-frontend']
        );
    }

    /**
     * Unique name of the block.
     * @return string
     */
    public function get_name()
    {
        return 'pro-multicolumn-pricing-table';
    }

    /**
     * Initialize the InnerBlocks for Accordion
     * @return array<Block>
     */
    public function inner_blocks()
    {
        return [
            PricingColumn::get_instance()
         ];
    }

}
