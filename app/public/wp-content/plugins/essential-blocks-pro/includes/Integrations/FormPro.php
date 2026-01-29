<?php
namespace EssentialBlocks\Pro\Integrations;

use EssentialBlocks\Pro\Utils\Helper;
use EssentialBlocks\Pro\Utils\FormBlockHandler;
use EssentialBlocks\Pro\Utils\CountryHelper;
use EssentialBlocks\Integrations\ThirdPartyIntegration;
use EssentialBlocks\Integrations\Form;

class FormPro extends ThirdPartyIntegration
{
    /**
     * Base URL for Adv Search
     * @var string
     */

    public function __construct()
    {
        $this->add_ajax( [
            'get_mailchimp_list'    => [
                'callback' => 'mailchimp_list',
                'public'   => false
             ],
            'export_csv'            => [
                'callback' => 'export_csv_callback',
                'public'   => false
             ],
            'eb_form_validate_step' => [
                'callback' => 'eb_form_validate_step_callback',
                'public'   => true
             ]
         ] );

        // Add filter to handle pro field sanitization
        add_filter( 'eb_form_handle_response_data', [ $this, 'handle_pro_field_sanitization' ], 10, 2 );
    }

    /**
     * Search query
     */
    public function mailchimp_list()
    {
        if ( ! wp_verify_nonce( $_POST[ 'admin_nonce' ], 'eb-pro-admin-nonce' ) ) {
            die( esc_html__( 'Nonce did not match', 'essential-blocks-pro' ) );
        }

        if ( ! current_user_can( 'edit_posts' ) ) {
            wp_send_json_error( __( 'You are not authorized!', 'essential-blocks-pro' ) );
        }

        $mailchimpApi = Helper::get_mailchimp_api();
        if ( strlen( $mailchimpApi ) === 0 ) {
            wp_send_json_error( 'api' );
        }
        $mailchimpList = FormBlockHandler::get_mailchimp_lists( $mailchimpApi );

        if ( is_array( $mailchimpList ) && count( $mailchimpList ) > 0 ) {
            wp_send_json_success( $mailchimpList );
        } else {
            wp_send_json_error( 'list' );
        }
    }

    /**
     * Search query
     */
    public function export_csv_callback()
    {
        if ( ! wp_verify_nonce( $_GET[ 'admin_nonce' ], 'eb-pro-admin-nonce' ) ) {
            die( esc_html__( 'Nonce did not match', 'essential-blocks-pro' ) );
        }

        if ( ! isset( $_GET[ 'form_id' ] ) ) {
            die( esc_html__( 'Invalid Form Id!', 'essential-blocks-pro' ) );
        }

        if ( ! current_user_can( 'activate_plugins' ) ) {
            wp_send_json_error( __( 'You are not authorized!', 'essential-blocks-pro' ) );
        }

        $title   = Helper::get_form_title( $_GET[ 'form_id' ] );
        $columns = Helper::get_form_columns( $_GET[ 'form_id' ] );
        $data    = Helper::form_response_table_data( $_GET[ 'form_id' ] );

        $result = Helper::prepare_csv_data( $data, $columns );

        echo json_encode( (object) [
            'title' => $title,
            'data'  => $result
         ] );
        wp_die();
    }

