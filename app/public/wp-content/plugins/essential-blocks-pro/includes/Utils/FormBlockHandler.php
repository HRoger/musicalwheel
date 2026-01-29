<?php
namespace EssentialBlocks\Pro\Utils;

use EssentialBlocks\Pro\Utils\Helper;
use EssentialBlocks\Pro\Utils\CountryHelper;

class FormBlockHandler
{
    /**
     * Holds the plugin instance.
     *
     * @since 1.2.0
     * @access private
     * @static
     *
     * @var static
     */
    protected static $instances = [  ];
    /**
     * Sets up a single instance of the plugin.
     *
     * @since 1.0.0
     * @access public
     * @var mixed $args
     *
     * @static
     *
     * @return static An instance of the class.
     */
    public static function get_instance( ...$args )
    {
        if ( ! isset( self::$instances[ static::class ] ) ) {
            self::$instances[ static::class ] = ! empty( $args ) ? new static( ...$args ) : new static;
        }

        return self::$instances[ static::class ];
    }

    public function __construct()
    {
        add_action( 'eb_form_data_validation', [ $this, 'validation_rules' ], 10, 5 );
        add_filter( 'eb_form_confirmation_div_attr', [ $this, 'confirmation_div_attr' ], 10, 2 );
        add_action( 'eb_form_submit_after_email', [ $this, 'form_submit_actions' ], 10, 4 );
        add_action( 'eb_form_block_integrations', [ $this, 'form_integrations' ], 10, 3 );
        add_action( 'eb_form_steps_button_html', [ $this, 'steps_button_html' ], 10, 1 );
        add_action( 'eb_form_step_indicator_html', [ $this, 'eb_form_step_indicator' ], 10, 5 );

        // Add filter to process conditional logic before form validation
        add_filter( 'eb_form_before_validation', [ $this, 'process_form_conditional_logic' ], 10, 2 );

        // Add filter to extend field sanitization for pro fields
        add_filter( 'eb_form_sanitize_field', [ $this, 'sanitize_pro_fields' ], 10, 3 );
    }

    public function validation_rules( $validation, $datarules, $data, $index, $complete_form_data = null )
    {
        error_log( 'validation_rules datarules: ' . print_r( $datarules, true ) );
        error_log( 'validation_rules data for field ' . $index . ': ' . print_r( $data, true ) );

        // Use complete form data if provided, otherwise fall back to individual field data
        $form_data_for_lookup = $complete_form_data ? $complete_form_data : [ $index => $data ];
        foreach ( $datarules as $rulesType => $rulesData ) {
            switch ( $rulesType ):
        case 'recaptcha':
            $message = "reCAPTCHA verification failed";
            if ( isset( $rulesData->message ) && is_string( $rulesData->message ) ) {
                    $message = $rulesData->message;
            }
            $isValid = $this->isValidRecaptcha( Helper::get_recaptcha_settings( 'secretKey' ), $data );
            if ( ! is_string( $data ) ) {
                $validation[ 'success' ]        = false;
                $validation[ 'data' ][ $index ] = $message;
                break 2;
            }
            break;
        case 'isCountry':
            $message = "Please select a valid country.";
            if ( isset( $rulesData->message ) && is_string( $rulesData->message ) ) {
                $message = $rulesData->message;
            }
            if ( isset( $rulesData->status ) && $rulesData->status === true ) {
                // Skip validation if field is empty and not required
                if ( empty( $data ) ) {
                    // Check if field is required by looking for isRequired rule
                    $isFieldRequired = false;
                    if ( isset( $datarules->isRequired ) && isset( $datarules->isRequired->status ) ) {
                        $isFieldRequired = $datarules->isRequired->status === true;
                    }

                    // If field is not required and empty, skip validation
                    if ( ! $isFieldRequired ) {
                        break;
                    }
                }

                $validateCountry = self::validate_country_code( $data );

                if ( ! $validateCountry ) {
                    $validation[ 'success' ]        = false;
                    $validation[ 'data' ][ $index ] = $message;
                    break 2;
                }
            }
            break;
        case 'isPhone':
            $message = "Please enter a valid phone number.";
            if ( isset( $rulesData->message ) && is_string( $rulesData->message ) ) {
                $message = $rulesData->message;
            }

            // Skip validation if field is empty and not required
            if ( empty( $data ) ) {
                // Check if field is required by looking for isRequired rule
                $isFieldRequired = false;
                if ( isset( $datarules->isRequired ) && isset( $datarules->isRequired->status ) ) {
                    $isFieldRequired = $datarules->isRequired->status === true;
                }

                // If field is not required and empty, skip validation
                if ( ! $isFieldRequired ) {
                    break;
                }
            }

            // Get country code from validation rules
            $countryCode = 'US'; // Default

            if ( $rulesData->separateCountryCode === false && isset( $rulesData->countryCode ) && is_string( $rulesData->countryCode ) ) {
                $countryCode = $rulesData->countryCode;
            } else if ( $rulesData->separateCountryCode === true ) {
                // Look for the separate country field in complete form data
                $countryFieldName = $index . '_country';

                if ( isset( $form_data_for_lookup[ $countryFieldName ] ) ) {
                    error_log( 'Country field value: ' . $form_data_for_lookup[ $countryFieldName ] );
                    if ( ! empty( $form_data_for_lookup[ $countryFieldName ] ) ) {
                        $countryCode = $form_data_for_lookup[ $countryFieldName ];
                    }
                }
            }

            error_log( 'Country code: ' . $countryCode );

            // Validate phone number
            $isValid = CountryHelper::validate_phone_number( $data, $countryCode );
            if ( ! $isValid ) {
                $validation[ 'success' ]        = false;
                $validation[ 'data' ][ $index ] = $message;
                break 2;
            }
            break;
        default:
            $validation[ 'success' ] = false;
            endswitch;
        }
        return $validation;
    }

    /**
     * Sanitize pro form fields
     *
     * @param string $value The field value
     * @param string $type The field type
     * @param string $field_name The field name
     * @return string Sanitized value
     */
    public function sanitize_pro_fields( $value, $type, $field_name )
    {
        switch ( $type ) {
            case 'phone':
                $value = CountryHelper::sanitize_phone_number( $value );
                break;
            case 'country':
                // Country field sanitization (already handled by existing system)
                $value = sanitize_text_field( $value );
                break;
            default:
                // Return original value for non-pro fields
                break;
        }
        return $value;
    }

