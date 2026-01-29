<?php
namespace EssentialBlocks\Pro\Blocks;

use EssentialBlocks\Core\Block;

class MultistepWrapper extends Block
{
    protected $is_pro           = true;
    protected $editor_styles    = 'essential-blocks-pro-editor-style';
    protected $frontend_styles  = [ 'essential-blocks-fontawesome', ];

    /**
     * Unique name of the block.
     * @return string
     */
    public function get_name()
    {
        return 'form-multistep-wrapper';
    }
}