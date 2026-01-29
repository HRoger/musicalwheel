<?php
namespace EssentialBlocks\Pro\Blocks;

use EssentialBlocks\Core\Block;
use EssentialBlocks\Pro\Utils\Helper;

class Recaptcha extends Block
{
    protected $is_pro           = true;
    protected $editor_styles    = 'essential-blocks-pro-editor-style';
    protected $frontend_scripts = [ 'essential-blocks-pro-recaptcha-frontend' ];

    /**
     * Unique name of the block.
     * @return string
     */
    public function get_name()
    {
        return 'form-recaptcha';
    }

    /**
     * Register all other scripts
     * @return void
     */
    public function register_scripts()
    {
        wpdev_essential_blocks_pro()->assets->register(
            'recaptcha-frontend',
            $this->path() . '/frontend.js',
            [ 'essential-blocks-pro-recaptcha' ]
        );
    }

    /**
     * Block render callback.
     *
     * @param mixed $attributes
     * @param mixed $content
     * @return mixed
     */
    public function render_callback( $attributes, $content )
    {
        if ( is_admin() ) {
            return;
        }

        $className = isset( $attributes[ "className" ] ) ? $attributes[ "className" ] : "";
        $classHook = isset( $attributes[ 'classHook' ] ) ? $attributes[ 'classHook' ] : '';

        $recaptchaSettings = Helper::get_recaptcha_settings();
        $recaptchaType     = isset( $recaptchaSettings->recaptchaType ) ? $recaptchaSettings->recaptchaType : '';
        $recaptchaSiteKey  = isset( $recaptchaSettings->siteKey ) ? $recaptchaSettings->siteKey : '';

        ob_start();
        Helper::views( 'recaptcha', array_merge( $attributes, [
            'className' => $className,
            'classHook' => $classHook,
            'siteKey'   => $recaptchaSiteKey,
            'type'      => $recaptchaType
         ] ) );

        return ob_get_clean();
    }
}