    public function isValidRecaptcha( $secretkey, $response )
    {
        try {
            $url  = 'https://www.google.com/recaptcha/api/siteverify';
            $data = [
                'secret'   => $secretkey,
                'response' => $response,
                'remoteip' => $_SERVER[ 'REMOTE_ADDR' ]
             ];

            $options = [
                'http' => [
                    'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
                    'method'  => 'POST',
                    'content' => http_build_query( $data )
                 ]
             ];

            $context = stream_context_create( $options );
            $result  = file_get_contents( $url, false, $context );
            return json_decode( $result )->success;
        } catch ( Exception $e ) {
            return null;
        }
    }

    public function confirmation_div_attr( $attrList, $attributes )
    {
        if ( isset( $attributes[ 'confirmationType' ] ) && $attributes[ 'confirmationType' ] === 'redirect' ) {
            return array_merge( $attrList, [
                'data-redirect-url' => esc_url( $attributes[ 'redirectUrl' ] ?? '' )
             ] );
        }
        return $attrList;
    }

    public function form_submit_actions( $id, $fields, $email_success, $notification )
    {
        if ( empty( $id ) ) {
            return;
        }
        if ( $notification === 'email' ) {
            return;
        }

        $_response = [  ];
        if ( is_array( $fields ) && count( $fields ) > 0 ) {
            $_response = $fields;
        }

        global $wpdb;
        $table_name = ESSENTIAL_BLOCKS_FORM_ENTRIES_TABLE;

        $wpdb->insert(
            $table_name,
            [
                'block_id'     => $id,
                'response'     => serialize( $_response ),
                'email_status' => $email_success,
                'created_at'   => current_time( 'mysql' )
             ]
        );
    }

    /**
     * Form Integration Hook
     * @param string $id
     * @param array $fields
     * @param array $integrations
     * @return mixed
     */
    public function form_integrations( $id, $fields, $integrations )
    {
        if ( empty( $id ) ) {
            return;
        }
        //Mailchimp
        if ( isset( $integrations[ 'mailchimp' ] ) && is_object( $integrations[ 'mailchimp' ] ) ) {
            $mailchimp = $integrations[ 'mailchimp' ];
            if ( isset( $mailchimp->listId ) && strlen( $mailchimp->listId ) > 0 ) {
                $list_id = $mailchimp->listId;

                if ( ! isset( $fields[ 'email' ] ) ) {
                    return;
                }

                $api_key = Helper::get_mailchimp_api();

                $email = $fields[ 'email' ];

                $other_fields = [  ];
                if ( isset( $fields[ 'first-name' ] ) ) {
                    $other_fields[ 'FNAME' ] = $fields[ 'first-name' ];
                }
                if ( isset( $fields[ 'last-name' ] ) ) {
                    $other_fields[ 'LNAME' ] = $fields[ 'last-name' ];
                }

                $body_params = [
                    'email_address' => $email,
                    'status'        => 'subscribed'
                 ];

                // Only include 'merge_fields' in the request body if additional fields are provided.
                if ( ! empty( $other_fields ) ) {
                    $body_params[ 'merge_fields' ] = $other_fields;
                }

                $this->add_mailchimp_user( $api_key, $list_id, $email, $body_params );
            } else {
                return;
            }
        }
    }

    /**
     * Get Mailchimp list
     * @param string $api_key
     * @param string $list_id
     * @param string $email
     * @param array $body_params
     * @return void
     */
    public static function add_mailchimp_user( $api_key, $list_id, $email, $body_params )
    {
        if ( empty( $api_key ) || empty( $list_id ) ) {
            exit();
        }

        if ( preg_match( '/[^a-zA-Z0-9-]/', $api_key ) ) {
            exit();
        }

        $response = wp_remote_post(
            'https://' . substr( $api_key, strpos(
                $api_key,
                '-'
            ) + 1 ) . '.api.mailchimp.com/3.0/lists/' . $list_id . '/members/' . md5( strtolower( $email ) ),
            [
                'method'  => 'PUT',
                'headers' => [
                    'Content-Type'  => 'application/json',
                    'Authorization' => 'Basic ' . base64_encode( 'user:' . $api_key )
                 ],
                'body'    => json_encode( $body_params )
             ]
        );

        if ( ! is_wp_error( $response ) ) {
            $response = json_decode( wp_remote_retrieve_body( $response ) );
            if ( ! empty( $response ) ) {
                if ( $response->status == 'subscribed' ) {
                    return;
                } else {
                    error_log( 'Form Id: ' . $list_id . ' Mailchimp subscription failed for email: ' . $email );
                }
            }
        }
    }

    /**
     * Get Mailchimp list
     * @param string $api_key
     * @return array
     */
    public static function get_mailchimp_lists( $api_key )
    {
        $lists = [  ];

        if ( empty( $api_key ) ) {
            return $lists;
        }

        $response = wp_remote_get( 'https://' . substr( $api_key,
            strpos( $api_key, '-' ) + 1 ) . '.api.mailchimp.com/3.0/lists/?fields=lists.id,lists.name&count=1000', [
            'headers' => [
                'Content-Type'  => 'application/json',
                'Authorization' => 'Basic ' . base64_encode( 'user:' . $api_key )
             ]
         ] );

        if ( ! is_wp_error( $response ) ) {
            $response = json_decode( wp_remote_retrieve_body( $response ) );

            if ( ! empty( $response ) && ! empty( $response->lists ) ) {
                $lists[ '' ] = __( 'Select One', 'essential-blocks-pro' );

                for ( $i = 0; $i < count( $response->lists ); $i++ ) {
                    $lists[ $response->lists[ $i ]->id ] = $response->lists[ $i ]->name;
                }
            }
        }

        return $lists;
    }

