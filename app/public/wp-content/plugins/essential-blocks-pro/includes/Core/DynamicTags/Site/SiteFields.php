<?php
namespace EssentialBlocks\Pro\Core\DynamicTags\Site;

use EssentialBlocks\Traits\HasSingletone;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class SiteFields {
    use HasSingletone;

    public function __construct() {
        add_filter( "essential-blocks-pro/site/fields", [$this, 'get_fields'], 1 );
    }

    public static function get_fields( $fields = [] ) {
        $fields[] =  [
			'label' => __("Site","essential-blocks-pro"),
			'options' => [
				[
					'label' => __('Site Tagline', 'essential-blocks-pro'),
					'value' => 'site-tagline',
					'type'  => 'text',
				],
				[
					'label' => __('Site Title', 'essential-blocks-pro'),
					'value' => 'site-title',
					'type'  => 'text',
				],
				[
					'label' => __('Site URL', 'essential-blocks-pro'),
					'value' => 'site-url',
					'type'  => 'url',
				],
			]
		];

		return $fields;
    }

    public static function get_values( $field ) {

        switch ( $field ) {
            case 'site-tagline':
                return self::get_site_tagline();
            case 'site-title':
                return self::get_site_title();
            case 'site-url':
                return self::get_site_url();
            default:
                return __( 'The field doesn\'t exists.', 'essential-blocks-pro' );
        }
    }

    /**
     * Function for getting site tagline
     *
     * @return string site tagline
     */
    public static function get_site_tagline() {
        return wp_kses_post( get_bloginfo( 'description' ) );
    }

    /**
     * Function for getting site-title.
     *
     * @return string site title
     */
    public static function get_site_title() {
        return wp_kses_post( get_bloginfo( 'title' ) );
    }

    /**
     * Function for getting the site URL.
     *
     * @return string site url
     */
    public static function get_site_url() {
        return get_bloginfo( 'url' );
    }
}
