<?php
namespace EssentialBlocks\Pro\Integrations;
use EssentialBlocks\Integrations\ThirdPartyIntegration;
use EssentialBlocks\Pro\Utils\Helper;

class DataTable extends ThirdPartyIntegration {

    public function __construct() {
        $this->add_ajax( [
            'eb_data_table_post_meta' => [
                'callback' => 'get_post_data_table_meta',
                'public'   => true
            ],
            'data_table_set_transient' => [
                'callback' => 'set_transient',
                'public'   => true
            ],
            'data_table_get_transient'   => [
                'callback' => 'get_transient',
                'public'   => true
            ],
            'data_table_frontend_ajax' => [
                'callback' => 'frontend_google_sheet_data',
                'public'   => true
            ]
        ] );
    }

    /**
     * regenerate_assets
     */
    public function get_post_data_table_meta() {

        /**
         * Nonce verification
         */
        if ( isset( $_POST['data_table_nonce'] ) && ! wp_verify_nonce( sanitize_key( $_POST['data_table_nonce'] ), 'eb-data-table-nonce' ) ) {
            die( esc_html__( 'Nonce did not match', 'essential-blocks-pro' ) );
        }

        if ( empty( $_POST ) ) {
            $response_data = ['messsage' => __( 'No post meta data found!', 'essential-blocks-pro' )];
            wp_send_json_error( $response_data );
        }

        $post_id  = '';
        $block_id = '';
        if ( isset( $_POST['post_id'] ) ) {
            $post_id   = trim( $_POST['post_id'] );
            $block_id  = trim( $_POST['block_id'] );
            $post_meta = get_post_meta( $post_id, "_eb_data_table", true );
            if ( ! empty( $post_meta ) && $post_meta ) {
                $block_data = json_decode( $post_meta );
                wp_send_json_success( $block_data );
            } else {
                wp_send_json_error( esc_html__( "No data found", "essential-blocks-pro" ) );
            }
        } else {
            wp_send_json_error( esc_html__( "Post ID not found", "essential-blocks-pro" ) );
        }
    }
    /**
     * set transient for fancy chart google sheet
     */
    public function set_transient() {
        if ( ! wp_verify_nonce( $_POST['data_table_nonce'], "eb-data-table-nonce" ) ) {
            die( esc_html__( 'Nonce did not match', 'essential-blocks-pro' ) );
        }

        if(empty($_POST['sheet_data'])) {
            return;
        }

        $key = 'data_table_sheet_data_' . $_POST['block_id'];
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
        if ( ! wp_verify_nonce( $_POST['data_table_nonce'], "eb-data-table-nonce" ) ) {
            die( esc_html__( 'Nonce did not match', 'essential-blocks-pro' ) );
        }

        $args = isset($_POST['args']) ? json_decode( stripslashes( $_POST['args'] ), true ) : array();

        self::update_google_sheet_data($args);
        wp_die();
    }

    private static function update_google_sheet_data($args) {
        // Extract variables from the array
        extract($args);

       $transient_key = 'data_table_sheet_data_' . $block_id;
       $timing = (int) $cache_timing * 60;

       $results = get_transient( $transient_key );
       
       if( empty($results) ) {
           $connection = wp_remote_get( "https://sheets.googleapis.com/v4/spreadsheets/{$google_sheet_id}/values/{$google_sheet_name}?key={$google_sheet_api_key}", [ 'timeout' => 70 ] );

           if ( ! is_wp_error( $connection ) ) {
               $connection = json_decode( wp_remote_retrieve_body( $connection ), true );
               
               if(isset($connection['values'])) {
                   set_transient( $transient_key,  $connection['values'], $timing);
                   $data = Helper::populate_data_table_google_sheet($connection['values'],$useGoogleAsColumn);
                   wp_send_json_success($data);
               }
           }
       } else {
           $data = Helper::populate_data_table_google_sheet($results,$useGoogleAsColumn);
           wp_send_json_success($data);
       }
   }

   public function frontend_google_sheet_data() {
    if ( ! wp_verify_nonce( $_POST['data_table_nonce'], "eb-data-table-nonce" ) ) {
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
                $args['google_sheet_api_key'] = $item['attrs']['googleApiKey'];
                $args['google_sheet_id'] = $item['attrs']['googleSheetId'];
                $args['google_sheet_name'] = $item['attrs']['googleSheetRange'];
                $args['cache_timing'] = isset($item['attrs']['dataCacheTime']) ? $item['attrs']['dataCacheTime'] : '60';
                $args['useGoogleAsColumn'] = isset($item['attrs']['useGoogleAsColumn']) ? $item['attrs']['useGoogleAsColumn'] : true;
            }
        }
        $args['block_id'] = $block_id;

        self::update_google_sheet_data($args);
    }

    wp_die();
}
}
