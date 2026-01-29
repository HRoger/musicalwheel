<?php
namespace EssentialBlocks\Pro\Blocks;

use EssentialBlocks\Blocks\Form;
use EssentialBlocks\Utils\Helper;

use EssentialBlocks\Pro\Blocks\DateTimePicker;
use EssentialBlocks\Pro\Blocks\Recaptcha;
use EssentialBlocks\Pro\Blocks\MultistepWrapper;
use EssentialBlocks\Pro\Blocks\CountryField;
use EssentialBlocks\Pro\Blocks\PhoneField;

class ProForm extends Form {
    /**
     * Initialize the InnerBlocks for Accordion
     * @return array
     */
    public function inner_blocks() {
        return array_merge(parent::inner_blocks(), [
            DateTimePicker::get_instance(),
            Recaptcha::get_instance(),
            MultistepWrapper::get_instance(),
            CountryField::get_instance(),
			PhoneField::get_instance()
        ]);
    }
}