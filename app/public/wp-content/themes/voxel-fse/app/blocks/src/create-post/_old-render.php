<?php
declare(strict_types=1);

/**
 * Create Post Block - Server-Side Render
 * Phase A: Foundation - Enqueues frontend React component
 *
 * This file outputs a container div and enqueues the frontend React component.
 * The React component (frontend.tsx) handles all form interactivity.
 */

if ( ! defined('ABSPATH') ) {
    exit;
}

/**
 * Helper Functions for Editor Preview Rendering
 * These functions render form HTML matching Voxel's Elementor widget structure
 */

if ( ! function_exists( 'voxel_fse_group_fields_by_steps' ) ) {
    /**
     * Group fields by steps for preview
     * Detects ui-step fields and groups other fields between them
     *
     * @param array $fields_config Array of field configurations from Voxel
     * @return array Array of steps, each containing key, label, and fields
     */
    function voxel_fse_group_fields_by_steps( $fields_config ) {
        $steps = [];
        $current_step = ['key' => 'default', 'label' => 'Form', 'fields' => []];

        foreach ( $fields_config as $field ) {
            if ( $field['type'] === 'ui-step' ) {
                // Save previous step if it has fields
                if ( ! empty( $current_step['fields'] ) ) {
                    $steps[] = $current_step;
                }
                // Start new step
                $current_step = [
                        'key' => $field['key'],
                        'label' => $field['label'],
                        'fields' => []
                ];
            } else {
                // Add field to current step
                $current_step['fields'][] = $field;
            }
        }

        // Add last step
        if ( ! empty( $current_step['fields'] ) ) {
            $steps[] = $current_step;
        }

        // If no steps found, return all fields in single default step
        return $steps ?: [['key' => 'default', 'label' => 'Form', 'fields' => $fields_config]];
    }
}