    public static function steps_button_html( $attributes_only )
    {
        // previous button
        $prev_btn_icon = '';
        $prev_btn_text = isset( $attributes_only[ 'prevBtnText' ] ) ? $attributes_only[ 'prevBtnText' ] : 'Previous';
        $prev_btn_html = '';

        // next button
        $next_btn_icon = '';
        $next_btn_text = isset( $attributes_only[ 'nextBtnText' ] ) ? $attributes_only[ 'nextBtnText' ] : 'Next';
        $next_btn_html = '';

        if ( isset( $attributes_only[ 'nextPrevBtnAddIcon' ] ) && $attributes_only[ 'nextPrevBtnAddIcon' ] ) {
            $prev_icon     = isset( $attributes_only[ 'prevBtnIcon' ] ) ? $attributes_only[ 'prevBtnIcon' ] : 'fas fa-arrow-left';
            $prev_btn_icon = Helper::eb_render_icon(
                Helper::eb_get_icon_type( $prev_icon ),
                'step-button-icon',
                $prev_icon
            );

            $next_icon     = isset( $attributes_only[ 'nextBtnIcon' ] ) ? $attributes_only[ 'nextBtnIcon' ] : 'fas fa-arrow-right';
            $next_btn_icon = Helper::eb_render_icon(
                Helper::eb_get_icon_type( $next_icon ),
                'step-button-icon',
                $next_icon
            );

            $prev_btn_html = sprintf( '<button type="button" class="step-button" id="ebFormPrevBtn">%1$s %2$s</button>',
                $prev_btn_icon,
                $prev_btn_text
            );

            $next_btn_html = sprintf( '<button type="button" class="step-button" id="ebFormNextBtn">%1$s %2$s <img class="eb-form-next-loader" src="%3$sassets/images/loading.svg" /></button>',
                $next_btn_text,
                $next_btn_icon,
                ESSENTIAL_BLOCKS_URL
            );
        } else {
            $prev_btn_html = sprintf( '<button type="button" class="step-button" id="ebFormPrevBtn">%1$s</button>',
                $prev_btn_text
            );

            $next_btn_html = sprintf( '<button type="button" class="step-button" id="ebFormNextBtn">%1$s <img class="eb-form-next-loader" src="%2$sassets/images/loading.svg" /></button>',
                $next_btn_text,
                ESSENTIAL_BLOCKS_URL
            );
        }

        // Combine buttons
        $steps_button_html = $prev_btn_html . $next_btn_html;

        // Echo the HTML directly when used with do_action
        echo wp_kses_post( $steps_button_html );
    }

