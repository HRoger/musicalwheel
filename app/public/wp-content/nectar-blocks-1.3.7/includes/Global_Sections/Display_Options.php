<?php

namespace Nectar\Global_Sections;

class Display_Options
{
    private static $instance;

    public static $post_meta_key = 'nectar_g_section_options';

    public static $locations = [];

    public static $conditions = [];

    public static $conditions_operator = ['and'];

    public $theme_hooks = [];

    public $special_locations = [];

    public static $exclude = false;

    public static $options = [];

    public static $options_saved = [
        'conditions' => [[]],
        'locations' => [[]]
    ];

    private function __construct()
    {

        $this->add_filters();

        if ( is_admin() ) {
            add_action('add_meta_boxes', [$this, 'setup_data']);
        } else {
            add_action('wp', [$this, 'init']);
        }

        add_action('add_meta_boxes', [$this, 'add_display_options_meta_box'], 90);
        add_action('admin_enqueue_scripts', [$this, 'admin_enqueue_assets']);

        add_action('save_post', [$this, 'save_display_conditions'], 10, 3);
        // add_action('before_delete_post', [$this, 'on_delete_post']);
    }

    /**
     * Initiator.
     */
    public static function get_instance()
    {
        if (! self::$instance) {
            self::$instance = new self;
        }
        return self::$instance;
    }

    public function init() {
        // This is still needed for visual hook locations.
        if ( current_user_can( 'manage_options' ) ) {
            $this->set_settings();
        }
    }

    public function add_filters() 
    {   
        // Limit to only one special location 
        // add_filter('nectar_available_special_locations', function($locations) {

        //     $modified_locations = [];

        //     foreach($locations as $location) {

        //         $location_in_use = self::is_special_location_active($location['value']);

        //         if($location_in_use && strval($location_in_use) !== strval(get_the_ID())) {
        //             continue;
        //         }

        //         $modified_locations[] = $location;

        //     }

        //     return $modified_locations;
        // });
    }

    /**
     * Set up data for conditional selects.
     */
    public function setup_data()
    {
        // global $post;
        // get_post_meta($post->ID, 'nectar_g_section_options', '');
        // Create settings list.
        $this->set_settings();

        self::$options_saved = [

            'conditions' => json_encode(
                [
                    [
                        'options' => []
                    ]
                ]
            ),
            'conditions_operator' => json_encode(['and']),
            'locations' => json_encode(
                [
                    [
                        'options' => []
                    ]
                ]
            )
        ];

        // Populate saved.
        global $post;

        self::$conditions = ($post && isset($post->ID)) ? get_post_meta($post->ID, 'nectar_g_section_conditions', true) : false;

        if (! empty(self::$conditions)) {
            self::$options_saved['conditions'] = json_encode(self::$conditions);
        }

        self::$conditions_operator = ($post && isset($post->ID)) ? get_post_meta($post->ID, 'nectar_g_section_conditions_operator', true) : false;

        if (! empty(self::$conditions_operator)) {
            self::$options_saved['conditions_operator'] = json_encode(self::$conditions_operator);
        }

        self::$locations = ($post && isset($post->ID)) ? get_post_meta($post->ID, 'nectar_g_section_locations', true) : false;

        // // Starting location from visual hook link.
        if ( isset($_GET['nectar_starting_hook']) && 
        ! empty($_GET['nectar_starting_hook']) && 
        empty(self::$locations) ) {
            $this->set_starting_hook();
        }

        if (! empty(self::$locations)) {
            self::$options_saved['locations'] = json_encode(self::$locations);
        }

    }

    // Sets the default location to the visual hook that was clicked.
    public function set_starting_hook()
    {

        $starting_location = sanitize_text_field($_GET['nectar_starting_hook']);

        // verify that it's a valid location.
        if( in_array($starting_location, $this->get_flat_hook_list()) ) {

            // Set location to selected visual hook.
            self::$options_saved['locations'] = json_encode(
                [
                    [
                    'key' => 'v8Pj8YdOlBx0N_q8Di4um',
                    'options' => [
                            [
                                'type' => 'priority',
                                'value' => '10',
                            ],
                            [
                                'type' => 'location',
                                'value' => $starting_location,
                            ]
                        ],
                    ],
                ]
            );

            //Set a default condition to display.
            if ( empty(self::$conditions) ) {
                self::$options_saved['conditions'] = json_encode(
                    [
                        [
                            'key' => 'Ve4fxg4ZdA-nrPVtcXem6',
                            'options' => [
                                [
                                    'type' => 'include',
                                    'value' => 'include',
                                ],
                                [
                                    'type' => 'condition',
                                    'value' => 'everywhere',
                                ]
                            ],
                        ],
                    ]
                );
            }

        }

    }    