if ( ! function_exists( 'voxel_fse_render_form_header' ) ) {
    /**
     * Render form header with multi-step progress indicator
     * Matches Voxel's ts-form-progres structure from create-post.php
     *
     * @param array $steps Array of step data
     * @param int $current_index Current step index (0-based)
     * @return string HTML for form header
     */
    function voxel_fse_render_form_header( $steps, $current_index = 0 ) {
        if ( count( $steps ) <= 1 ) {
            return ''; // No header for single-step forms
        }

        ob_start();
        ?>
        <div class="ts-form-progres">
            <ul class="step-percentage simplify-ul flexify">
                <?php foreach ( $steps as $index => $step ): ?>
                    <li class="<?= $index <= $current_index ? 'step-done' : '' ?>"></li>
                <?php endforeach; ?>
            </ul>
            <div class="ts-active-step flexify">
                <div class="active-step-details">
                    <p><?= esc_html( $steps[$current_index]['label'] ) ?></p>
                </div>
                <div class="step-nav flexify">
				<span style="font-size: 12px; color: #666;">
					Step <?= $current_index + 1 ?> of <?= count( $steps ) ?>
				</span>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
}

if ( ! function_exists( 'voxel_fse_render_form_footer' ) ) {
    /**
     * Render form footer with submit buttons
     * Matches Voxel's ts-form-footer structure from create-post.php
     *
     * @param array $steps Array of step data
     * @param int $current_index Current step index
     * @param string $submit_text Submit button text
     * @return string HTML for form footer
     */
    function voxel_fse_render_form_footer( $steps, $current_index = 0, $submit_text = 'Publish' ) {
        ob_start();
        ?>
        <div class="ts-form-footer flexify">
            <?php if ( count( $steps ) > 1 ): ?>
                <ul class="ts-nextprev simplify-ul flexify">
                    <li>
                        <a href="#" class="ts-prev ts-btn ts-btn-1 ts-btn-large form-btn" style="pointer-events: none;">
                            Previous step
                        </a>
                    </li>
                    <li>
                        <a href="#" class="ts-next ts-btn ts-btn-1 ts-btn-large form-btn" style="pointer-events: none;">
                            Next step
                        </a>
                    </li>
                </ul>
            <?php endif; ?>
            <a href="#" class="ts-btn ts-btn-2 form-btn ts-btn-large ts-save-changes" style="pointer-events: none;">
                <?= esc_html( $submit_text ) ?>
            </a>
        </div>
        <?php
        return ob_get_clean();
    }
}

if ( ! function_exists( 'voxel_fse_render_field_preview' ) ) {
    /**
     * Route field to appropriate renderer based on field type
     *
     * @param array $field Field configuration from Voxel
     * @return string HTML for field preview
     */
    function voxel_fse_render_field_preview( $field ) {
        $type = $field['type'] ?? 'text';

        switch ( $type ) {
            case 'text':
            case 'title':
            case 'profile-name':
                return voxel_fse_render_text_field( $field );

            case 'email':
            case 'url':
            case 'phone':
                return voxel_fse_render_text_field( $field );

            case 'number':
                return voxel_fse_render_number_field( $field );

            case 'select':
                return voxel_fse_render_select_field( $field );

            case 'multiselect':
                return voxel_fse_render_multiselect_field( $field );

            case 'switcher':
                return voxel_fse_render_switcher_field( $field );

            case 'color':
                return voxel_fse_render_color_field( $field );

            case 'texteditor':
            case 'description':
                return voxel_fse_render_textarea_field( $field );

            case 'ui-heading':
                return voxel_fse_render_ui_heading( $field );

            case 'ui-step':
                return ''; // Steps don't render in field grid
            case 'product':
                return voxel_fse_render_product_field( $field );


            default:
                return voxel_fse_render_fallback_field( $field );
        }
    }
}

if ( ! function_exists( 'voxel_fse_render_text_field' ) ) {
    /**
     * Text field renderer
     * Matches Voxel's text-field.php template structure
     *
     * @param array $field Field configuration
     * @return string HTML for text field
     */
    function voxel_fse_render_text_field( $field ) {
        $label = esc_html( $field['label'] ?? 'Text Field' );
        $required = $field['required'] ?? false;
        $placeholder = esc_attr( $field['props']['placeholder'] ?? '' );
        $suffix = $field['props']['suffix'] ?? '';

        ob_start();
        ?>
        <div class="ts-form-group vx-text-field">
            <label>
                <?= $label ?>
                <?php if ( ! $required ): ?>
                    <span class="is-required">Optional</span>
                <?php endif; ?>
            </label>
            <div class="input-container">
                <input type="text" class="ts-filter" placeholder="<?= $placeholder ?>" disabled>
                <?php if ( $suffix ): ?>
                    <span class="input-suffix"><?= esc_html( $suffix ) ?></span>
                <?php endif; ?>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
}

if ( ! function_exists( 'voxel_fse_render_number_field' ) ) {
    /**
     * Number field renderer
     * Matches Voxel's number-field.php template structure
     *
     * @param array $field Field configuration
     * @return string HTML for number field
     */
    function voxel_fse_render_number_field( $field ) {
        $label = esc_html( $field['label'] ?? 'Number' );
        $required = $field['required'] ?? false;
        $suffix = $field['props']['suffix'] ?? '';

        ob_start();
        ?>
        <div class="ts-form-group">
            <label>
                <?= $label ?>
                <?php if ( ! $required ): ?>
                    <span class="is-required">Optional</span>
                <?php endif; ?>
            </label>
            <div class="input-container">
                <input type="number" class="ts-filter" disabled>
                <?php if ( $suffix ): ?>
                    <span class="input-suffix"><?= esc_html( $suffix ) ?></span>
                <?php endif; ?>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
}

if ( ! function_exists( 'voxel_fse_render_select_field' ) ) {
    /**
     * Select field renderer
     * Matches Voxel's select-field.php template structure
     *
     * @param array $field Field configuration
     * @return string HTML for select field
     */
    function voxel_fse_render_select_field( $field ) {
        $label = esc_html( $field['label'] ?? 'Select' );
        $required = $field['required'] ?? false;
        $choices = $field['props']['choices'] ?? [];

        ob_start();
        ?>
        <div class="ts-form-group inline-terms-wrapper ts-inline-filter">
            <label>
                <?= $label ?>
                <?php if ( ! $required ): ?>
                    <span class="is-required">Optional</span>
                <?php endif; ?>
            </label>
            <div class="ts-filter">
                <select disabled>
                    <option>Select an option...</option>
                    <?php foreach ( $choices as $choice ): ?>
                        <option><?= esc_html( $choice['label'] ?? $choice ) ?></option>
                    <?php endforeach; ?>
                </select>
                <div class="ts-down-icon"></div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
}

if ( ! function_exists( 'voxel_fse_render_multiselect_field' ) ) {
    /**
     * Multiselect field renderer
     * Simplified version showing checkbox list
     *
     * @param array $field Field configuration
     * @return string HTML for multiselect field
     */
    function voxel_fse_render_multiselect_field( $field ) {
        $label = esc_html( $field['label'] ?? 'Multi-select' );
        $required = $field['required'] ?? false;
        $choices = $field['props']['choices'] ?? [];

        ob_start();
        ?>
        <div class="ts-form-group">
            <label>
                <?= $label ?>
                <?php if ( ! $required ): ?>
                    <span class="is-required">Optional</span>
                <?php endif; ?>
            </label>
            <div class="ts-filter">
                <?php if ( ! empty( $choices ) ): ?>
                    <?php foreach ( array_slice( $choices, 0, 3 ) as $choice ): ?>
                        <label style="display: block; margin: 5px 0;">
                            <input type="checkbox" disabled>
                            <?= esc_html( $choice['label'] ?? $choice ) ?>
                        </label>
                    <?php endforeach; ?>
                    <?php if ( count( $choices ) > 3 ): ?>
                        <span style="color: #999; font-size: 12px;">...and <?= count( $choices ) - 3 ?> more options</span>
                    <?php endif; ?>
                <?php else: ?>
                    <span style="color: #999;">No options available</span>
                <?php endif; ?>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
}

if ( ! function_exists( 'voxel_fse_render_textarea_field' ) ) {
    /**
     * Textarea field renderer
     * Matches Voxel's textarea field structure
     *
     * @param array $field Field configuration
     * @return string HTML for textarea field
     */
    function voxel_fse_render_textarea_field( $field ) {
        $label = esc_html( $field['label'] ?? 'Description' );
        $required = $field['required'] ?? false;
        $placeholder = esc_attr( $field['props']['placeholder'] ?? '' );

        ob_start();
        ?>
        <div class="ts-form-group">
            <label>
                <?= $label ?>
                <?php if ( ! $required ): ?>
                    <span class="is-required">Optional</span>
                <?php endif; ?>
            </label>
            <textarea class="ts-filter" placeholder="<?= $placeholder ?>" rows="5" disabled></textarea>
        </div>
        <?php
        return ob_get_clean();
    }
}

if ( ! function_exists( 'voxel_fse_render_switcher_field' ) ) {
    /**
     * Switcher field renderer
     * Matches Voxel's switcher-field.php template structure
     *
     * @param array $field Field configuration
     * @return string HTML for switcher field
     */
    function voxel_fse_render_switcher_field( $field ) {
        $label = esc_html( $field['label'] ?? 'Toggle' );

        ob_start();
        ?>
        <div class="ts-form-group switcher-label">
            <label>
                <div class="switch-slider">
                    <div class="onoffswitch">
                        <input type="checkbox" class="onoffswitch-checkbox" disabled>
                        <label class="onoffswitch-label"></label>
                    </div>
                </div>
                <?= $label ?>
            </label>
        </div>
        <?php
        return ob_get_clean();
    }
}

if ( ! function_exists( 'voxel_fse_render_color_field' ) ) {
    /**
     * Color field renderer
     * Matches Voxel's color-field.php template structure
     *
     * @param array $field Field configuration
     * @return string HTML for color field
     */
    function voxel_fse_render_color_field( $field ) {
        $label = esc_html( $field['label'] ?? 'Color' );
        $required = $field['required'] ?? false;
        $placeholder = esc_attr( $field['props']['placeholder'] ?? '' );

        ob_start();
        ?>
        <div class="ts-form-group">
            <label>
                <?= $label ?>
                <?php if ( ! $required ): ?>
                    <span class="is-required">Optional</span>
                <?php endif; ?>
            </label>
            <div class="ts-cp-con">
                <input type="color" class="ts-color-picker" value="#000000" disabled>
                <input type="text" class="color-picker-input" placeholder="<?= $placeholder ?>" disabled>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
}

if ( ! function_exists( 'voxel_fse_render_ui_heading' ) ) {
    /**
     * UI Heading field renderer
     * Matches Voxel's ui-heading-field.php template structure
     *
     * @param array $field Field configuration
     * @return string HTML for UI heading field
     */
    function voxel_fse_render_ui_heading( $field ) {
        $label = $field['label'] ?? 'Heading';

        ob_start();
        ?>
        <div class="ts-form-group ui-heading-field">
            <h3><?= esc_html( $label ) ?></h3>
        </div>
        <?php
        return ob_get_clean();
    }
}

if ( ! function_exists( 'voxel_fse_render_product_field' ) ) {
    /**
     * Product field renderer
     * Shows static preview of product configuration
     *
     * @param array $field Field configuration
     * @return string HTML for product field preview
     */
    function voxel_fse_render_product_field( $field ) {
        $label = esc_html( $field['label'] ?? 'Product' );
        $required = $field['required'] ?? false;
        $product_types = $field['props']['product_types'] ?? [];

        ob_start();
        ?>
        <div class="ts-form-group">
            <div class="form-field-grid">
                <?php if ( ! $required ): ?>
                    <!-- Enable/Disable Switcher -->
                    <div class="ts-form-group switcher-label">
                        <label>
                            <div class="switch-slider">
                                <div class="onoffswitch">
                                    <input type="checkbox" class="onoffswitch-checkbox" disabled>
                                    <label class="onoffswitch-label"></label>
                                </div>
                            </div>
                            <?= $label ?>
                        </label>
                    </div>
                <?php else: ?>
                    <div class="ts-form-group">
                        <label><?= $label ?></label>
                    </div>
                <?php endif; ?>

                <?php if ( count( $product_types ) >= 2 ): ?>
                    <!-- Product Type Selector -->
                    <div class="ts-form-group">
                        <label>Product type</label>
                        <div class="ts-filter">
                            <select disabled>
                                <?php foreach ( $product_types as $key => $type ): ?>
                                    <option><?= esc_html( $type['label'] ?? $key ) ?></option>
                                <?php endforeach; ?>
                            </select>
                            <div class="ts-down-icon"></div>
                        </div>
                    </div>
                <?php endif; ?>

                <!-- Product Sub-fields Indicator -->
                <div class="ts-form-group" style="grid-column: 1 / -1;">
                    <div style="padding: 15px; background: #f8f9fa; border: 1px dashed #dee2e6; border-radius: 4px;">
                        <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 13px;">
                            <strong>Product Configuration Fields:</strong>
                        </p>
                        <ul style="margin: 0; padding-left: 20px; color: #6c757d; font-size: 12px;">
                            <li>Base Price</li>
                            <li>Stock Management</li>
                            <li>Shipping Settings</li>
                            <li>Booking/Calendar (if applicable)</li>
                            <li>Add-ons & Variations (if applicable)</li>
                        </ul>
                        <p style="margin: 10px 0 0 0; color: #6c757d; font-size: 11px; font-style: italic;">
                            Static preview - Interactive fields available on frontend
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
}

if ( ! function_exists( 'voxel_fse_render_fallback_field' ) ) {
    /**
     * Fallback field renderer for complex/unsupported field types
     * Shows field label and type indicator
     *
     * @param array $field Field configuration
     * @return string HTML for fallback field
     */
    function voxel_fse_render_fallback_field( $field ) {
        $label = esc_html( $field['label'] ?? 'Field' );
        $type = esc_html( $field['type'] ?? 'unknown' );

        ob_start();
        ?>
        <div class="ts-form-group">
            <label><?= $label ?> <span style="color: #999;">(<?= $type ?>)</span></label>
            <input type="text" class="ts-filter" placeholder="Preview not available for this field type" disabled>
        </div>
        <?php
        return ob_get_clean();
    }
}

// Debug logging
//error_log('Create Post Block Render: ' . date('Y-m-d H:i:s'));
//error_log('Context: ' . (defined('REST_REQUEST') ? 'REST' : 'Normal'));
//error_log('Is Admin: ' . (is_admin() ? 'Yes' : 'No'));
//error_log('Post Type Key: ' . ($attributes['postTypeKey'] ?? 'Not Set'));
//error_log('GET Context: ' . ($_GET['context'] ?? 'Not Set'));
//error_log('REST_REQUEST constant: ' . (defined('REST_REQUEST') ? (REST_REQUEST ? 'true' : 'false') : 'undefined'));

// Detect admin/editor context
// ServerSideRender uses REST API, so check for both is_admin() and REST context
// Check if we're in admin area OR in a metabox context (do_meta_boxes action)
$is_admin_context = is_admin() || doing_action( 'do_meta_boxes' ) || ( function_exists( 'get_current_screen' ) && get_current_screen() && get_current_screen()->is_block_editor() );

// Detect if we're specifically in the admin metabox (not Gutenberg editor)
// The metabox passes _admin_mode and _admin_post_id attributes
$is_admin_metabox = ! empty( $attributes['_admin_mode'] ) && ! empty( $attributes['_admin_post_id'] );

// Improved editor preview detection
// ServerSideRender in Gutenberg makes requests to /wp-json/wp/v2/block-renderer/
// We need to detect this reliably across different WordPress/Gutenberg versions
// IMPORTANT: Admin metabox should NOT be treated as editor preview - it should render React component
$is_rest = defined('REST_REQUEST') && REST_REQUEST;
$is_block_renderer = strpos( $_SERVER['REQUEST_URI'] ?? '', '/wp-json/wp/v2/block-renderer/' ) !== false;
$is_editor_preview = ( $is_admin_context && ! $is_admin_metabox ) || $is_rest || $is_block_renderer || ( isset($_GET['context']) && $_GET['context'] === 'edit' );

//error_log('Is Editor Preview: ' . ($is_editor_preview ? 'Yes' : 'No'));
//error_log('Is Block Renderer: ' . ($is_block_renderer ? 'Yes' : 'No'));

// Check CSS registration
if ( function_exists( 'voxel' ) ) {
    // Fallback registration if Voxel assets controller hasn't run (e.g. in some FSE contexts)
    if ( ! wp_style_is( 'vx:forms.css', 'registered' ) ) {
        $assets = trailingslashit( get_template_directory_uri() ).'assets/';
        $dist = trailingslashit( $assets ).'dist/';
        $version = function_exists('\Voxel\get_assets_version') ? \Voxel\get_assets_version() : '1.0';

        wp_register_style( 'vx:commons.css', $dist . ( is_rtl() ? 'commons-rtl.css' : 'commons.css' ), [], $version );
        wp_register_style( 'vx:forms.css', $dist . ( is_rtl() ? 'forms-rtl.css' : 'forms.css' ), [], $version );
        wp_register_style( 'vx:create-post.css', $dist . ( is_rtl() ? 'create-post-rtl.css' : 'create-post.css' ), [], $version );

        //error_log('Voxel CSS was not registered, did manual fallback registration.');
    } else {
        //error_log('Voxel CSS is already registered.');
    }
}

// Check if user is logged in
if ( ! is_user_logged_in() ) {
    echo '<div class="vx-create-post-notice">';
    echo '<p>' . esc_html__( 'You must be logged in to create posts.', 'voxel-fse' ) . '</p>';
    echo '</div>';
    return;
}

$user = \Voxel\get_current_user();
$post_type_key = $attributes['postTypeKey'] ?? '';

if ( empty( $post_type_key ) ) {
    echo '<div class="vx-create-post-notice">';
    echo '<p>' . esc_html__( 'No post type selected.', 'voxel-fse' ) . '</p>';
    echo '</div>';
    return;
}

$post_type = \Voxel\Post_Type::get( $post_type_key );
if ( ! $post_type ) {
    echo '<div class="vx-create-post-notice">';
    echo '<p>' . esc_html__( 'Invalid post type.', 'voxel-fse' ) . '</p>';
    echo '</div>';
    return;
}

// Check if editing existing post
$post = null;
$post_id = null;

if ( $is_admin_context && ! empty( $attributes['_admin_post_id'] ) ) {
    // In admin context, use post ID from attributes
    $post = \Voxel\Post::get( $attributes['_admin_post_id'] );
    if ( $post && $post->post_type->get_key() === $post_type_key ) {
        $post_id = $post->get_id();
    } else {
        $post = null;
    }
} elseif ( ! empty( $_GET['post_id'] ) && \Voxel\Post::current_user_can_edit( $_GET['post_id'] ) ) {
    // In frontend context, use post ID from URL parameter
    $post = \Voxel\Post::get( $_GET['post_id'] );
    if ( $post && $post->post_type->get_key() === $post_type_key ) {
        $post_id = $post->get_id();
    } else {
        $post = null;
    }
}

// Check permissions (skip for now in editor preview)
if ( ! $post && ! is_admin() ) {
    if ( ! $user->can_create_post( $post_type_key ) ) {
        echo '<div class="vx-create-post-notice">';
        echo '<p>' . esc_html__( 'You do not have permission to create posts of this type.', 'voxel-fse' ) . '</p>';
        echo '</div>';
        return;
    }
}

// Enqueue WordPress editor assets for texteditor fields
// This loads TinyMCE and the wpautoresize plugin
// Matches Voxel pattern from assets-controller.php:182-186 and texteditor-field.php:120-125
foreach ( $post_type->get_fields() as $field ) {
    if ( $field->get_type() === 'texteditor' && $field->get_prop('editorType') !== 'plain-text' ) {
        if ( ! class_exists( '_WP_Editors', false ) ) {
            require_once( ABSPATH . WPINC . '/class-wp-editor.php' );
        }
        // Deregister editor-buttons style BEFORE enqueuing editor
        // This prevents Query Monitor warning about missing dependency
        wp_deregister_style( 'editor-buttons' );
        \_WP_Editors::enqueue_default_editor();

        break; // Only need to enqueue once
    }
}

// Get fields from post type
$fields_config = [];

foreach ( $post_type->get_fields() as $field ) {
    // Set post context if editing
    if ( $post ) {
        $field->set_post( $post );
    }

    // Check dependencies
    try {
        $field->check_dependencies();
    } catch ( \Exception $e ) {
        continue;
    }

    // Check visibility rules
    if ( ! $field->passes_visibility_rules() ) {
        continue;
    }

    // In admin metabox, skip taxonomy fields using native metabox (1:1 match with Voxel)
    // Evidence: themes/voxel/templates/widgets/create-post.php:99-103
    if ( $is_admin_metabox ) {
        if ( $field->get_type() === 'taxonomy' && $field->get_prop('backend_edit_mode') === 'native_metabox' ) {
            continue;
        }
    }

    // Get field configuration for frontend
    $config = $field->get_frontend_config();

    // CRITICAL FIX: Process choice icons for select/multiselect fields
    // Voxel's get_icon_markup() returns empty string when Elementor is not active
    // Use FSE's Elementor-independent icon processor instead
    if (($field->get_type() === 'multiselect' || $field->get_type() === 'select') && isset($config['props']['choices'])) {
        // Get raw choices with original icon strings (svg:1705, la-regular:lar la-bell, etc.)
        $raw_choices = $field->get_prop('choices');

        // Reprocess icons using FSE's Icon_Processor (Elementor-independent)
        if (!empty($raw_choices) && is_array($config['props']['choices'])) {
            foreach ($config['props']['choices'] as $index => &$choice) {
                // Get original icon string from raw choices
                $original_icon = $raw_choices[$index]['icon'] ?? '';

                // Process icon using FSE's Elementor-independent processor
                if (!empty($original_icon)) {
                    $choice['icon'] = \VoxelFSE\Utils\Icon_Processor::get_icon_markup($original_icon);
                }
            }
            unset($choice); // Break reference
        }
    }

    // CRITICAL FIX: Process taxonomy field term icons
    // Voxel's get_icon_markup() returns empty string when Elementor is not active
    // Fetch raw icon from term meta and process using FSE's Icon_Processor
    // Evidence: themes/voxel/app/post-types/fields/taxonomy-field.php:219
    // Evidence: themes/voxel/app/utils/term-utils.php:88
    if ($field->get_type() === 'taxonomy') {
        // Helper function to recursively reprocess term icons
        $reprocess_term_icons = function(&$terms) use (&$reprocess_term_icons) {
            foreach ($terms as &$term) {
                if (!empty($term['id'])) {
                    // Fetch raw icon from term meta (stored as 'voxel_icon')
                    $raw_icon = get_term_meta($term['id'], 'voxel_icon', true);
                    if ($raw_icon) {
                        $term['icon'] = \VoxelFSE\Utils\Icon_Processor::get_icon_markup($raw_icon);
                    }
                }

                // Recursively process children terms
                if (!empty($term['children']) && is_array($term['children'])) {
                    $reprocess_term_icons($term['children']);
                }
            }
            unset($term); // Break reference
        };

        // Reprocess all terms in the hierarchical tree
        if (isset($config['props']['terms']) && is_array($config['props']['terms'])) {
            $reprocess_term_icons($config['props']['terms']);
        }

        // Reprocess selected terms
        if (isset($config['props']['selected']) && is_array($config['props']['selected'])) {
            foreach ($config['props']['selected'] as $slug => &$selected_term) {
                if (!empty($selected_term['id'])) {
                    $raw_icon = get_term_meta($selected_term['id'], 'voxel_icon', true);
                    if ($raw_icon) {
                        $selected_term['icon'] = \VoxelFSE\Utils\Icon_Processor::get_icon_markup($raw_icon);
                    }
                }
            }
            unset($selected_term); // Break reference
        }
    }

    $fields_config[] = $config;
}

// Debug logging for field configuration
//error_log('==========================================================');
//error_log('CREATE-POST BLOCK: Field Configuration Debug');
//error_log('==========================================================');
//error_log('Post Type: ' . $post_type_key);
//error_log('Post ID: ' . ($post_id ?: 'none (new post)'));
//error_log('Total fields: ' . count($fields_config));
//error_log('Field keys: ' . implode(', ', array_column($fields_config, 'key')));
if (!empty($fields_config)) {
    //error_log('Sample field structure (first field):');
    //error_log(print_r($fields_config[0], true));
}
//error_log('==========================================================');

// Enqueue frontend React on actual frontend (not in editor preview) OR in admin metabox
if ( ! $is_editor_preview || $is_admin_metabox ) {
    $frontend_script_path = get_stylesheet_directory() . '/assets/dist/create-post-frontend.js';
    $frontend_script_url = get_stylesheet_directory_uri() . '/assets/dist/create-post-frontend.js';

    if ( file_exists( $frontend_script_path ) ) {
        //error_log('Enqueueing frontend script: ' . $frontend_script_url);

        // CRITICAL: Enqueue Pikaday BEFORE registering frontend script
        // This ensures WordPress can resolve the dependency when processing script queue
        // Evidence: themes/voxel/app/controllers/assets-controller.php:137
        wp_enqueue_script( 'pikaday' );
        wp_enqueue_style( 'pikaday' );

        // Debug: Check if Pikaday is actually registered and enqueued
        global $wp_scripts;
        if ( isset( $wp_scripts->registered['pikaday'] ) ) {
            //error_log('==========================================================');
            //error_log('Pikaday JS: registered=YES, enqueued=' . (wp_script_is('pikaday', 'enqueued') ? 'YES' : 'NO') . ', src=' . $wp_scripts->registered['pikaday']->src);
            //error_log('Pikaday JS deps: ' . print_r($wp_scripts->registered['pikaday']->deps, true));
            //error_log('==========================================================');
        } else {
            //error_log('==========================================================');
            //error_log('Pikaday JS: registered=NO - CRITICAL ERROR!');
            //error_log('==========================================================');
        }

        // Register script as IIFE (not ES module)
        // We MUST declare dependencies so WordPress loads React/ReactDOM/wp.element before our script runs
        // CRITICAL: Include 'pikaday' dependency so WordPress loads Pikaday BEFORE our React component
        // This ensures window.Pikaday is available when DatePicker.tsx tries to use it
        wp_register_script(
                'voxel-fse-create-post-frontend',
                $frontend_script_url,
                [ 'wp-element', 'wp-i18n', 'wp-api-fetch', 'pikaday' ],
                filemtime( $frontend_script_path ),
                true
        );

        wp_enqueue_script( 'voxel-fse-create-post-frontend' );

        // Pass data to React component via wp_localize_script
        wp_localize_script(
                'voxel-fse-create-post-frontend',
                'voxelFseCreatePost',
                [
                        'restUrl' => rest_url( 'voxel-fse/v1/' ),
                        'ajaxUrl' => add_query_arg( 'vx', 1, home_url( '/' ) ),
                        'nonce' => wp_create_nonce( 'wp_rest' ),
                        'postTypeKey' => $post_type_key,
                        'fieldsConfig' => $fields_config,
                        'postId' => $post_id,
                        'postStatus' => $post ? $post->get_status() : null, // Pass post status for conditional button rendering
                        'adminModeNonce' => $attributes['_admin_nonce'] ?? '',
                        'isAdminMode' => $is_admin_context,
                        'isAdminMetabox' => $is_admin_metabox, // Hide form footer in admin metabox
                        'i18n' => [
                                'required' => __( 'This field is required', 'voxel-fse' ),
                                'uploading' => __( 'Uploading...', 'voxel-fse' ),
                                'processing' => __( 'Processing...', 'voxel-fse' ),
                                'success' => __( 'Success!', 'voxel-fse' ),
                                'error' => __( 'An error occurred', 'voxel-fse' ),
                        ],
                ]
        );

        //error_log('Frontend script enqueued. Fields count: ' . count($fields_config));
    } else {
        //error_log('Frontend script NOT found at: ' . $frontend_script_path);
    }
}

// NOTE: style.css removed - we now use Voxel's original CSS via the vx-popup wrapper
// and FieldPopup React Portal component. See docs/conversion/create-post/popup-positioning-architecture.md

// CRITICAL: Enqueue Line Awesome CSS for icon fonts in ALL contexts
// Needed in block editor preview, frontend, and admin metabox
// Evidence: Icon HTML like <i class="lar la-bell"></i> needs LA font to display
$line_awesome_url = trailingslashit( get_template_directory_uri() ) . 'assets/icons/line-awesome/line-awesome.css';
wp_enqueue_style( 'line-awesome', $line_awesome_url, [], '1.3.0' );

// Enqueue Voxel's form styles for frontend AND admin metabox iframe
// Note: Editor styles are loaded via Block_Loader.php as editorStyle dependencies
// Admin metabox iframe needs Voxel CSS (it's a full page render, isolated from WP admin styles)
// CRITICAL ORDER: commons.css, forms.css, create-post.css, popup-kit.css (parent theme order)
if ( function_exists( 'voxel' ) ) {
    // Enqueue for frontend OR admin metabox iframe (not editor preview)
    // Evidence: Admin metabox uses iframe, needs full Voxel CSS like frontend
    if ( ! $is_editor_preview ) {
        wp_enqueue_style( 'vx:commons.css' );
        wp_enqueue_style( 'vx:forms.css' );
        wp_enqueue_style( 'vx:create-post.css' ); // CRITICAL: keep this after commons.css!
        wp_enqueue_style( 'vx:popup-kit.css' ); // CRITICAL: Required for field popups (multiselect, taxonomy, timezone, etc.)
        wp_print_styles( ['vx:commons.css', 'vx:forms.css', 'vx:create-post.css', 'vx:popup-kit.css'] );
    }
} else {
    // Fallback if Voxel function isn't available but we need styles
    // Load for both frontend and admin metabox iframe
    // CRITICAL ORDER: commons.css, forms.css, create-post.css, popup-kit.css
    if ( ! $is_editor_preview ) {
        $assets = trailingslashit( get_template_directory_uri() ).'assets/';
        $dist = trailingslashit( $assets ).'dist/';
        wp_enqueue_style('vx-fallback-commons', $dist . 'commons.css', [], '1.0');
        wp_enqueue_style('vx-fallback-forms', $dist . 'forms.css', [], '1.0');
        wp_enqueue_style('vx-fallback-create-post', $dist . 'create-post.css', [], '1.0');
        wp_enqueue_style('vx-fallback-popup-kit', $dist . 'popup-kit.css', [], '1.0'); // CRITICAL: Required for field popups
    }
}

// CRITICAL: Enqueue Voxel's JavaScript for admin metabox iframe
// Required for location fields (Voxel.Maps), popup-kit, and other interactive features
// Evidence: Location fields require commons.js for Voxel.Maps API
if ( function_exists( 'voxel' ) && $is_admin_metabox ) {
    // Check if any location fields exist - if so, we need maps scripts
    $has_location_fields = false;
    foreach ( $fields_config as $field_config ) {
        if ( ( $field_config['type'] ?? '' ) === 'location' ) {
            $has_location_fields = true;
            break;
        }
    }

    // Enqueue Vue (dependency for commons.js)
    if ( wp_script_is( 'vue', 'registered' ) ) {
        wp_enqueue_script( 'vue' );
    }

    // Enqueue commons.js (contains Voxel.Maps and Voxel.alert())
    // Required for location fields and other interactive features
    if ( wp_script_is( 'vx:commons.js', 'registered' ) ) {
        wp_enqueue_script( 'vx:commons.js' );

        // CRITICAL: After commons.js loads, ensure everything is properly initialized
        // This handles both cases: Google Maps loaded before/after commons.js
        $admin_google_maps_setup = <<<'JAVASCRIPT'
// After commons.js loads, FORCE GoogleMaps callback to exist
(function() {
	var ensureCallback = function() {
		if (typeof window.Voxel === 'undefined' || typeof window.Voxel.Maps === 'undefined') {
			return false;
		}
		
		// FORCE callback to exist - commons.js may have removed it
		if (typeof window.Voxel.Maps.GoogleMaps !== 'function') {
			console.warn('[Voxel FSE Admin] GoogleMaps callback missing, creating it');
			window.Voxel.Maps.GoogleMaps = function() {
				//console.log('[Voxel FSE Admin] GoogleMaps callback called');
				if (window.Voxel && window.Voxel.Maps) {
					window.Voxel.Maps.Loaded = true;
					if (typeof document !== 'undefined' && document.dispatchEvent) {
						try {
							document.dispatchEvent(new CustomEvent('maps:loaded'));
						} catch(e) {}
					}
				}
			};
		}
		
		// If Google Maps already loaded, trigger initialization
		if (window._voxel_gmaps_callback_fired && typeof google !== 'undefined' && google.maps && !window.Voxel.Maps.Loaded) {
			//console.log('[Voxel FSE Admin] Google Maps loaded, initializing now');
			try {
				if (typeof window.Voxel.Maps.GoogleMaps === 'function') {
					window.Voxel.Maps.GoogleMaps();
				}
			} catch (error) {
				console.error('[Voxel FSE Admin] Error initializing:', error);
			}
		}
		
		return true;
	};
	
	// Try immediately, then retry if needed
	if (!ensureCallback()) {
		var tries = 0;
		var interval = setInterval(function() {
			tries++;
			if (ensureCallback() || tries >= 20) {
				clearInterval(interval);
			}
		}, 50);
	} else {
		//console.log('[Voxel FSE Admin] GoogleMaps callback ensured after commons.js');
	}
})();
JAVASCRIPT;
        wp_add_inline_script( 'vx:commons.js', $admin_google_maps_setup, 'after' );

        // Add post-commons.js script to manually trigger Google Maps initialization if needed
        // This handles edge cases where Google Maps loads but Voxel.Maps isn't initialized yet
        $post_commons_script = <<<'JAVASCRIPT'
// After commons.js loads, manually trigger Google Maps initialization if needed
(function() {
	//console.log('[Voxel FSE Admin] Post-commons.js: Checking Google Maps state');
	//console.log('[Voxel FSE Admin] Voxel.Maps.Loaded:', window.Voxel?.Maps?.Loaded);
	//console.log('[Voxel FSE Admin] google.maps exists:', typeof google !== 'undefined' && google.maps);

	// If Google Maps loaded but Voxel.Maps not initialized, manually trigger callback
	if (typeof google !== 'undefined' && google.maps && !window.Voxel?.Maps?.Loaded) {
		//console.log('[Voxel FSE Admin] Manually triggering Voxel.Maps.GoogleMaps callback...');
		if (typeof window.Voxel?.Maps?.GoogleMaps === 'function') {
			try {
				window.Voxel.Maps.GoogleMaps();
				//console.log('[Voxel FSE Admin] Successfully triggered GoogleMaps callback');
			} catch (error) {
				console.error('[Voxel FSE Admin] Error triggering GoogleMaps callback:', error);
			}
		} else {
			console.warn('[Voxel FSE Admin] Voxel.Maps.GoogleMaps is not a function');
		}
	}
})();
JAVASCRIPT;
        wp_add_inline_script( 'vx:commons.js', $post_commons_script, 'after' );
    }

    // If location fields exist, ensure maps are properly enqueued
    // Note: frontend_props() should have called enqueue_maps() during field config generation,
    // but we double-check here to ensure maps scripts are definitely loaded
    if ( $has_location_fields && function_exists( '\Voxel\enqueue_maps' ) ) {
        \Voxel\enqueue_maps();
    }
}

// Add comprehensive admin styles since we're not loading Voxel CSS in admin
if ( $is_admin_metabox ) {
    ?>
    <style>
        /* Reset metabox padding */
        #voxel_post_fields .inside {
            padding: 12px;
            margin: 0;
        }

        /* Form container */
        #voxel_post_fields .voxel-fse-create-post-frontend {
            max-width: 100%;
        }

        /* Form groups */
        #voxel_post_fields .ts-form-group {
            margin-bottom: 15px;
        }

        #voxel_post_fields .ts-form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
        }

        /* Input fields */
        #voxel_post_fields input[type="text"],
        #voxel_post_fields input[type="email"],
        #voxel_post_fields input[type="url"],
        #voxel_post_fields input[type="tel"],
        #voxel_post_fields input[type="number"],
        #voxel_post_fields textarea,
        #voxel_post_fields select {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }

        #voxel_post_fields input[type="text"]:focus,
        #voxel_post_fields input[type="email"]:focus,
        #voxel_post_fields input[type="url"]:focus,
        #voxel_post_fields input[type="tel"]:focus,
        #voxel_post_fields input[type="number"]:focus,
        #voxel_post_fields textarea:focus,
        #voxel_post_fields select:focus {
            border-color: #2271b1;
            outline: none;
            box-shadow: 0 0 0 1px #2271b1;
        }

        /* Buttons */
        #voxel_post_fields .ts-btn,
        #voxel_post_fields button[type="submit"] {
            background: #2271b1;
            color: #fff;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }

        #voxel_post_fields .ts-btn:hover,
        #voxel_post_fields button[type="submit"]:hover {
            background: #135e96;
        }

        /* Form footer */
        #voxel_post_fields .ts-form-footer {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
        }

        /* Hide elements not needed in admin */
        #voxel_post_fields .ts-form-head,
        #voxel_post_fields .ts-form-progres {
            display: none !important;
        }

        /* Grid layout for form fields */
        #voxel_post_fields .form-field-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 15px;
        }

        @media (min-width: 782px) {
            #voxel_post_fields .form-field-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    </style>
    <?php
}