    public static function eb_form_step_indicator( $multistepdata, $stepNavigationStyle, $enableStepCount, $enableStepIcon, $enableStepSubtitle )
    {
        $step_navigation_style = isset( $stepNavigationStyle ) ? $stepNavigationStyle : 'progress-bar';

        if ( $multistepdata == null || $step_navigation_style === 'none' ) {
            return;
        }

        $html = '<div class="step-navigation-wrapper step-navigation-' . $step_navigation_style . '">';

        if ( $step_navigation_style !== 'progress-bar' ) {
            $html .= '<ul class="step-' . $step_navigation_style . '">';
        }

        switch ( $step_navigation_style ) {
            case 'progress-bar':
                $html .= '<div class="step-progress-bar">';
                $html .= '<div class="step-progress-bar-inner" style="width: 0%"></div>';
                $html .= '<div class="step-progress-markers">';

                foreach ( $multistepdata as $index => $step ) {
                    $active_class = ( $index === 0 ) ? 'active' : '';
                    // Fix division by zero when there's only one step
                    $position = count( $multistepdata ) > 1 ? $index * ( 100 / ( count( $multistepdata ) - 1 ) ) : 0;
                    $html .= '<div class="step-marker ' . $active_class . '" style="left: ' . $position . '%"></div>';
                }

                $html .= '</div>'; // close step-progress-markers
                $html .= '</div>'; // close step-progress-bar

                $html .= '<div class="step-progress-bottom">';
                $html .= '<div class="step-progress-title">Step</div>';
                $html .= '<div class="step-progress-count">';
                $html .= '<span class="current-step">1</span>';
                $html .= '<span class="step-separator">/</span>';
                $html .= '<span class="total-steps">' . count( $multistepdata ) . '</span>';
                $html .= '</div>'; // close step-progress-count
                $html .= '</div>'; // close step-progress-bottom

                break;

            case 'breadcrumb':
                foreach ( $multistepdata as $index => $step ) {
                    $active_class = ( $index === 0 ) ? 'active' : '';
                    $itemClass    = 'step-nav-item step-' . $step[ 'attributes' ][ 'blockId' ] . ' ' . $active_class;
                    $stepName     = isset( $step[ 'attributes' ][ 'stepName' ] ) ? $step[ 'attributes' ][ 'stepName' ] : 'Step ' . ( $index + 1 );

                    $html .= '<li class="breadcrumb-item ' . $itemClass . '">';
                    $html .= esc_html( $stepName );
                    $html .= '</li>';
                }

                break;

            case 'step-titles':
                foreach ( $multistepdata as $index => $step ) {
                    $active_class = ( $index === 0 ) ? 'active' : '';
                    $itemClass    = 'step-nav-item step-' . $step[ 'attributes' ][ 'blockId' ] . ' ' . $active_class;
                    $stepName     = isset( $step[ 'attributes' ][ 'stepName' ] ) ? $step[ 'attributes' ][ 'stepName' ] : 'Step ' . ( $index + 1 );

                    $html .= '<li class="step-title-item ' . $itemClass . '">';

                    // Check if step count should be enabled
                    if ( $enableStepCount ) {
                        $html .= '<span class="step-count">' . esc_html( $index + 1 ) . '</span>';
                    }

                    $html .= esc_html( $stepName );
                    $html .= '</li>';
                }

                break;

            case 'step-title-2':
                foreach ( $multistepdata as $index => $step ) {
                    $active_class = ( $index === 0 ) ? 'active' : '';
                    $itemClass    = 'step-nav-item step-' . $step[ 'attributes' ][ 'blockId' ] . ' ' . $active_class;
                    $stepName     = isset( $step[ 'attributes' ][ 'stepName' ] ) ? $step[ 'attributes' ][ 'stepName' ] : 'Step ' . ( $index + 1 );
                    $stepSubtitle = isset( $step[ 'attributes' ][ 'stepSubtitle' ] ) ? $step[ 'attributes' ][ 'stepSubtitle' ] : '';

                    $html .= '<li class="step-title-item ' . $itemClass . '">';
                    $html .= '<span class="step-content">';

                    // Check if step subtitle should be displayed
                    if ( $enableStepSubtitle && ! empty( $stepSubtitle ) ) {
                        $html .= '<span class="step-subtitle">' . esc_html( $stepSubtitle ) . '</span>';
                    }

                    $html .= esc_html( $stepName );
                    $html .= '</span>';
                    $html .= '<span class="step-count">' . esc_html( $index + 1 ) . '</span>';
                    $html .= '<span class="step-line"></span>';
                    $html .= '</li>';
                }

                break;

            case 'step-title-3':
                foreach ( $multistepdata as $index => $step ) {
                    $active_class = ( $index === 0 ) ? 'active' : '';
                    $itemClass    = 'step-nav-item step-' . $step[ 'attributes' ][ 'blockId' ] . ' ' . $active_class;
                    $stepName     = isset( $step[ 'attributes' ][ 'stepName' ] ) ? $step[ 'attributes' ][ 'stepName' ] : 'Step ' . ( $index + 1 );
                    $stepSubtitle = isset( $step[ 'attributes' ][ 'stepSubtitle' ] ) ? $step[ 'attributes' ][ 'stepSubtitle' ] : '';

                    $html .= '<li class="step-title-item ' . $itemClass . '">';

                    // Check if step icon should be displayed
                    if ( $enableStepIcon && ! empty( $step[ 'attributes' ][ 'stepIcon' ] ) ) {
                        $html .= Helper::eb_render_icon(
                            Helper::eb_get_icon_type( $step[ 'attributes' ][ 'stepIcon' ] ),
                            'step-icon',
                            $step[ 'attributes' ][ 'stepIcon' ]
                        );
                    }

                    $html .= '<div class="text">';
                    $html .= '<span class="step-label">' . esc_html( $stepName ) . '</span>';

                    // Check if step subtitle should be displayed
                    if ( $enableStepSubtitle && ! empty( $stepSubtitle ) ) {
                        $html .= '<span class="step-subtitle">' . esc_html( $stepSubtitle ) . '</span>';
                    }

                    $html .= '</div>';

                    $html .= '</li>';
                }

                break;

            case 'dots':
                foreach ( $multistepdata as $index => $step ) {
                    $active_class = ( $index === 0 ) ? 'active' : '';
                    $itemClass    = 'step-nav-item step-' . $step[ 'attributes' ][ 'blockId' ] . ' ' . $active_class;
                    $stepName     = isset( $step[ 'attributes' ][ 'stepName' ] ) ? $step[ 'attributes' ][ 'stepName' ] : 'Step ' . ( $index + 1 );
                    $stepSubtitle = isset( $step[ 'attributes' ][ 'stepSubtitle' ] ) ? $step[ 'attributes' ][ 'stepSubtitle' ] : '';

                    $html .= '<li class="step-dot-item ' . $itemClass . '">';
                    $html .= '<span class="step-dot"></span>';
                    $html .= '<span class="step-dot-label">' . esc_html( $stepName ) . '</span>';

                    // Check if step subtitle should be displayed
                    if ( $enableStepSubtitle && ! empty( $stepSubtitle ) ) {
                        $html .= '<span class="step-subtitle">' . esc_html( $stepSubtitle ) . '</span>';
                    }

                    $html .= '</li>';
                }

                break;

            default:
                // Default to the original step bar implementation
                foreach ( $multistepdata as $index => $step ) {
                    $active_class = ( $index === 0 ) ? 'active' : '';
                    $itemClass    = 'step-nav-item step-' . $step[ 'attributes' ][ 'blockId' ] . ' ' . $active_class;
                    $stepName     = isset( $step[ 'attributes' ][ 'stepName' ] ) ? $step[ 'attributes' ][ 'stepName' ] : 'Step ' . ( $index + 1 );
                    $step_icon    = '';

                    // Check if step icon should be displayed
                    if ( $enableStepIcon && ! empty( $step[ 'attributes' ][ 'stepIcon' ] ) ) {
                        $step_icon = Helper::eb_render_icon(
                            Helper::eb_get_icon_type( $step[ 'attributes' ][ 'stepIcon' ] ),
                            'step-item-icon',
                            $step[ 'attributes' ][ 'stepIcon' ]
                        );
                    }

                    $html .= '<li class="step-item ' . $itemClass . '" role="tab">'
                    . $step_icon . esc_html( $stepName )
                        . '</li>';
                }

                break;
        }

        if ( $step_navigation_style !== 'progress-bar' ) {
            $html .= '</ul>';
        }
        $html .= '</div>';

        // Echo the HTML directly when used with do_action
        echo wp_kses_post( $html );
    }