    public function set_settings()
    {   
        // Post types.
        $post_types = get_post_types(
            [
                'public' => true,
            ]
        );
        $exclude_post_types = ['nectar_sections', 'home_slider', 'nectar_slider'];

        // Post types.
        $formatted_post_types = [];
        foreach ($post_types as $post_type) {
            if (in_array($post_type, $exclude_post_types)) {
                continue;
            }

            $formatted_post_types[] = [
                'value' => 'post_type__' . $post_type,
                'label' => $post_type,
            ];
        }
        // Single post types
        foreach ($post_types as $post_type) {
            if (in_array($post_type, $exclude_post_types) || in_array($post_type, ['attachment'])) {
                continue;
            }

            $formatted_post_types[] = [
                'value' => 'single__pt__' . $post_type,
                'label' => 'Single: ' . $post_type,
            ];
        }

        // User Roles.
        $user_roles = [];
        if ( is_admin() ) {
            $roles = get_editable_roles();
            foreach ($roles as $role => $details) {
                $user_roles[] = [
                    'value' => 'role__' . $role,
                    'label' => $details['name'],
                ];
            }
        }

        // Special locations
        // $this->special_locations = [
        //     [
        //         'value' => 'nectar_special_location__blog_loop',
        //         'label' => esc_html__('Blog Archive Loop', 'nectar-blocks'),
        //     ]
        // ];

        // Theme hooks.
        $this->theme_hooks = [
            'top' => [
                [
                    'value' => 'nectar_hook_before_secondary_header',
                    'label' => esc_html__('Inside Header Navigation Top', 'nectar-blocks'),
                ],

                [
                    'value' => 'nectar_hook_global_section_after_header_navigation',
                    'label' => esc_html__('After Header Navigation', 'nectar-blocks'),
                ]
            ],
            'main_content' => [
                [
                    'value' => 'nectar_hook_before_content_global_section',
                    'label' => esc_html__('Before Page/Post Content', 'nectar-blocks'),
                ],
                [
                    'value' => 'nectar_hook_global_section_after_content',
                    'label' => esc_html__('After Page/Post Content', 'nectar-blocks'),
                ],
                [
                    'value' => 'nectar_hook_sidebar_top',
                    'label' => esc_html__('Sidebar Top', 'nectar-blocks'),
                ],
                [
                    'value' => 'nectar_hook_sidebar_bottom',
                    'label' => esc_html__('Sidebar Bottom', 'nectar-blocks'),
                ],
                [
                    'value' => 'nectar_before_blog_loop_start',
                    'label' => esc_html__('Before Blog Loop', 'nectar-blocks'),
                ],
                [
                    'value' => 'nectar_before_blog_loop_end',
                    'label' => esc_html__('After Blog Loop', 'nectar-blocks'),
                ],
                [
                    'value' => 'nectar_hook_404_content',
                    'label' => esc_html__('404 Content', 'nectar-blocks'),
                ],
            ],

            'menu' => [
                [
                    'value' => 'nectar_hook_ocm_before_menu',
                    'label' => esc_html__('Before Off Canvas Menu Items', 'nectar-blocks'),
                ],
                [
                    'value' => 'nectar_hook_ocm_after_menu',
                    'label' => esc_html__('After Off Canvas Menu Items', 'nectar-blocks'),
                ],
                [
                    'value' => 'nectar_hook_ocm_bottom_meta',
                    'label' => esc_html__('Off Canvas Menu Meta Area', 'nectar-blocks'),
                ],

            ],

            'bottom' => [
                [
                    'value' => 'nectar_hook_global_section_footer',
                    'label' => esc_html__('Footer', 'nectar-blocks'),
                ],
                [
                    'value' => 'nectar_hook_global_section_parallax_footer',
                    'label' => esc_html__('Footer Parallax', 'nectar-blocks'),
                ],

                [
                    'value' => 'nectar_hook_global_section_after_footer',
                    'label' => esc_html__('After Footer', 'nectar-blocks'),
                    'args' => ''
                ],
            ],

            'woocommerce' => [
                [
                    'value' => 'nectar_woocommerce_before_shop_loop',
                    'label' => esc_html__('Before Shop Loop', 'nectar-blocks'),
                ],
                [
                    'value' => 'nectar_woocommerce_after_shop_loop',
                    'label' => esc_html__('After Shop Loop', 'nectar-blocks'),
                ],
                [
                    'value' => 'nectar_woocommerce_before_single_product_summary',
                    'label' => esc_html__('Single Product Before Summary', 'nectar-blocks'),
                ],
                [
                    'value' => 'nectar_woocommerce_before_add_to_cart_form',
                    'label' => esc_html__('Single Product Before Add to Cart', 'nectar-blocks'),
                ],
                [
                    'value' => 'nectar_woocommerce_after_add_to_cart_form',
                    'label' => esc_html__('Single Product After Add to Cart', 'nectar-blocks'),
                ],
                [
                    'value' => 'nectar_woocommerce_after_single_product_summary',
                    'label' => esc_html__('Single Product After Summary', 'nectar-blocks'),
                ],
                [
                    'value' => 'nectar_woocommerce_before_checkout_billing_form',
                    'label' => esc_html__('Checkout Before Billing Form', 'nectar-blocks'),
                ],
                [
                    'value' => 'nectar_woocommerce_after_checkout_billing_form',
                    'label' => esc_html__('Checkout After Billing Form', 'nectar-blocks'),
                ],
                [
                    'value' => 'nectar_woocommerce_before_checkout_shipping_form',
                    'label' => esc_html__('Checkout Before Shipping Form', 'nectar-blocks'),
                ],
                [
                    'value' => 'nectar_woocommerce_before_order_notes',
                    'label' => esc_html__('Checkout Before Order Notes', 'nectar-blocks'),
                ],
                [
                    'value' => 'nectar_woocommerce_after_order_notes',
                    'label' => esc_html__('Checkout After Order Notes', 'nectar-blocks'),
                ],
                [
                    'value' => 'nectar_woocommerce_checkout_before_order_review',
                    'label' => esc_html__('Checkout Before Order Review', 'nectar-blocks'),
                ],
                [
                    'value' => 'nectar_woocommerce_review_order_before_payment',
                    'label' => esc_html__('Checkout Before Review Order Payment', 'nectar-blocks'),
                ],
                [
                    'value' => 'nectar_woocommerce_review_order_after_payment',
                    'label' => esc_html__('Checkout After Review Order Payment', 'nectar-blocks'),
                ],

                [
                    'value' => 'nectar_woocommerce_cart_coupon',
                    'label' => esc_html__('Cart Coupon', 'nectar-blocks'),
                ],
                [
                    'value' => 'nectar_woocommerce_before_cart_totals',
                    'label' => esc_html__('Cart Before Totals', 'nectar-blocks'),
                ],
                [
                    'value' => 'nectar_woocommerce_cart_totals_before_shipping',
                    'label' => esc_html__('Cart Before Shipping', 'nectar-blocks'),
                ],
                [
                    'value' => 'nectar_woocommerce_before_shipping_calculator',
                    'label' => esc_html__('Cart Before Shipping Calculator', 'nectar-blocks'),
                ],
                [
                    'value' => 'nectar_woocommerce_after_shipping_calculator',
                    'label' => esc_html__('Cart After Shipping Calculator', 'nectar-blocks'),
                ],
                [
                    'value' => 'nectar_woocommerce_proceed_to_checkout',
                    'label' => esc_html__('Cart Proceed to Checkout', 'nectar-blocks'),
                ],

            ]

        ];

        // Conditions
        self::$options = [

            'conditions' => [
                [
                    'label' => 'General',
                    'options' => [
                        [
                            'value' => 'everywhere',
                            'label' => esc_html__('Everywhere', 'nectar-blocks'),
                        ],

                        [
                            'value' => 'is_archive',
                            'label' => esc_html__('Archive', 'nectar-blocks'),
                            'args' => ''
                        ],
                        [
                            'value' => 'is_front_page',
                            'label' => esc_html__('Front Page', 'nectar-blocks'),
                            'args' => ''
                        ],
                        [
                            'value' => 'is_search',
                            'label' => esc_html__('Search Results', 'nectar-blocks'),
                            'args' => ''
                        ],

                        [
                            'value' => 'is_single',
                            'label' => esc_html__('Single', 'nectar-blocks'),
                            'args' => ''
                        ],
                    ]

                ],
                [
                    'label' => 'Post Types',
                    'options' => $formatted_post_types
                ],
                [
                    'label' => 'User Roles/Permissions',
                    'options' => array_merge(
                        [
                                    [
                                    'value' => 'is_user_logged_in',
                                    'label' => esc_html__('User Logged In', 'nectar-blocks'),
                                    'args' => ''
                                    ]
                                ],
                        [
                                    [
                                    'value' => 'is_user_not_logged_in',
                                    'label' => esc_html__('User Not Logged In', 'nectar-blocks'),
                                    'args' => ''
                                    ]
                                ],
                        $user_roles
                    )

                ],
            ],

            'locations' => [
                [
                    'label' => esc_html__('Top', 'nectar-blocks'),
                    'options' => $this->theme_hooks['top']

                ],
                [
                    'label' => esc_html__('Main Content', 'nectar-blocks'),
                    'options' => $this->theme_hooks['main_content']

                ],
                [
                    'label' => esc_html__('Footer', 'nectar-blocks'),
                    'options' => $this->theme_hooks['bottom']

                ],
                [
                    'label' => esc_html__('Menu', 'nectar-blocks'),
                    'options' => $this->theme_hooks['menu']

                ],
                [
                    'label' => esc_html__('WooCommerce', 'nectar-blocks'),
                    'options' => $this->theme_hooks['woocommerce']

                ]
                // [
                //     'label' => esc_html__('Special', 'nectar-blocks'),
                //     'options' => apply_filters('nectar_available_special_locations', $this->special_locations)
                // ],
            ],

            'include' => [
                [
                    'options' => [
                        [
                            'value' => 'include',
                            'label' => esc_html__('True', 'nectar-blocks'),
                        ],
                        [
                            'value' => 'exclude',
                            'label' => esc_html__('False', 'nectar-blocks'),
                        ]
                    ]
                ]
            ]
        ];

    }