// Output container for React to mount into
$container_classes = [
        'voxel-fse-create-post-frontend',
        'voxel-fse-create-post-block',
        'elementor-widget-voxel-create-post',
        'ts-create-post',
        'create-post-form',
        'ts-ready',
];

// if ( $is_admin_context ) {
// 	$container_classes[] = 'admin-mode';
// }

// Prepare wrapper attributes using standard Gutenberg function
// This handles alignment, colors, spacing, and custom classes
// NOTE: In admin context (metabox), there's no block context, so we need to handle this differently
// $is_admin_metabox is already defined on line 450
if ( $is_admin_metabox || ! function_exists( 'get_block_wrapper_attributes' ) ) {
    // Admin context or function not available - build attributes manually
    $wrapper_attributes = 'class="' . esc_attr( implode( ' ', $container_classes ) ) . '"';
} else {
    // Frontend block context - use Gutenberg function
    // Additional check: ensure we have a block context (not in metabox)
    // get_block_wrapper_attributes() requires block attributes which may be null in admin
    try {
        $wrapper_attributes = get_block_wrapper_attributes( [
                'class' => implode( ' ', $container_classes ),
        ] );
    } catch ( \Throwable $e ) {
        // Fallback if block context is not available
        $wrapper_attributes = 'class="' . esc_attr( implode( ' ', $container_classes ) ) . '"';
    }
}