    /**
     * Process form data with conditional logic before validation
     *
     * @param array|object $fields Form data
     * @param array $settings Form settings
     * @return array|object Processed form data
     */
    public function process_form_conditional_logic( $fields, $settings )
    {
        // error_log('process_form_conditional_logic settings: ' . print_r($settings, true));
        // error_log('process_form_conditional_logic fields: ' . print_r($fields, true));

        // Ensure settings is an array
        $settings = is_object( $settings ) ? (array) $settings : $settings;

        // Determine if fields is an object or array
        $is_object        = is_object( $fields );
        $fields_array     = $is_object ? get_object_vars( $fields ) : $fields;
        $processed_fields = [  ];

        // Check if this is a multistep form
        $is_multistep_form = isset( $settings[ 'multistepdata' ] ) && ! empty( $settings[ 'multistepdata' ] );

        // If it's a multistep form, process step visibility first
        if ( $is_multistep_form ) {
            $step_result     = $this->process_multistep_conditional_logic( $fields, $settings );
            $step_visibility = $step_result[ 'step_visibility' ];
            $fields_array    = $is_object ? get_object_vars( $step_result[ 'form_data' ] ) : $step_result[ 'form_data' ];

            // error_log('Step visibility result: ' . print_r($step_visibility, true));
            // error_log('Filtered form data after step processing: ' . print_r($fields_array, true));
        }

        // If no settings or no conditional logic, return original fields
        if ( empty( $settings ) || ! isset( $settings[ 'conditionalLogics' ] ) || empty( $settings[ 'conditionalLogics' ] ) ) {
            // error_log('No conditional logic found, returning original fields');
            return $is_multistep_form ? ( $is_object ? (object) $fields_array : $fields_array ) : $fields;
        }

        $conditionalLogics = (array) $settings[ 'conditionalLogics' ];
        // error_log('Conditional logic found: ' . print_r($conditionalLogics, true));

        // Process each field's individual conditional logic
        foreach ( $fields_array as $field_name => $field_value ) {
            // Skip processing if this field belongs to a hidden step (only for multistep forms)
            if ( $is_multistep_form ) {
                $skip_field = false;

                foreach ( $settings[ 'multistepdata' ] as $step ) {
                    $step    = is_object( $step ) ? (array) $step : $step;
                    $step_id = isset( $step[ 'blockId' ] ) ? $step[ 'blockId' ] : '';

                    // If step is hidden and field belongs to this step, skip it
                    if ( ! empty( $step_id ) && isset( $step_visibility[ $step_id ] ) &&
                        $step_visibility[ $step_id ] === false &&
                        isset( $step[ 'fields' ] ) && in_array( $field_name, $step[ 'fields' ] ) ) {
                        $skip_field = true;
                        // error_log("Field {$field_name} belongs to hidden step {$step_id}, skipping");
                        break;
                    }
                }

                if ( $skip_field ) {
                    continue;
                }
            }

            // Check if this field has its own conditional logic
            if ( isset( $conditionalLogics[ $field_name ] ) ) {
                $logic = (array) $conditionalLogics[ $field_name ];

                // Skip multistep wrappers as they're handled separately
                if ( isset( $logic[ 'isMultistep' ] ) && $logic[ 'isMultistep' ] ) {
                    $processed_fields[ $field_name ] = $field_value;
                    continue;
                }

                // Check if conditional logic is enabled
                if ( isset( $logic[ 'enable' ] ) && $logic[ 'enable' ] ) {
                    // Evaluate if field should be included based on conditional logic
                    $should_process = $this->should_process_field( $logic, $fields_array );
                    // error_log("Field {$field_name}: should_process = " . ($should_process ? 'true' : 'false'));

                    if ( $should_process ) {
                        $processed_fields[ $field_name ] = $field_value;
                    }
                    // If field should be hidden, don't include it in processed fields
                } else {
                    // No conditional logic or not enabled, include field as is
                    // error_log("Field {$field_name}: conditional logic not enabled, including as is");
                    $processed_fields[ $field_name ] = $field_value;
                }
            } else {
                // No conditional logic for this field, include it as is
                // error_log("Field {$field_name}: no conditional logic, including as is");
                $processed_fields[ $field_name ] = $field_value;
            }
        }

        // error_log('Final processed fields: ' . print_r($processed_fields, true));

        // Convert back to object if original was object
        return $is_object ? (object) $processed_fields : $processed_fields;
    }

    /**
     * Evaluate if a field should be processed based on conditional logic
     *
     * @param array $logic Conditional logic rules
     * @param array $form_data Form data
     * @return bool Whether the field should be processed
     */
    public function should_process_field( $logic, $form_data )
    {
        // Detailed logging
        // error_log('Evaluating conditional logic: ' . print_r($logic, true));
        // error_log('Form data: ' . print_r($form_data, true));

        // If logic is not enabled, always process the field
        if ( ! isset( $logic[ 'enable' ] ) || ! $logic[ 'enable' ] ) {
            // error_log('Logic not enabled, returning true');
            return true;
        }

        // If no rules or empty rules array, always process the field
        if ( ! isset( $logic[ 'rules' ] ) || ! is_array( $logic[ 'rules' ] ) || empty( $logic[ 'rules' ] ) ) {
            // error_log('No rules found, returning true');
            return true;
        }

        $operator = isset( $logic[ 'conditionalOperator' ] ) ? $logic[ 'conditionalOperator' ] : 'all';
        $action   = isset( $logic[ 'action' ] ) ? $logic[ 'action' ] : 'show';

        // Filter valid rules
        $valid_rules = [  ];
        foreach ( $logic[ 'rules' ] as $rule ) {
            $rule = (array) $rule;
            if ( ! empty( $rule[ 'field' ] ) && isset( $rule[ 'operator' ] ) ) {
                $valid_rules[  ] = $rule;
                // error_log('Valid rule found: ' . print_r($rule, true));
            } else {
                error_log( 'Invalid rule skipped: ' . print_r( $rule, true ) );
            }
        }

        // If no valid rules, always process the field
        if ( empty( $valid_rules ) ) {
            // error_log('No valid rules after filtering, returning true');
            return true;
        }

        // Evaluate each valid rule
        $results = [  ];
        foreach ( $valid_rules as $rule ) {
            $field         = $rule[ 'field' ];
            $rule_operator = $rule[ 'operator' ];
            $compare_value = isset( $rule[ 'value' ] ) ? $rule[ 'value' ] : '';

            // Get field value from form data
            $field_value = isset( $form_data[ $field ] ) ? $form_data[ $field ] : '';

            $result      = $this->evaluate_rule( $field_value, $rule_operator, $compare_value );
            $results[  ] = $result;

            // error_log("Rule evaluation: Field '{$field}' with value '{$field_value}' {$rule_operator} '{$compare_value}' => " . ($result ? 'true' : 'false'));
        }

        // Determine if condition is met based on operator
        $is_condition_met = false;
        if ( $operator === 'all' ) {
            $is_condition_met = ! in_array( false, $results ); // All rules must be true
            // error_log("Operator 'all': condition met = " . ($is_condition_met ? 'true' : 'false'));
        } else {
            $is_condition_met = in_array( true, $results ); // At least one rule must be true
            // error_log("Operator 'any': condition met = " . ($is_condition_met ? 'true' : 'false'));
        }

        // Determine if field should be processed based on action type
        $should_process = false;
        if ( $action === 'show' ) {
            $should_process = $is_condition_met; // Process if condition is met for "show" action
            // error_log("Action 'show': should_process = " . ($should_process ? 'true' : 'false'));
        } else if ( $action === 'hide' ) {
            $should_process = ! $is_condition_met; // Process if condition is NOT met for "hide" action
            // error_log("Action 'hide': should_process = " . ($should_process ? 'true' : 'false'));
        } else {
            $should_process = true; // Default to processing
            // error_log("Unknown action '{$action}': defaulting to should_process = true");
        }

        return $should_process;
    }

