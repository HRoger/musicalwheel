<?php
namespace EssentialBlocks\Pro\Integrations;

use Error;
use EssentialBlocks\Integrations\ThirdPartyIntegration;
use EssentialBlocks\Pro\Utils\Helper;

class FancyChart extends ThirdPartyIntegration {
    /**
     * Base URL for Adv Search
     * @var string
     */

    public function __construct() {
        $this->add_ajax( [
            'fancy_chart_get_transient'   => [
                'callback' => 'get_transient',
                'public'   => true
            ],
            'fancy_chart_set_transient' => [
                'callback' => 'set_transient',
                'public'   => true
            ],
            'fancy_chart_frontend_ajax' => [
                'callback' => 'frontend_google_sheet_data',
                'public'   => true
            ]
        ] );
    }

    /**
     * set transient for fancy chart google sheet
     */
    public function set_transient() {
        if ( ! wp_verify_nonce( $_POST['fancy_chart_nonce'], "eb-fancy-chart-nonce" ) ) {
            die( esc_html__( 'Nonce did not match', 'essential-blocks-pro' ) );
        }

        if(empty($_POST['sheet_data'])) {
            return;
        }

        $key = 'fancy_chart_sheet_data_' . $_POST['block_id'];
        $data = json_decode(wp_unslash($_POST['sheet_data']));
        $timing = (int) $_POST['data_cache_timing'] * 60;

        if (set_transient($key, $data, $timing)) {
            wp_send_json_success(array('message' => 'Data processed successfully.'));
        } else {
            wp_send_json_error(array('message' => 'Failed to process data.'));
        }

        wp_die();
    }

    public function get_transient() {
        if ( ! wp_verify_nonce( $_POST['fancy_chart_nonce'], "eb-fancy-chart-nonce" ) ) {
            die( esc_html__( 'Nonce did not match', 'essential-blocks-pro' ) );
        }

        $args = isset($_POST['args']) ? json_decode( stripslashes( $_POST['args'] ), true ) : array();

        self::update_google_sheet_data($args);
        wp_die();
    }

    public function frontend_google_sheet_data() {
        if ( ! wp_verify_nonce( $_POST['fancy_chart_nonce'], "eb-fancy-chart-nonce" ) ) {
            die( esc_html__( 'Nonce did not match', 'essential-blocks-pro' ) );
        }

        $args = isset($_POST['args']) ? json_decode( stripslashes( $_POST['args'] ), true ) : array();

        // Extract variables from the array
        extract($args);

        if( $post_id && $block_id ) {
            $post = get_post( $post_id );
            $parse_content = parse_blocks($post->post_content );
            $args = [];
            foreach ($parse_content  as $item) {
                if (isset($item['attrs']) && isset($item['attrs']['blockId']) && $item['attrs']['blockId'] === $block_id) {
                    $args['google_sheet_api_key'] = $item['attrs']['googleSheetApiKey'];
                    $args['google_sheet_id'] = $item['attrs']['googleSheetId'];
                    $args['google_sheet_name'] = $item['attrs']['googleSheetName'];
                    $args['cache_timing'] = isset($item['attrs']['dataCacheTime']) ? $item['attrs']['dataCacheTime'] : '60';
                    $args['use_header'] = isset($item['attrs']['useAsCategoryDataset']) ? $item['attrs']['useAsCategoryDataset'] : true;
                }
            }
            $args['block_id'] = $block_id;

            self::update_google_sheet_data($args);
        }

        wp_die();
    }

    private static function update_google_sheet_data($args) {
         // Extract variables from the array
         extract($args);

        $transient_key = 'fancy_chart_sheet_data_' . $block_id;
        $timing = (int) $cache_timing * 60;

        $results = get_transient( $transient_key );

        if( empty($results) ) {
            $connection = wp_remote_get( "https://sheets.googleapis.com/v4/spreadsheets/{$google_sheet_id}/values/{$google_sheet_name}?key={$google_sheet_api_key}", [ 'timeout' => 70 ] );

            if ( ! is_wp_error( $connection ) ) {
                $connection = json_decode( wp_remote_retrieve_body( $connection ), true );
                if(isset($connection['values'])) {
                    set_transient( $transient_key,  $connection['values'], $timing);
                    $data = Helper::populate_google_sheet_data($connection['values'],$use_header);
                    wp_send_json_success($data);
                }
            }
        } else {
            $data = Helper::populate_google_sheet_data($results,$use_header);
            wp_send_json_success($data);
        }
    }
}