?>

<div
        <?php echo $wrapper_attributes; ?>
        data-attributes="<?php echo esc_attr( wp_json_encode( $attributes ) ); ?>"
        data-post-id="<?php echo esc_attr( $post_id ?: '' ); ?>"
        data-admin-mode="<?php echo $is_admin_metabox ? '1' : '0'; ?>"
>
    <!-- DEBUG INFO:
         Context: <?php echo defined('REST_REQUEST') ? 'REST' : 'Normal'; ?>
         Is Admin: <?php echo is_admin() ? 'Yes' : 'No'; ?>
         Is Preview: <?php echo $is_editor_preview ? 'Yes' : 'No'; ?>
         Post Type: <?php echo esc_html($post_type_key); ?>
    -->
    <?php if ( $is_editor_preview || is_admin() ): ?>
        <!-- RENDER PATH: PREVIEW (Admin: <?php echo is_admin() ? 'Yes' : 'No'; ?>, Preview: <?php echo $is_editor_preview ? 'Yes' : 'No'; ?>) -->
        <?php
        // Group fields by steps
        $steps = voxel_fse_group_fields_by_steps( $fields_config );
        $current_step_index = 0; // Always show first step in preview
        $current_step = $steps[ $current_step_index ];
        $submit_text = $attributes['submitButtonText'] ?? 'Publish';
        ?>

        <!-- Full Form Preview (matches Voxel Elementor widget structure) -->
        <div class="ts-form ts-create-post create-post-form" style="background: #fff; padding: 20px; border-radius: 8px; border: 2px dashed #cbd5e1;">

            <!-- Preview Badge -->
            <div style="margin-bottom: 15px; padding: 10px; background: #f1f5f9; border-left: 4px solid #3b82f6; border-radius: 4px;">
                <strong style="color: #1e40af;">📝 Editor Preview</strong>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b;">
                    <?= esc_html( $post_type->get_label() ) ?> |
                    <?= count( $fields_config ) ?> fields
                    <?php if ( count( $steps ) > 1 ): ?>
                        | <?= count( $steps ) ?> steps
                    <?php endif; ?>
                </p>
            </div>

            <?php
            // Render multi-step form header (progress indicator)
            echo voxel_fse_render_form_header( $steps, $current_step_index );
            ?>

            <!-- Form Fields Grid -->
            <div class="create-form-step form-field-grid">
                <?php if ( ! empty( $current_step['fields'] ) ): ?>
                    <?php foreach ( $current_step['fields'] as $field ): ?>
                        <?= voxel_fse_render_field_preview( $field ) ?>
                    <?php endforeach; ?>
                <?php else: ?>
                    <p style="color: #999; text-align: center; padding: 40px 0;">
                        No fields configured for this post type.
                    </p>
                <?php endif; ?>
            </div>

            <?php
            // Render form footer (submit buttons)
            echo voxel_fse_render_form_footer( $steps, $current_step_index, $submit_text );
            ?>

            <!-- Preview Notice -->
            <div style="margin-top: 15px; padding: 10px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; font-size: 12px; color: #92400e;">
                    💡 Static preview - Interactive form appears on frontend
                </p>
            </div>
        </div>
    <?php else: ?>
        <!-- RENDER PATH: FRONTEND (Admin: <?php echo is_admin() ? 'Yes' : 'No'; ?>, Preview: <?php echo $is_editor_preview ? 'Yes' : 'No'; ?>) -->
        <!-- Frontend: React component will mount here -->
        <div class="loading-placeholder" style="text-align: center; padding: 40px;">
            <p style="font-size: 16px; color: #666;">
                <?php esc_html_e( 'Loading form (Frontend Placeholder)...', 'voxel-fse' ); ?>
            </p>
        </div>
    <?php endif; ?>
</div>