    /**
     * Evaluate a single conditional rule
     *
     * @param mixed $field_value Field value
     * @param string $operator Comparison operator
     * @param mixed $compare_value Value to compare against
     * @return bool Whether the rule is satisfied
     */
    public function evaluate_rule( $field_value, $operator, $compare_value )
    {
        // Handle array values
        if ( is_array( $field_value ) ) {
            // For array values, convert to string for simple comparison
            $field_value = implode( ',', $field_value );
        }

        // Ensure values are strings for string operations
        $field_value   = (string) $field_value;
        $compare_value = (string) $compare_value;

        switch ( $operator ) {
            case '==':
                return $field_value == $compare_value;
            case '!=':
                return $field_value != $compare_value;
            case '>':
                return $field_value > $compare_value;
            case '<':
                return $field_value < $compare_value;
            case '>=':
                return $field_value >= $compare_value;
            case '<=':
                return $field_value <= $compare_value;
            case 'contains':
                return strpos( $field_value, $compare_value ) !== false;
            case 'not_contains':
                return strpos( $field_value, $compare_value ) === false;
            case 'starts_with':
                return strpos( $field_value, $compare_value ) === 0;
            case 'ends_with':
                return substr( $field_value, -strlen( $compare_value ) ) === $compare_value;
            case 'empty':
                return empty( $field_value );
            case 'not_empty':
                return ! empty( $field_value );
            default:
                return false;
        }
    }

    /**
     * Process multistep form conditional logic
     *
     * @param array $form_data Form data
     * @param array $settings Form settings
     * @return array Processed form data with step visibility
     */
    public function process_multistep_conditional_logic( $form_data, $settings )
    {
        // If no settings or no conditional logic, return original form data
        if ( empty( $settings ) || empty( $settings[ 'conditionalLogics' ] ) ) {
            return [
                'form_data'       => $form_data,
                'step_visibility' => [  ]
             ];
        }

        $step_visibility    = [  ];
        $filtered_form_data = $form_data;

        // Get all multistep wrappers from settings
        $multistep_data = isset( $settings[ 'multistepdata' ] ) ? $settings[ 'multistepdata' ] : [  ];

        // Process each step's conditional logic
        foreach ( $multistep_data as $step ) {
            // Get step ID from either object or array
            $step_id = is_object( $step ) ?
            ( isset( $step->blockId ) ? $step->blockId : '' ) :
            ( isset( $step[ 'blockId' ] ) ? $step[ 'blockId' ] : '' );

            if ( empty( $step_id ) ) {
                continue;
            }

            // Check if this step has conditional logic
            $step_logic = $this->get_step_conditional_logic( $step_id, $settings[ 'conditionalLogics' ] );

            // Determine if step should be visible
            $is_visible = true;
            if ( $step_logic && isset( $step_logic[ 'enable' ] ) && $step_logic[ 'enable' ] ) {
                $is_visible = $this->should_process_field( $step_logic, $form_data );
            }

            $step_visibility[ $step_id ] = $is_visible;

            // If step is not visible, remove its fields from form data
            if ( ! $is_visible ) {
                // Get fields for this step
                $step_fields = $this->get_fields_for_step( $step_id, $settings );

                // error_log('Fields for step ' . $step_id . ': ' . print_r($step_fields, true));
                // Remove fields from form data
                foreach ( $step_fields as $field ) {
                    if ( isset( $filtered_form_data[ $field ] ) ) {
                        unset( $filtered_form_data[ $field ] );
                    }
                }
            }
        }

        return [
            'form_data'       => $filtered_form_data,
            'step_visibility' => $step_visibility
         ];
    }

    /**
     * Get conditional logic for a specific step
     *
     * @param string $step_id Step ID
     * @param array $conditional_logics All conditional logics
     * @return array|null Step conditional logic or null if not found
     */
    private function get_step_conditional_logic( $step_id, $conditional_logics )
    {
        // Check if conditional_logics is an object
        if ( is_object( $conditional_logics ) ) {
            // Try to access as object property
            if ( isset( $conditional_logics->$step_id ) ) {
                return (array) $conditional_logics->$step_id;
            }

            // Convert object to array
            $conditional_logics = (array) $conditional_logics;
        }

        // Check if step_id exists in conditional_logics array
        if ( isset( $conditional_logics[ $step_id ] ) ) {
            // Convert to array if it's an object
            if ( is_object( $conditional_logics[ $step_id ] ) ) {
                return (array) $conditional_logics[ $step_id ];
            }
            return $conditional_logics[ $step_id ];
        }

        return null;
    }

    /**
     * Get fields that belong to a specific step
     *
     * @param string $step_id Step ID
     * @param array $settings Form settings
     * @return array List of field names in this step
     */
    private function get_fields_for_step( $step_id, $settings )
    {
        // First check if we have fields in multistepdata
        if ( isset( $settings[ 'multistepdata' ] ) && ! empty( $settings[ 'multistepdata' ] ) ) {
            $multistep_data = $settings[ 'multistepdata' ];

            // Convert to array if it's an object
            if ( is_object( $multistep_data ) ) {
                $multistep_data = (array) $multistep_data;
            }

            // Loop through each step
            foreach ( $multistep_data as $step ) {
                // Convert to array if it's an object
                if ( is_object( $step ) ) {
                    $step = (array) $step;
                }

                // Check if this is the step we're looking for
                $current_step_id = isset( $step[ 'blockId' ] ) ? $step[ 'blockId' ] : '';
                if ( $current_step_id === $step_id ) {
                    // If this step has fields, return them
                    if ( isset( $step[ 'fields' ] ) && is_array( $step[ 'fields' ] ) ) {
                        return $step[ 'fields' ];
                    }
                    break;
                }
            }
        }

        // If we couldn't find fields in multistepdata, check conditionalLogics
        if ( isset( $settings[ 'conditionalLogics' ] ) && ! empty( $settings[ 'conditionalLogics' ] ) ) {
            $conditional_logics = $settings[ 'conditionalLogics' ];

            // Convert to array if it's an object
            if ( is_object( $conditional_logics ) ) {
                $conditional_logics = (array) $conditional_logics;
            }

            // Check if this step has conditional logic with fields
            if ( isset( $conditional_logics[ $step_id ] ) ) {
                $step_logic = $conditional_logics[ $step_id ];

                // Convert to array if it's an object
                if ( is_object( $step_logic ) ) {
                    $step_logic = (array) $step_logic;
                }

                // If this step logic has fields, return them
                if ( isset( $step_logic[ 'fields' ] ) && is_array( $step_logic[ 'fields' ] ) ) {
                    return $step_logic[ 'fields' ];
                }
            }
        }

        // If we still don't have fields, try to infer them from validationRules
        // This is a fallback method and might not be accurate
        $step_fields = [  ];

        // Get all field names from validationRules
        $all_fields = [  ];
        if ( isset( $settings[ 'validationRules' ] ) ) {
            $validation_rules = $settings[ 'validationRules' ];

            // Convert to array if it's an object
            if ( is_object( $validation_rules ) ) {
                $validation_rules = (array) $validation_rules;
            }

            $all_fields = array_keys( $validation_rules );
        }

        // Get the step index in the multistepdata array
        $step_index  = -1;
        $total_steps = 0;

        if ( isset( $settings[ 'multistepdata' ] ) && ! empty( $settings[ 'multistepdata' ] ) ) {
            $multistep_data = $settings[ 'multistepdata' ];

            // Convert to array if it's an object
            if ( is_object( $multistep_data ) ) {
                $multistep_data = (array) $multistep_data;
            }

            $total_steps = count( $multistep_data );

            foreach ( $multistep_data as $index => $step ) {
                // Convert to array if it's an object
                if ( is_object( $step ) ) {
                    $step = (array) $step;
                }

                $current_step_id = isset( $step[ 'blockId' ] ) ? $step[ 'blockId' ] : '';
                if ( $current_step_id === $step_id ) {
                    $step_index = $index;
                    break;
                }
            }
        }

        // If we couldn't find the step, return empty array
        if ( $step_index === -1 || $total_steps === 0 ) {
            return [  ];
        }

        // Distribute fields evenly across steps (fallback method)
        $fields_per_step = ceil( count( $all_fields ) / $total_steps );
        $start_index     = $step_index * $fields_per_step;
        $end_index       = min( ( $step_index + 1 ) * $fields_per_step, count( $all_fields ) );

        for ( $i = $start_index; $i < $end_index; $i++ ) {
            if ( isset( $all_fields[ $i ] ) ) {
                $step_fields[  ] = $all_fields[ $i ];
            }
        }

        return $step_fields;
    }

