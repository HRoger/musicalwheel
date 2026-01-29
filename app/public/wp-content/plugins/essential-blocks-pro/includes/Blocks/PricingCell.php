<?php
namespace EssentialBlocks\Pro\Blocks;

use EssentialBlocks\Core\Block;

class PricingCell extends Block
{
    protected $is_pro = true;
    /**
     * Unique name of the block.
     * @return string
     */
    public function get_name()
    {
        return 'pro-pricing-cell';
    }
}