    /**
     * Step validation
     */
    public function eb_form_validate_step_callback()
    {
        if ( ! isset( $_POST[ 'form_id' ] ) || ! isset( $_POST[ 'nonce' ] ) ) {
            die( esc_html__( 'Invalid Data', 'essential-blocks-pro' ) );
        }
        if ( ! wp_verify_nonce( $_POST[ 'nonce' ], $_POST[ 'form_id' ] . '-nonce' ) ) {
            die( esc_html__( 'Nonce did not match', 'essential-blocks-pro' ) );
        }
        if ( ! isset( $_POST[ 'step_data' ] ) || ! is_object( json_decode( wp_unslash( $_POST[ 'step_data' ] ) ) ) ) {
            die( esc_html__( 'Invalid Request!', 'essential-blocks-pro' ) );
        }

        if ( ! isset( $_POST[ 'step' ] ) ) {
            wp_send_json_error( 'Invalid Step' );
        }

        $success          = false;
        $response_message = "Step isn't complete!";

        $form_id = sanitize_key( $_POST[ 'form_id' ] );

        $step = intval( $_POST[ 'step' ] );
        // Get step ID if provided
        $step_id = isset( $_POST[ 'step_id' ] ) ? sanitize_text_field( $_POST[ 'step_id' ] ) : '';

        $stepfields    = (array) json_decode( wp_unslash( $_POST[ 'step_data' ] ) );
        $all_form_data = (array) json_decode( wp_unslash( $_POST[ 'all_form_data' ] ) );

        $settings = Form::get_form_settings( $form_id );

        $field_settings = [  ];

        if ( is_object( $settings ) ) {
            $field_settings = isset( $settings->settings ) ? unserialize( $settings->settings ) : [  ];
        }

        $stepfields = apply_filters( 'eb_form_before_validation', $stepfields, $field_settings );

        $success          = false;
        $response_message = "Step isn't complete!";

        if ( is_object( $settings ) ) {
            // Safely access settings properties
            $field_settings = [  ];
            if ( isset( $settings->settings ) && is_string( $settings->settings ) ) {
                $field_settings = unserialize( $settings->settings );
                if ( ! is_array( $field_settings ) ) {
                    $field_settings = [  ];
                }
            }

            // Validate Form
            $is_validate = true;
            if ( isset( $field_settings[ 'validationRules' ] ) ) {
                $rules      = (array) $field_settings[ 'validationRules' ];
                $validation = Form::form_validation( $stepfields, $rules );

                if ( is_array( $validation ) ) {
                    if ( isset( $validation[ 'data' ] ) && isset( $validation[ 'success' ] ) && $validation[ 'success' ] === false ) {
                        $is_validate      = false;
                        $response_message = [
                            'message'    => "Validation Failed! Please check the error messages.",
                            'validation' => $validation[ 'data' ]
                         ];
                        if ( isset( $field_settings[ 'messages' ] ) ) {
                            $messages = (array) $field_settings[ 'messages' ];
                            if ( isset( $messages[ 'validationError' ] ) && is_string( $messages[ 'validationError' ] ) ) {
                                $response_message[ 'message' ] = $messages[ 'validationError' ];
                            }
                        }
                    }
                }
            }

            // Process conditional logic for steps if validation passes
            if ( $is_validate ) {
                // Create FormBlockHandler instance
                $form_handler = new FormBlockHandler();

                // Process multistep conditional logic
                $step_result = [  ];

                if ( isset( $field_settings[ 'conditionalLogics' ] ) ) {
                    $step_result = $form_handler->process_multistep_conditional_logic( $all_form_data, $field_settings );
                } else {
                    error_log( 'No conditional logic found in form settings' );
                }

                $success          = true;
                $response_message = [
                    'message'         => "Validation passed. Proceed to the next step.",
                    'step_visibility' => isset( $step_result[ 'step_visibility' ] ) ? $step_result[ 'step_visibility' ] : [  ]
                 ];
            }
        } else {

            // Default to success if we can't validate
            $success          = true;
            $response_message = [
                'message'         => "Proceeding to next step (no validation rules found).",
                'step_visibility' => [  ]
             ];
        }

        if ( $success ) {
            wp_send_json_success( $response_message );
        } else {
            wp_send_json_error( $response_message );
        }
    }

    /**
     * Handle pro field sanitization
     *
     * @param array $updated_fields The processed fields
     * @param array $settings The form settings
     * @return array Modified fields with pro field sanitization
     */
    public function handle_pro_field_sanitization( $updated_fields, $settings )
    {
        if ( ! is_array( $settings ) || count( $settings ) === 0 ) {
            return $updated_fields;
        }

        foreach ( $settings as $index => $item ) {
            $type = isset( $item->type ) && is_string( $item->type ) ? $item->type : 'text';

            // Handle phone field sanitization
            if ( $type === 'phone' && isset( $updated_fields[ $index ] ) ) {
                $updated_fields[ $index ] = CountryHelper::sanitize_phone_number( $updated_fields[ $index ] );
            }
        }

        return $updated_fields;
    }
}