    /**
     * Get country name by ISO 3166-1 alpha-2 country code
     *
     * @param string $country_code ISO country code (e.g., "US", "GB")
     * @return string|null Country name or null if not found
     */
    private static function get_country_name_by_code( $country_code )
    {
        if ( empty( $country_code ) ) {
            return null;
        }

        // Convert to uppercase for case-insensitive matching
        $country_code = strtoupper( trim( $country_code ) );

        // Comprehensive country code to name mapping
        // This matches the COUNTRIES constant from the frontend
        $countries = [
            'AF' => 'Afghanistan',
            'AL' => 'Albania',
            'DZ' => 'Algeria',
            'AS' => 'American Samoa',
            'AD' => 'Andorra',
            'AO' => 'Angola',
            'AI' => 'Anguilla',
            'AQ' => 'Antarctica',
            'AG' => 'Antigua and Barbuda',
            'AR' => 'Argentina',
            'AM' => 'Armenia',
            'AW' => 'Aruba',
            'AU' => 'Australia',
            'AT' => 'Austria',
            'AZ' => 'Azerbaijan',
            'BS' => 'Bahamas',
            'BH' => 'Bahrain',
            'BD' => 'Bangladesh',
            'BB' => 'Barbados',
            'BY' => 'Belarus',
            'BE' => 'Belgium',
            'BZ' => 'Belize',
            'BJ' => 'Benin',
            'BM' => 'Bermuda',
            'BT' => 'Bhutan',
            'BO' => 'Bolivia',
            'BA' => 'Bosnia and Herzegovina',
            'BW' => 'Botswana',
            'BV' => 'Bouvet Island',
            'BR' => 'Brazil',
            'IO' => 'British Indian Ocean Territory',
            'BN' => 'Brunei Darussalam',
            'BG' => 'Bulgaria',
            'BF' => 'Burkina Faso',
            'BI' => 'Burundi',
            'KH' => 'Cambodia',
            'CM' => 'Cameroon',
            'CA' => 'Canada',
            'CV' => 'Cape Verde',
            'KY' => 'Cayman Islands',
            'CF' => 'Central African Republic',
            'TD' => 'Chad',
            'CL' => 'Chile',
            'CN' => 'China',
            'CX' => 'Christmas Island',
            'CC' => 'Cocos (Keeling) Islands',
            'CO' => 'Colombia',
            'KM' => 'Comoros',
            'CG' => 'Congo',
            'CD' => 'Congo, Democratic Republic',
            'CK' => 'Cook Islands',
            'CR' => 'Costa Rica',
            'CI' => 'Cote D\'Ivoire',
            'HR' => 'Croatia',
            'CU' => 'Cuba',
            'CY' => 'Cyprus',
            'CZ' => 'Czech Republic',
            'DK' => 'Denmark',
            'DJ' => 'Djibouti',
            'DM' => 'Dominica',
            'DO' => 'Dominican Republic',
            'EC' => 'Ecuador',
            'EG' => 'Egypt',
            'SV' => 'El Salvador',
            'GQ' => 'Equatorial Guinea',
            'ER' => 'Eritrea',
            'EE' => 'Estonia',
            'ET' => 'Ethiopia',
            'FK' => 'Falkland Islands (Malvinas)',
            'FO' => 'Faroe Islands',
            'FJ' => 'Fiji',
            'FI' => 'Finland',
            'FR' => 'France',
            'GF' => 'French Guiana',
            'PF' => 'French Polynesia',
            'TF' => 'French Southern Territories',
            'GA' => 'Gabon',
            'GM' => 'Gambia',
            'GE' => 'Georgia',
            'DE' => 'Germany',
            'GH' => 'Ghana',
            'GI' => 'Gibraltar',
            'GR' => 'Greece',
            'GL' => 'Greenland',
            'GD' => 'Grenada',
            'GP' => 'Guadeloupe',
            'GU' => 'Guam',
            'GT' => 'Guatemala',
            'GG' => 'Guernsey',
            'GN' => 'Guinea',
            'GW' => 'Guinea-Bissau',
            'GY' => 'Guyana',
            'HT' => 'Haiti',
            'HM' => 'Heard Island & Mcdonald Islands',
            'VA' => 'Holy See (Vatican City State)',
            'HN' => 'Honduras',
            'HK' => 'Hong Kong',
            'HU' => 'Hungary',
            'IS' => 'Iceland',
            'IN' => 'India',
            'ID' => 'Indonesia',
            'IR' => 'Iran, Islamic Republic Of',
            'IQ' => 'Iraq',
            'IE' => 'Ireland',
            'IM' => 'Isle Of Man',
            'IL' => 'Israel',
            'IT' => 'Italy',
            'JM' => 'Jamaica',
            'JP' => 'Japan',
            'JE' => 'Jersey',
            'JO' => 'Jordan',
            'KZ' => 'Kazakhstan',
            'KE' => 'Kenya',
            'KI' => 'Kiribati',
            'KP' => 'Korea, Democratic People\'s Republic Of',
            'KR' => 'Korea, Republic of',
            'KW' => 'Kuwait',
            'KG' => 'Kyrgyzstan',
            'LA' => 'Lao People\'s Democratic Republic',
            'LV' => 'Latvia',
            'LB' => 'Lebanon',
            'LS' => 'Lesotho',
            'LR' => 'Liberia',
            'LY' => 'Libyan Arab Jamahiriya',
            'LI' => 'Liechtenstein',
            'LT' => 'Lithuania',
            'LU' => 'Luxembourg',
            'MO' => 'Macao',
            'MK' => 'Macedonia',
            'MG' => 'Madagascar',
            'MW' => 'Malawi',
            'MY' => 'Malaysia',
            'MV' => 'Maldives',
            'ML' => 'Mali',
            'MT' => 'Malta',
            'MH' => 'Marshall Islands',
            'MQ' => 'Martinique',
            'MR' => 'Mauritania',
            'MU' => 'Mauritius',
            'YT' => 'Mayotte',
            'MX' => 'Mexico',
            'FM' => 'Micronesia, Federated States Of',
            'MD' => 'Moldova',
            'MC' => 'Monaco',
            'MN' => 'Mongolia',
            'ME' => 'Montenegro',
            'MS' => 'Montserrat',
            'MA' => 'Morocco',
            'MZ' => 'Mozambique',
            'MM' => 'Myanmar',
            'NA' => 'Namibia',
            'NR' => 'Nauru',
            'NP' => 'Nepal',
            'NL' => 'Netherlands',
            'AN' => 'Netherlands Antilles',
            'NC' => 'New Caledonia',
            'NZ' => 'New Zealand',
            'NI' => 'Nicaragua',
            'NE' => 'Niger',
            'NG' => 'Nigeria',
            'NU' => 'Niue',
            'NF' => 'Norfolk Island',
            'MP' => 'Northern Mariana Islands',
            'NO' => 'Norway',
            'OM' => 'Oman',
            'PK' => 'Pakistan',
            'PW' => 'Palau',
            'PS' => 'Palestinian Territory, Occupied',
            'PA' => 'Panama',
            'PG' => 'Papua New Guinea',
            'PY' => 'Paraguay',
            'PE' => 'Peru',
            'PH' => 'Philippines',
            'PN' => 'Pitcairn',
            'PL' => 'Poland',
            'PT' => 'Portugal',
            'PR' => 'Puerto Rico',
            'QA' => 'Qatar',
            'RE' => 'Reunion',
            'RO' => 'Romania',
            'RU' => 'Russian Federation',
            'RW' => 'Rwanda',
            'BL' => 'Saint Barthelemy',
            'SH' => 'Saint Helena',
            'KN' => 'Saint Kitts And Nevis',
            'LC' => 'Saint Lucia',
            'MF' => 'Saint Martin',
            'PM' => 'Saint Pierre And Miquelon',
            'VC' => 'Saint Vincent And Grenadines',
            'WS' => 'Samoa',
            'SM' => 'San Marino',
            'ST' => 'Sao Tome And Principe',
            'SA' => 'Saudi Arabia',
            'SN' => 'Senegal',
            'RS' => 'Serbia',
            'SC' => 'Seychelles',
            'SL' => 'Sierra Leone',
            'SG' => 'Singapore',
            'SK' => 'Slovakia',
            'SI' => 'Slovenia',
            'SB' => 'Solomon Islands',
            'SO' => 'Somalia',
            'ZA' => 'South Africa',
            'GS' => 'South Georgia And Sandwich Isl.',
            'ES' => 'Spain',
            'LK' => 'Sri Lanka',
            'SD' => 'Sudan',
            'SR' => 'Suriname',
            'SJ' => 'Svalbard And Jan Mayen',
            'SZ' => 'Swaziland',
            'SE' => 'Sweden',
            'CH' => 'Switzerland',
            'SY' => 'Syrian Arab Republic',
            'TW' => 'Taiwan',
            'TJ' => 'Tajikistan',
            'TZ' => 'Tanzania',
            'TH' => 'Thailand',
            'TL' => 'Timor-Leste',
            'TG' => 'Togo',
            'TK' => 'Tokelau',
            'TO' => 'Tonga',
            'TT' => 'Trinidad and Tobago',
            'TN' => 'Tunisia',
            'TR' => 'Turkey',
            'TM' => 'Turkmenistan',
            'TC' => 'Turks and Caicos Islands',
            'TV' => 'Tuvalu',
            'UG' => 'Uganda',
            'UA' => 'Ukraine',
            'AE' => 'United Arab Emirates',
            'GB' => 'United Kingdom',
            'US' => 'United States',
            'UM' => 'United States Minor Outlying Islands',
            'UY' => 'Uruguay',
            'UZ' => 'Uzbekistan',
            'VU' => 'Vanuatu',
            'VE' => 'Venezuela',
            'VN' => 'Viet Nam',
            'VG' => 'Virgin Islands, British',
            'VI' => 'Virgin Islands, U.S.',
            'WF' => 'Wallis and Futuna',
            'EH' => 'Western Sahara',
            'YE' => 'Yemen',
            'ZM' => 'Zambia',
            'ZW' => 'Zimbabwe'
         ];

        return isset( $countries[ $country_code ] ) ? $countries[ $country_code ] : null;
    }

    /**
     * Validate country code against ISO 3166-1 alpha-2 standard
     */
    private static function validate_country_code( $country_code )
    {
        if ( empty( $country_code ) ) {
            return false;
        }

        // Use the get_country_name_by_code method to validate
        // If it returns a name, the code is valid
        return self::get_country_name_by_code( $country_code ) !== null;
    }
}