    /**
     * Returns a flat hook list of all Salient hooks.
     */
    public function get_flat_hook_list() 
    {

            $flat_hook_list = [];

            foreach ($this->theme_hooks as $location) {
                foreach ($location as $hook) {
                    $flat_hook_list[] = $hook['value'];
                }
            }

            return $flat_hook_list;
    }

    /**
     * Handle Admin JS/CSS limited to Global Section CPT
     */
    public function admin_enqueue_assets()
    {

        global $pagenow;

        $current_post_type = $this->get_post_type();

        if ('nectar_sections' !== $current_post_type) {
            return;
        }
        if ( ! $pagenow || ! in_array( $pagenow, [ 'post.php', 'post-new.php' ] ) ) {
            return;
        }

        global $Salient_Core;
        $global_sections_JS_asset_path = NECTAR_BLOCKS_ROOT_DIR_PATH . '/build/globalSections.asset.php';
        $args_array = include($global_sections_JS_asset_path);

        // Display Conditions.
        wp_enqueue_script(
            'nectar-global-sections-display-options',
            NECTAR_BLOCKS_PLUGIN_PATH . '/build/globalSections.js',
            $args_array['dependencies'],
            $args_array['version'],
            true
        );

        wp_enqueue_style(
            'nectar-global-sections-display-options',
            NECTAR_BLOCKS_PLUGIN_PATH . '/build/globalSections.css',
            [],
            $args_array['version']
        );

        wp_localize_script(
            'nectar-global-sections-display-options',
            'nectarDisplayConditions',
            [
                'saved' => self::$options_saved,
                'options' => self::$options,
                'i18n' => [
                    'remove' => esc_html__('Remove', 'nectar-blocks'),
                    'and' => esc_html__('And', 'nectar-blocks'),
                    'or' => esc_html__('Or', 'nectar-blocks'),
                    'add_new_display_condition' => esc_html__('Add new condition', 'nectar-blocks'),
                    'add_new_location' => esc_html__('Add new location', 'nectar-blocks'),
                    'display_conditions' => esc_html__('Display Conditions', 'nectar-blocks'),
                    'display_locations' => esc_html__('Display Locations', 'nectar-blocks'),
                    'display_locations_tip' => esc_html__('Set the priority and location of where to render this section on your site. The priority will determine the order of sections when multiple are assigned to the same location.', 'nectar-blocks'),
                    'display_conditions_tip' => esc_html__('Optionally limit the display of your section based on certain conditions such as user privilege, post type etc.', 'nectar-blocks'),
                ]
            ]
        );
    }

