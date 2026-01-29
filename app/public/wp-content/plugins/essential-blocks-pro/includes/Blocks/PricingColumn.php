<?php
namespace EssentialBlocks\Pro\Blocks;

use EssentialBlocks\Core\Block;

class PricingColumn extends Block
{
    protected $is_pro = true;

    /**
     * Initialize the InnerBlocks for Accordion
     * @return array<Block>
     */
    public function inner_blocks()
    {
        return [
            PricingCell::get_instance()
         ];
    }

    /**
     * Unique name of the block.
     * @return string
     */
    public function get_name()
    {
        return 'pro-pricing-column';
    }
}