    /**
     * Registers display conditions metabox
     */
    public function add_display_options_meta_box($post_type)
    {
        if ('nectar_sections' === $post_type) {
            add_meta_box(
                'global-section-display-options',
                esc_html__('Global Section Display', 'nectar-blocks'),
                [$this, 'render_meta_box_content'],
                $post_type,
                'normal',
                'high'
            );
        }
    }

    public function render_meta_box_content()
    {
        echo '<div id="nectar-global-sections-display-options" class="nectar-display-options"></div>';

        wp_nonce_field(basename(__FILE__), 'nectar_display_options_nonce');
    }

    public static function get_active_special_locations() {
        $special_locations = get_option( 'salient_global_section_special_locations', [] );
        return $special_locations;
    }

    public static function is_special_location_active($location) {
        $special_locations = self::get_active_special_locations();
        return isset($special_locations[$location]) ? $special_locations[$location] : false;
    }

    public function update_special_locations($saved_key, $saved_data, $post_id) 
    {
        $special_locations = [
            'nectar_special_location__blog_loop'
        ];

        if( 'nectar_g_section_locations' === $saved_key ) {

            $saved_special_locations = self::get_active_special_locations();

            foreach($special_locations as $location) {

                // Has special location.
                if(strpos($saved_data, $location) !== false) {

                    $merged_special_locations = array_merge(
                        $saved_special_locations,
                        [ $location => strval($post_id) ]
                    );
                    update_option( 'salient_global_section_special_locations', $merged_special_locations );
                } 
                else if ( isset($saved_special_locations[$location]) && $saved_special_locations[$location] === strval($post_id) ) {
                    unset($saved_special_locations[$location]);
                    update_option( 'salient_global_section_special_locations', $saved_special_locations );
                }
            }
        }
    }

    public function get_post_type()
    {

        global $post, $typenow;

        $current_post_type = '';

        if ($post && $post->post_type) {
            $current_post_type = $post->post_type;
        } elseif ($typenow) {
            $current_post_type = $typenow;
        } else if (! empty($_GET['post'])) {
            $fetched_post = get_post(intval($_GET['post']));
            if ($fetched_post) {
                $current_post_type = (property_exists($fetched_post, 'post_type')) ? $fetched_post->post_type : '';
            }
        } elseif (isset($_REQUEST['post_type'])) {
            return sanitize_text_field($_REQUEST['post_type']);
        }

        return $current_post_type;
    }

    public function save_display_conditions($post_id, $post, $update)
    {

        // Autosave.
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        // Nonce.
        if (
            ! isset($_POST[self::$post_meta_key]) ||
            ! isset($_POST['nectar_display_options_nonce']) ||
            ! wp_verify_nonce($_POST['nectar_display_options_nonce'], basename(__FILE__))
        ) {
            return;
        }

        // Privileges.
        if (! current_user_can('edit_post', $post_id)) {
            return;
        }

        foreach ($_POST[self::$post_meta_key] as $key => $val) {

            // Track active special locations.
            // if ( 'revision' !== $post->post_type ) {
            //     $this->update_special_locations($key, $val, $post_id);
            // } 

            // Save field.
            update_post_meta($post_id, $key, json_decode(html_entity_decode(stripslashes($val))));
        }
    }

    function on_delete_post($post_id) 
    {
        //remove any special locations.
        $special_locations = [
            'nectar_special_location__blog_loop'
        ];

        $saved_special_locations = self::get_active_special_locations();

        foreach($special_locations as $location) {

            if ( isset($saved_special_locations[$location]) && $saved_special_locations[$location] == strval($post_id) ) {
                unset($saved_special_locations[$location]);
                update_option( 'salient_global_section_special_locations', $saved_special_locations );
            }
        }

    }
}

