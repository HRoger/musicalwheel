<?php
declare(strict_types=1);

/**
 * Block Loader
 *
 * Auto-loads and registers all VoxelFSE blocks with HMR support.
 *
 * @package MusicalWheel
 * @since 1.0.0
 */

namespace VoxelFSE\Blocks;

use VoxelFSE\Utils\Vite_Loader;
use VoxelFSE\Blocks\Shared\Visibility_Evaluator;
use VoxelFSE\Blocks\Shared\Loop_Processor;
use function VoxelFSE\Blocks\Shared\get_advanced_tab_attributes;
use function VoxelFSE\Blocks\Shared\get_voxel_tab_attributes;

if (!defined('ABSPATH')) {
    exit;
}

// Include shared tab attributes (auto-merged into all blocks)
require_once __DIR__ . '/shared/advanced-tab-attributes.php';
require_once __DIR__ . '/shared/voxel-tab-attributes.php';

class Block_Loader
{

    /**
     * Registered blocks
     *
     * @var array
     */
    private static $blocks = [];

    /**
     * Vite loader instance
     *
     * @var Vite_Loader
     */
    private static $vite_loader = null;

    /**
     * Whether dev server is running
     *
     * @var bool|null
     */
    private static $is_dev = null;

    /**
     * Script handles that need type="module" attribute
     * Using a static array allows a single filter to handle all modules
     *
     * @var array
     */
    private static $module_script_handles = [];

    /**
     * Constructor
     */
    public function __construct()
    {
        self::init();
    }

    /**
     * Initialize the block loader
     */
    public static function init()
    {
        add_action('init', [__CLASS__, 'register_block_categories']);
        add_action('init', [__CLASS__, 'load_blocks']);
        add_filter('block_categories_all', [__CLASS__, 'add_block_categories']);
        add_action('rest_api_init', [__CLASS__, 'register_rest_endpoints']);

        // CRITICAL: Add import map BEFORE any scripts are printed
        // Using wp_print_scripts with priority -9999 ensures import map loads BEFORE modules
        // admin_head is too late - WordPress loads block scripts during enqueue_block_editor_assets
        add_action('wp_print_scripts', [__CLASS__, 'add_import_map'], -9999);
        add_action('admin_print_scripts', [__CLASS__, 'add_import_map'], -9999);

        // CENTRALIZED: Single filter to add type="module" for all ES module scripts
        // This prevents multiple filter callbacks being added per block
        add_filter('script_loader_tag', [__CLASS__, 'add_module_type_to_scripts'], 10, 2);

        // Initialize Vite loader
        // Vite outputs manifest.json in the .vite/ subdirectory
        $manifest_path = get_stylesheet_directory() . '/assets/dist/.vite/manifest.json';
        self::$vite_loader = new Vite_Loader($manifest_path, 'http://localhost:3000');

        // Enqueue Voxel core styles in block editor (priority 10 to load early)
        add_action('enqueue_block_editor_assets', [__CLASS__, 'enqueue_voxel_core_styles'], 10);

        // CRITICAL: Inject GoogleMaps callback stub directly in <head> at priority 1
        // Must run BEFORE any scripts are output because Google Maps has loading=async
        // Using admin_head (not wp_add_inline_script) ensures stub is defined before Google Maps loads
        add_action('admin_head', [__CLASS__, 'inject_google_maps_stub_in_head'], 1);

        // FRONTEND: Inject GoogleMaps callback stub in <head> when create-post block is present
        // Same as admin_head injection but for frontend pages with location fields
        add_action('wp_head', [__CLASS__, 'inject_google_maps_stub_in_frontend_head'], 1);

        // FRONTEND: Bypass Voxel's soft-loading for maps scripts when create-post block is present
        // Runs after Voxel's filter (priority 10) to convert data-src back to src
        add_action('wp_enqueue_scripts', [__CLASS__, 'bypass_maps_soft_loading_on_frontend'], 15);

        // Replace backend alert template with frontend template (has full icon support)
        add_action('admin_footer', [__CLASS__, 'inject_frontend_alert_template'], 999);

        // Enqueue Voxel core scripts in block editor (priority 15) - CRITICAL for LocationField maps
        // Priority 15 ensures Voxel's register_scripts (on admin_enqueue_scripts:10) completes first
        // We use admin_enqueue_scripts (not enqueue_block_editor_assets) because we need scripts
        // to be registered before we enqueue them. The method has is_block_editor() checks.
        add_action('admin_enqueue_scripts', [__CLASS__, 'enqueue_voxel_core_scripts'], 15);

        // CRITICAL: Dequeue Vue/commons.js in block editor to prevent Vue errors
        // enqueue_block_editor_assets only fires in block editor, so no need for screen checks
        add_action('enqueue_block_editor_assets', [__CLASS__, 'dequeue_vue_commons_in_block_editor'], 999);

        // Also dequeue at print time in case something re-enqueues after our dequeue
        add_action('admin_print_scripts', [__CLASS__, 'dequeue_vue_commons_in_editor'], 1);
        add_action('admin_print_footer_scripts', [__CLASS__, 'dequeue_vue_commons_in_editor'], 1);

        // Enqueue pikaday at later priority to ensure it loads after editor.css
        // editor.css is auto-enqueued by WordPress when block is used, so we need pikaday to load after
        add_action('enqueue_block_editor_assets', [__CLASS__, 'enqueue_pikaday_styles'], 30);

        // Enqueue noUiSlider for range filter in block editor
        // CRITICAL: noUiSlider is registered by Voxel's Assets_Controller but only enqueued on frontend
        // We must enqueue it in editor for the search-form range slider to work
        // Priority 30 to run at same time as pikaday
        add_action('enqueue_block_editor_assets', [__CLASS__, 'enqueue_nouislider_assets'], 30);

        // Enqueue CodeMirror for custom CSS code editor in AdvancedTab
        // Priority 30 to run at same time as other editor assets
        add_action('enqueue_block_editor_assets', [__CLASS__, 'enqueue_code_editor_assets'], 30);

        // Enqueue shared control CSS files (TagMultiSelect, etc.)
        // Priority 30 to run at same time as other editor assets
        add_action('enqueue_block_editor_assets', [__CLASS__, 'enqueue_shared_control_styles'], 30);

        // Use add_editor_style() to control CSS order in FSE iframe
        // Files are loaded IN ORDER: commons first, social-feed LAST
        // This ensures .vxf-link overrides .flexify in the cascade
        add_action('after_setup_theme', [__CLASS__, 'add_editor_styles_for_fse'], 20);

        // Dequeue backend.css in block editor to prevent breaking Gutenberg layout
        // Priority 20 to run after Voxel's enqueue_backend_scripts (priority 10)
        add_action('admin_enqueue_scripts', [__CLASS__, 'dequeue_backend_css_in_block_editor'], 20);

        // Add metabox styles separately since backend.css is dequeued
        // Priority 25 to run after dequeue
        add_action('admin_enqueue_scripts', [__CLASS__, 'add_metabox_styles_in_block_editor'], 25);

        // Set CSS variable for font-family BEFORE commons.css loads (priority 1, before Voxel's priority 5)
        // This ensures --e-global-typography-text-font-family is set to WordPress system font
        // before commons.css applies font-family: var(--e-global-typography-text-font-family), sans-serif;
        add_action('wp_enqueue_scripts', [__CLASS__, 'set_font_family_css_variable'], 1);

        // Set popup block CSS variables on main document body (priority 1, before Voxel's priority 5)
        // This ensures CSS variables are available for parent theme's commons.css
        add_action('wp_enqueue_scripts', [__CLASS__, 'set_popup_css_variables'], 1);

        // Enqueue vendor CSS (pikaday, nouislider) on frontend when popup block is used
        // Priority 10 to run after Voxel's enqueue_frontend_scripts (priority 5) but before styles are printed
        add_action('wp_enqueue_scripts', [__CLASS__, 'enqueue_frontend_vendor_styles'], 10);

        // Enqueue bar-chart.css on frontend when sales-chart or visit-chart blocks are used
        add_action('wp_enqueue_scripts', [__CLASS__, 'enqueue_frontend_chart_styles'], 10);

        // Enqueue work-hours.css on frontend when work-hours block is used
        add_action('wp_enqueue_scripts', [__CLASS__, 'enqueue_frontend_work_hours_styles'], 10);

        // Enqueue map.css on frontend (using check logic)
        add_action('wp_enqueue_scripts', [__CLASS__, 'enqueue_frontend_map_styles'], 10);

        // Ensure React scripts are available on frontend for Plan C+ blocks
        // WordPress registers react/react-dom but doesn't enqueue them on frontend by default
        // Priority 5 to load early, before blocks need them
        add_action('wp_enqueue_scripts', [__CLASS__, 'ensure_react_on_frontend'], 5);

        // Inject Voxel FSE compatibility shim directly in <head> BEFORE any scripts
        // CRITICAL: Must use wp_head (not wp_enqueue_scripts) to ensure it loads before Voxel's commons.js
        // Priority 1 to inject at the very beginning of <head>
        add_action('wp_head', [__CLASS__, 'inject_voxel_fse_compat'], 1);

        // Enqueue viewport subscriber (PeepSo-style pattern) to dispatch custom events on viewport change
        // Priority 5 to load early, before blocks are rendered
        add_action('enqueue_block_editor_assets', [__CLASS__, 'enqueue_viewport_subscriber'], 5);

        // Disable REST API caching for block render requests
        // This ensures ServerSideRender always fetches fresh content on viewport change
        add_filter('rest_post_dispatch', [__CLASS__, 'disable_block_render_cache'], 10, 3);

        // Enqueue popup-kit global styles
        // Extracts CSS from popup-kit block in kit_popups template and enqueues it globally
        add_action('wp_enqueue_scripts', [__CLASS__, 'enqueue_popup_kit_global_styles'], 100);
        add_action('admin_enqueue_scripts', [__CLASS__, 'enqueue_popup_kit_global_styles'], 100);

        // GLOBAL ABSTRACTION: Handle Visibility, Loop, and VoxelScript for all voxel-fse blocks
        // Priority 10 ensures it runs for all blocks, including those without render_callback
        add_filter('render_block', [__CLASS__, 'apply_voxel_tab_features'], 10, 2);
    }

    /**
     * Mark a script handle as needing type="module" attribute
     * 
     * Call this instead of adding individual add_filter callbacks per block.
     * The centralized filter add_module_type_to_scripts will handle all marked scripts.
     *
     * @param string $script_handle The script handle to mark as ES module
     */
    private static function mark_script_as_module($script_handle)
    {
        if (!in_array($script_handle, self::$module_script_handles, true)) {
            self::$module_script_handles[] = $script_handle;
        }
    }

    /**
     * Centralized filter to add type="module" to ES module scripts
     * 
     * This single filter handles ALL ES module scripts instead of adding
     * one filter callback per block, which was causing performance issues.
     *
     * @param string $tag The script tag HTML
     * @param string $handle The script handle
     * @return string Modified script tag
     */
    public static function add_module_type_to_scripts($tag, $handle)
    {
        // Check if this handle is marked as an ES module
        if (in_array($handle, self::$module_script_handles, true)) {
            // Only add type="module" if not already present
            if (strpos($tag, 'type="module"') === false && strpos($tag, "type='module'") === false) {
                $tag = str_replace('<script ', '<script type="module" ', $tag);
            }
        }
        return $tag;
    }

    /**
     * Ensure Voxel core styles are registered (called during block registration)
     *
     * This registers the styles immediately so they can be used as dependencies
     */
    private static function ensure_voxel_styles_registered()
    {
        // Use parent theme directory (Voxel is the parent)
        $parent_theme_dir = get_template_directory();
        $parent_theme_url = get_template_directory_uri();

        $assets_dir = $parent_theme_dir . '/assets/dist/';
        $assets_url = trailingslashit($parent_theme_url) . 'assets/dist/';
        $version = function_exists('\Voxel\get_assets_version') ? \Voxel\get_assets_version() : '1.0';
        $suffix = is_rtl() ? '-rtl.css' : '.css';

        // Register voxel-fse-commons.css (loads BEFORE vx:commons.css to provide CSS variables)
        if (!wp_style_is('vx:fse-commons.css', 'registered')) {
            $fse_commons_file = 'voxel-fse-commons.css';
            $fse_commons_path = get_stylesheet_directory() . '/assets/css/' . $fse_commons_file;
            $fse_commons_url = get_stylesheet_directory_uri() . '/assets/css/' . $fse_commons_file;

            if (file_exists($fse_commons_path)) {
                wp_register_style(
                        'vx:fse-commons.css',
                        $fse_commons_url,
                        [], // No dependencies - this loads BEFORE vx:commons.css
                        VOXEL_FSE_VERSION
                );
            }
        }

        // Register Elementor Icons (eicons)
        if (!wp_style_is('elementor-icons', 'registered')) {
            $eicons_url = get_stylesheet_directory_uri() . '/assets/lib/eicons/css/elementor-icons.min.css';
            $eicons_path = get_stylesheet_directory() . '/assets/lib/eicons/css/elementor-icons.min.css';
            
            if (file_exists($eicons_path)) {
                wp_register_style(
                    'elementor-icons',
                    $eicons_url,
                    [],
                    '5.30.0'
                );
            }
        }

        // Register commons.css (base styles)
        if (!wp_style_is('vx:commons.css', 'registered')) {
            $commons_file = 'commons' . $suffix;
            $commons_path = $assets_dir . $commons_file;
            if (file_exists($commons_path)) {
                wp_register_style(
                        'vx:commons.css',
                        $assets_url . $commons_file,
                        ['vx:fse-commons.css'], // Depends on voxel-fse-commons.css
                        $version
                );
            }
        }

        // Register forms.css (depends on commons)
        if (!wp_style_is('vx:forms.css', 'registered')) {
            $forms_file = 'forms' . $suffix;
            $forms_path = $assets_dir . $forms_file;
            if (file_exists($forms_path)) {
                wp_register_style(
                        'vx:forms.css',
                        $assets_url . $forms_file,
                        ['vx:commons.css'],
                        $version
                );
            }
        }

        // Register popup-kit.css (depends on commons and forms)
        if (!wp_style_is('vx:popup-kit.css', 'registered')) {
            $popup_file = 'popup-kit' . $suffix;
            $popup_path = $assets_dir . $popup_file;
            if (file_exists($popup_path)) {
                wp_register_style(
                        'vx:popup-kit.css',
                        $assets_url . $popup_file,
                        ['vx:commons.css', 'vx:forms.css'],
                        $version
                );
            }
        }

        // Register product-form.css (depends on forms)
        if (!wp_style_is('vx:product-form.css', 'registered')) {
            $product_form_file = 'product-form' . $suffix;
            $product_form_path = $assets_dir . $product_form_file;
            if (file_exists($product_form_path)) {
                wp_register_style(
                        'vx:product-form.css',
                        $assets_url . $product_form_file,
                        ['vx:forms.css'],
                        $version
                );
            }
        }

        // Register map.css (depends on commons)
        if (!wp_style_is('vx:map.css', 'registered')) {
            $map_file = 'map' . $suffix;
            $map_path = $assets_dir . $map_file;
            if (file_exists($map_path)) {
                wp_register_style(
                        'vx:map.css',
                        $assets_url . $map_file,
                        ['vx:commons.css'],
                        $version
                );
            }
        }

        // Register work-hours.css (depends on commons)
        if (!wp_style_is('vx:work-hours.css', 'registered')) {
            $work_hours_file = 'work-hours' . $suffix;
            $work_hours_path = $assets_dir . $work_hours_file;
            if (file_exists($work_hours_path)) {
                wp_register_style(
                        'vx:work-hours.css',
                        $assets_url . $work_hours_file,
                        ['vx:commons.css'],
                        $version
                );
            }
        }

        // NOTE: vx:review-stats.css is registered in load_blocks() viewScript section
        // without commons.css dependency to avoid loading commons.css on all admin pages.
        // The editor gets commons.css via explicit editorStyle deps instead.

        // Register social-feed.css (depends on forms.css to ensure correct load order)
        // WordPress outputs styles based on dependency graph - social-feed.css must load LAST
        // Dependency chain: fse-commons → commons → forms → social-feed
        // This ensures social-feed.css .vxf-link overrides commons.css .flexify (CSS cascade: later wins)
        if (!wp_style_is('vx:social-feed.css', 'registered')) {
            $social_feed_file = 'social-feed' . $suffix;
            $social_feed_path = $assets_dir . $social_feed_file;
            if (file_exists($social_feed_path)) {
                wp_register_style(
                        'vx:social-feed.css',
                        $assets_url . $social_feed_file,
                        ['vx:forms.css'],  // Depends on forms.css → loads AFTER commons.css
                        $version
                );
            }
        }

        // Register post-feed.css (depends on commons)
        if (!wp_style_is('vx:post-feed.css', 'registered')) {
            $post_feed_file = 'post-feed' . $suffix;
            $post_feed_path = $assets_dir . $post_feed_file;
            if (file_exists($post_feed_path)) {
                wp_register_style(
                        'vx:post-feed.css',
                        $assets_url . $post_feed_file,
                        ['vx:commons.css'],
                        $version
                );
            }
        }

        // Register vendor CSS files (pikaday, nouislider)
        // These are needed for date pickers and range sliders in popup components
        $vendor_dir = $parent_theme_dir . '/assets/vendor/';
        $vendor_url = trailingslashit($parent_theme_url) . 'assets/vendor/';
        $vendor_suffix = function_exists('\Voxel\is_dev_mode') && \Voxel\is_dev_mode() ? '' : '.prod';

        // Register pikaday CSS (needed for date pickers in popup)
        // Even though Voxel's Assets_Controller registers it, we need to ensure it's registered
        // before it's used as a dependency for the popup block's editorStyle
        if (!wp_style_is('pikaday', 'registered')) {
            $pikaday_file = 'pikaday/pikaday' . $vendor_suffix . '.css';
            $pikaday_path = $vendor_dir . $pikaday_file;

            if (file_exists($pikaday_path)) {
                wp_register_style(
                        'pikaday',
                        $vendor_url . $pikaday_file,
                        ['vx:forms.css'], // pikaday depends on forms.css
                        '1.8.15'
                );
            }
        }

        // Register nouislider CSS
        if (!wp_style_is('nouislider', 'registered')) {
            $nouislider_file = 'nouislider/nouislider' . $vendor_suffix . '.css';
            $nouislider_path = $vendor_dir . $nouislider_file;
            if (file_exists($nouislider_path)) {
                wp_register_style(
                        'nouislider',
                        $vendor_url . $nouislider_file,
                        [],
                        '14.6.3'
                );
            }
        }
    }

    /**
     * Dequeue backend.css in block editor to prevent breaking Gutenberg layout
     *
     * backend.css breaks Gutenberg - it must be dequeued.
     * Metabox styles are added separately via add_metabox_styles_in_block_editor()
     *
     * IMPORTANT: Only dequeue vx:backend.css specifically, not backend.js
     * backend.js is needed for Voxel metaboxes (Author, Expiry, Priority)
     */
    public static function dequeue_backend_css_in_block_editor()
    {
        // Only in block editor (not Elementor)
        if (!function_exists('get_current_screen')) {
            return;
        }

        $screen = get_current_screen();
        if (!$screen || !$screen->is_block_editor()) {
            return;
        }

        // Check if we're in Elementor editor (don't do anything there)
        if (isset($_GET['action']) && $_GET['action'] === 'elementor') {
            return;
        }

        // Dequeue ONLY vx:backend.css - do NOT dequeue backend.js
        wp_dequeue_style('vx:backend.css');

        // Use admin_print_styles to ensure it's removed even if re-enqueued
        add_action('admin_print_styles', function () {
            wp_dequeue_style('vx:backend.css');
        }, 999);
    }

    /**
     * Add metabox styles in block editor
     *
     * Since backend.css is dequeued, we need to add Voxel metabox styles separately.
     * This uses a standalone style handle (not dependent on backend.css).
     */
    public static function add_metabox_styles_in_block_editor()
    {
        // Only in block editor (not Elementor)
        if (!function_exists('get_current_screen')) {
            return;
        }

        $screen = get_current_screen();
        if (!$screen || !$screen->is_block_editor()) {
            return;
        }

        // Check if we're in Elementor editor (don't do anything there)
        if (isset($_GET['action']) && $_GET['action'] === 'elementor') {
            return;
        }

        // Register and enqueue standalone metabox styles (NO dependency on backend.css)
        wp_register_style(
                'vx-fse-metabox-styles',
                false, // No actual file, we'll add inline CSS
                [], // No dependencies - standalone
                VOXEL_FSE_VERSION
        );
        wp_enqueue_style('vx-fse-metabox-styles');

        // Add metabox styles
        $metabox_css = <<<'CSS'
/**
 * VoxelFSE Metabox Styles for Gutenberg
 *
 * These styles replace backend.css metabox styling since backend.css is dequeued.
 */

/* ============================================
 * Create Post Fields iframe wrapper (CRITICAL)
 * ============================================ */
#vx-fields-wrapper-fse {
    display: flex;
    justify-content: center;
    overflow: hidden;
    min-height: 200px;
}

#vx-fields-wrapper-fse iframe {
    width: 100%;
    display: block;
    min-height: 400px;
    border: none;
}

/* Ensure the metabox inside has proper display */
#voxel_fse_post_fields .inside {
    padding: 0;
    margin: 0;
}

/* ============================================
 * Fix link styling for Gutenberg interface
 * ============================================ */
body.block-editor-page .edit-post-meta-boxes-area a {
    color: #2271b1;
    text-decoration: underline;
    transition-property: border, background, color;
    transition-duration: .05s;
    transition-timing-function: ease-in-out;
}

body.block-editor-page .ts-form  a.ts-btn-2:active,
body.block-editor-page .ts-form  a.ts-btn-2:hover {
    color: var(--ts-shade-7, #797a88);
}

body.block-editor-page .ts-form  .ts-form-group input:focus {
 
   border: 1px solid var(--ts-shade-3);
   border-radius: .375rem;
   background: #fff;
}

body.block-editor-page .ts-form  input[type=checkbox].disabled, 
body.block-editor-page .ts-form  input[type=checkbox].disabled:checked:before, 
body.block-editor-page .ts-form  input[type=checkbox]:disabled, 
body.block-editor-page .ts-form  input[type=checkbox]:disabled:checked:before,
body.block-editor-page .ts-form  input[type=checkbox][aria-disabled=true], 
body.block-editor-page .ts-form  input[type=radio].disabled, 
body.block-editor-page .ts-form  input[type=radio].disabled:checked:before,
body.block-editor-page .ts-form  input[type=radio]:disabled, 
body.block-editor-page .ts-form  input[type=radio]:disabled:checked:before, 
body.block-editor-page .ts-form  input[type=radio][aria-disabled=true] {
    opacity: 0;
    cursor: default;
}

/* Preserve Voxel link color inside metaboxes */
body.block-editor-page .edit-post-meta-boxes-are #vx-post-author a,
body.block-editor-page .edit-post-meta-boxes-are #vx-post-expiry a,
body.block-editor-page .edit-post-meta-boxes-are #vx-post-priority a,
body.block-editor-page .edit-post-meta-boxes-are #vx-verification-status a {
    /*color: var(--ts-accent-1, #e8315f);*/
    text-decoration: none;
}

body.block-editor-page .edit-post-meta-boxes-area .postbox .handle-order-higher,
 body.block-editor-page .edit-post-meta-boxes-area .postbox .handle-order-lower {    
    display: none;
}

/* ============================================
 * Author metabox styles (from backend.css)
 * ============================================ */
#vx-post-author .change-author {
    display: inline-block;
    margin-top: 0;
}

#vx-post-author .author-details img {
    width: 30px;
    height: 30px;
    object-fit: contain;
    border-radius: 50px;
}

#vx-post-author .author-details {
    display: flex;
    grid-gap: 10px;
    gap: 10px;
    align-items: center;
}

#vx-post-author .author-details a {
    text-decoration: none;
    font-weight: 600;
}

#vx-post-author .author-avatar {
    display: flex;
}

#vx-post-author .author-name {
    display: flex;
    grid-gap: 5px;
    gap: 5px;
}

#vx-post-author input {
    width: 100%;
    margin-bottom: 10px;
}

#vx-post-author .search-results {
    display: flex;
    flex-direction: column;
    margin-top: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
}

#vx-post-author a.single-result {
    text-decoration: none;
    color: #000;
    padding: 6px 10px;
}

#vx-post-author a.single-result:not(:first-child) {
    border-top: 1px solid #ddd;
}

#vx-post-author a.single-result:hover {
    background: #f6f7f7;
}

#vx-post-author p.search-status {
    text-align: center;
    margin: 10px 0 0;
}

/* ============================================
 * Expiry metabox styles (from backend.css)
 * ============================================ */

body.block-editor-page .edit-post-meta-boxes-area #vx-post-expiry {
    margin-top: 0;
    margin-bottom: 0;
}

#vx-post-expiry .expiry-options {
    border: 1px solid #ddd;
    border-radius: 5px;
    overflow: hidden;
}

#vx-post-expiry .expiry-option:not(:first-child) {
    border-top: 1px solid #ddd;
}

#vx-post-expiry .expiry-option > label {
    display: block;
    padding: 10px 15px;
    background: #f6f7f7;
}

#vx-post-expiry .expiry-mode-details {
    border-top: 1px solid #ddd;
    padding: 10px 8px;
}

/* ============================================
 * Priority metabox styles (from backend.css)
 * ============================================ */
body.block-editor-page .edit-post-meta-boxes-area #vx-post-priority {
    margin-top: 0;
    margin-bottom: 0;
}

#vx-post-priority .priority-options {
    border: 1px solid #ddd;
    border-radius: 5px;
    overflow: hidden;
}

#vx-post-priority .priority-option:not(:first-child) {
    border-top: 1px solid #ddd;
}

#vx-post-priority .priority-option > label {
    display: block;
    padding: 10px 15px;
    background: #f6f7f7;
}

#vx-post-priority .priority-custom {
    display: none;
    float: right;
    height: 21px;
    min-height: 21px;
    width: 60px;
    padding: 3px 5px;
}

#vx-post-priority .priority-option input[type=radio]:checked ~ .priority-custom {
    display: inline-block;
}

/* ============================================
 * Promotion metabox styles (from backend.css)
 * ============================================ */
body.block-editor-page .edit-post-meta-boxes-area #vx-post-promotion {
    margin-top: 0;
    margin-bottom: 0;
}

#vx-post-promotion .promotion-wrapper {
    border: 1px solid #ddd;
    border-radius: 5px;
    overflow: hidden;
}

#vx-post-promotion .promotion-title > strong {
    display: block;
    padding: 10px 15px;
    background: #f6f7f7;
}

#vx-post-promotion .promotion-details {
    border-top: 1px solid #ddd;
    padding: 10px 8px;
}

/* ============================================
 * Postbox styling fixes
 * ============================================ */
body.block-editor-page .postbox-container .meta-box-sortables h2 {
    white-space: nowrap;
    min-width: 0;
}

/* ============================================
 * Meta-box resize handle
 * ============================================ */
body.block-editor-page .edit-post-meta-boxes-area__container {
    display: flex;
    flex-direction: column;
}

body.block-editor-page .components-resizable-box__handle,
body.block-editor-page .edit-post-meta-boxes-area .components-resizable-box__handle {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
}

body.block-editor-page .edit-post-meta-boxes-area .components-resizable-box__handle-top {
    height: 12px;
    cursor: ns-resize;
    background: #f0f0f1;
    border-bottom: 1px solid #c3c4c7;
    position: relative;
}

body.block-editor-page .edit-post-meta-boxes-area .components-resizable-box__handle-top::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 50px;
    height: 4px;
    background: #c3c4c7;
    border-radius: 2px;
}

body.block-editor-page .edit-post-meta-boxes-area .components-resizable-box__handle-top:hover::after {
    background: #2271b1;
}

/* ============================================
 * Sidebar metabox styling
 * ============================================ */
body.block-editor-page .edit-post-sidebar .postbox,
body.block-editor-page .interface-interface-skeleton__sidebar .postbox {
    margin: 0;
    border: none;
    box-shadow: none;
}

body.block-editor-page .edit-post-sidebar #vx-post-plan a,
body.block-editor-page .edit-post-sidebar #vx-verification-status a {
    color: #2271b1;
}

body.block-editor-page .edit-post-sidebar .inside,
body.block-editor-page .interface-interface-skeleton__sidebar .inside {
    padding: 0 24px 24px;
    margin: 0;
}
CSS;

//        wp_add_inline_style('vx-fse-metabox-styles', $metabox_css);
    }


    /**
     * Enqueue Voxel core styles for the block editor
     *
     * Essential for Voxel blocks (like Popup Kit) to render correctly in Gutenberg
     * Evidence: Voxel widget uses get_style_depends() returning ['vx:forms.css', 'vx:popup-kit.css']
     * Reference: themes/voxel/app/widgets/popup-kit.php:1630-1632
     */
    public static function enqueue_voxel_core_styles()
    {
        // Check if we're in admin area (covers both post editor and FSE template editor)
        if (!is_admin()) {
            return;
        }

        // Additional check: Only run in block editor contexts
        // This includes both post editor and FSE template editor
        if (function_exists('get_current_screen')) {
            $screen = get_current_screen();
            // is_block_editor() returns true for post editor, but false for FSE template editor
            // So we also check for 'site-editor' which is the FSE template editor
            $is_block_editor_context = ($screen && $screen->is_block_editor()) ||
                    ($screen && $screen->id === 'site-editor');

            if (!$is_block_editor_context) {
                return;
            }
        }

        // Register styles first to ensure they are available for dependencies
        // This method is defined in ensure_voxel_styles_registered() which is called during block registration
        // But we also need to ensure vendor CSS is registered
        self::ensure_voxel_styles_registered();

        // NOTE: DO NOT enqueue fse-commons, commons, forms, or social-feed here!
        // These are loaded via add_editor_style() in add_editor_styles_for_fse()
        // Loading them here via wp_enqueue_style() causes DUPLICATES and breaks CSS cascade order
        // add_editor_style() inlines CSS in a specific order; wp_enqueue_style() loads external sheets AFTER

        // Only enqueue styles NOT handled by add_editor_style()
        if (wp_style_is('vx:popup-kit.css', 'registered') && !wp_style_is('vx:popup-kit.css', 'enqueued')) {
            wp_enqueue_style('vx:popup-kit.css');
        }
        if (wp_style_is('vx:product-form.css', 'registered') && !wp_style_is('vx:product-form.css', 'enqueued')) {
            wp_enqueue_style('vx:product-form.css');
        }

        // Enqueue Voxel map styles
        // This ensures the map block inherits parent theme styles in the editor
        if (wp_style_is('vx:map.css', 'registered') && !wp_style_is('vx:map.css', 'enqueued')) {
            wp_enqueue_style('vx:map.css');
        }

        // Enqueue nouislider CSS (pikaday is enqueued separately at priority 30)
        if (wp_style_is('nouislider', 'registered')) {
            wp_enqueue_style('nouislider');
        }

        // Enqueue Elementor Icons
        if (wp_style_is('elementor-icons', 'registered') && !wp_style_is('elementor-icons', 'enqueued')) {
            wp_enqueue_style('elementor-icons');
        }

        // Enqueue bar-chart.css for sales-chart and visit-chart blocks in editor
        // Register if not already registered (Voxel may not register it for admin)
        if (!wp_style_is('vx:bar-chart.css', 'registered')) {
            $dist = trailingslashit(get_template_directory_uri()) . 'assets/dist/';
            $version = function_exists('\Voxel\get_assets_version') ? \Voxel\get_assets_version() : '1.7.1.3';
            wp_register_style(
                    'vx:bar-chart.css',
                    $dist . (is_rtl() ? 'bar-chart-rtl.css' : 'bar-chart.css'),
                    [],
                    $version
            );
        }
        if (wp_style_is('vx:bar-chart.css', 'registered')) {
            wp_enqueue_style('vx:bar-chart.css');
        }
    }

    /**
     * Enqueue pikaday CSS at later priority to ensure it loads after editor.css
     *
     * This ensures pikaday.prod.css loads AFTER the block's editor.css,
     * so pikaday styles take precedence over our overrides.
     *
     * Note: pikaday is already registered by Voxel's Assets_Controller
     * Evidence: themes/voxel/app/controllers/assets-controller.php:130
     * Voxel enqueues it on admin_enqueue_scripts, but we need it on enqueue_block_editor_assets
     * to ensure correct load order with our editor.css
     */
    public static function enqueue_pikaday_styles()
    {
        // Check if we're in admin area (covers both post editor and FSE template editor)
        if (!is_admin()) {
            return;
        }

        // Additional check: Only run in block editor contexts
        // This includes both post editor and FSE template editor
        if (function_exists('get_current_screen')) {
            $screen = get_current_screen();
            // is_block_editor() returns true for post editor, but false for FSE template editor
            // So we also check for 'site-editor' which is the FSE template editor
            $is_block_editor_context = ($screen && $screen->is_block_editor()) ||
                    ($screen && $screen->id === 'site-editor');

            if (!$is_block_editor_context) {
                return;
            }
        }

        // Pikaday is registered by Voxel's Assets_Controller
        // Ensure it loads after editor.css by enqueuing at this priority (30)
        // Also add inline CSS to ensure pikaday styles apply with high specificity
        if (wp_style_is('pikaday', 'registered')) {
            // Check if already enqueued (Voxel might have enqueued it on admin_enqueue_scripts)
            if (!wp_style_is('pikaday', 'enqueued')) {
                wp_enqueue_style('pikaday');
            }

            // Note: pikaday.prod.css should apply naturally since it loads after editor.css
            // The :not([class*="pika"]) exclusions in editor.css should prevent conflicts
        } else {
            // If not registered by Voxel, try to register it ourselves as fallback
            $parent_theme_dir = get_template_directory();
            $parent_theme_url = get_template_directory_uri();
            $vendor_dir = $parent_theme_dir . '/assets/vendor/';
            $vendor_url = trailingslashit($parent_theme_url) . 'assets/vendor/';
            $vendor_suffix = function_exists('\Voxel\is_dev_mode') && \Voxel\is_dev_mode() ? '' : '.prod';
            $pikaday_file = 'pikaday/pikaday' . $vendor_suffix . '.css';
            $pikaday_path = $vendor_dir . $pikaday_file;

            if (file_exists($pikaday_path)) {
                wp_register_style(
                        'pikaday',
                        $vendor_url . $pikaday_file,
                        ['vx:forms.css'],
                        '1.8.15'
                );
                wp_enqueue_style('pikaday');
            }
        }

        // CRITICAL: Also enqueue Pikaday JavaScript for date fields in block editor
        // Without this, window.Pikaday will be undefined and DatePicker won't work
        if (wp_script_is('pikaday', 'registered')) {
            if (!wp_script_is('pikaday', 'enqueued')) {
                wp_enqueue_script('pikaday');
            }
        } else {
            // Fallback: register and enqueue if Voxel hasn't registered it
            $parent_theme_dir = get_template_directory();
            $parent_theme_url = get_template_directory_uri();
            $vendor_dir = $parent_theme_dir . '/assets/vendor/';
            $vendor_url = trailingslashit($parent_theme_url) . 'assets/vendor/';
            $vendor_suffix = function_exists('\Voxel\is_dev_mode') && \Voxel\is_dev_mode() ? '' : '.prod';
            $pikaday_js_file = 'pikaday/pikaday' . $vendor_suffix . '.js';
            $pikaday_js_path = $vendor_dir . $pikaday_js_file;

            if (file_exists($pikaday_js_path)) {
                wp_register_script(
                        'pikaday',
                        $vendor_url . $pikaday_js_file,
                        ['jquery'],
                        '1.8.15',
                        true
                );
                wp_enqueue_script('pikaday');
            }
        }
    }

    /**
     * Enqueue noUiSlider assets in block editor for range slider filter
     *
     * CRITICAL: noUiSlider is registered by Voxel's Assets_Controller
     * but only enqueued on frontend (preview mode) or when search-form widget is used.
     * We need it in the Gutenberg editor for our FilterRange component to work.
     *
     * Evidence: themes/voxel/app/controllers/assets-controller.php:134,141,184-186
     */
    public static function enqueue_nouislider_assets()
    {
        // Check if we're in admin area (covers both post editor and FSE template editor)
        if (!is_admin()) {
            return;
        }

        // Additional check: Only run in block editor contexts
        if (function_exists('get_current_screen')) {
            $screen = get_current_screen();
            $is_block_editor_context = ($screen && $screen->is_block_editor()) ||
                    ($screen && $screen->id === 'site-editor');

            if (!$is_block_editor_context) {
                return;
            }
        }

        // noUiSlider is registered by Voxel's Assets_Controller (admin_enqueue_scripts priority 10)
        // Ensure both CSS and JS are enqueued for the editor

        // Enqueue noUiSlider CSS
        if (wp_style_is('nouislider', 'registered')) {
            if (!wp_style_is('nouislider', 'enqueued')) {
                wp_enqueue_style('nouislider');
            }
        } else {
            // Fallback: register if Voxel hasn't registered it
            $parent_theme_url = get_template_directory_uri();
            $vendor_url = trailingslashit($parent_theme_url) . 'assets/vendor/';
            $vendor_suffix = function_exists('\Voxel\is_dev_mode') && \Voxel\is_dev_mode() ? '' : '.prod';
            $nouislider_css_file = 'nouislider/nouislider' . $vendor_suffix . '.css';

            wp_register_style(
                    'nouislider',
                    $vendor_url . $nouislider_css_file,
                    [],
                    '14.6.3'
            );
            wp_enqueue_style('nouislider');
        }

        // Enqueue noUiSlider JavaScript
        if (wp_script_is('nouislider', 'registered')) {
            if (!wp_script_is('nouislider', 'enqueued')) {
                wp_enqueue_script('nouislider');
            }
        } else {
            // Fallback: register if Voxel hasn't registered it
            $parent_theme_url = get_template_directory_uri();
            $vendor_url = trailingslashit($parent_theme_url) . 'assets/vendor/';
            $vendor_suffix = function_exists('\Voxel\is_dev_mode') && \Voxel\is_dev_mode() ? '' : '.prod';
            $nouislider_js_file = 'nouislider/nouislider' . $vendor_suffix . '.js';

            wp_register_script(
                    'nouislider',
                    $vendor_url . $nouislider_js_file,
                    ['jquery'],
                    '14.6.3',
                    true
            );
            wp_enqueue_script('nouislider');
        }
    }

    /**
     * Enqueue CodeMirror (wp.codeEditor) for Custom CSS editor in AdvancedTab
     *
     * WordPress includes CodeMirror for the theme/plugin editor.
     * We enqueue it in the block editor for our CodeEditorControl component.
     *
     * @since 1.0.0
     */
    public static function enqueue_code_editor_assets()
    {
        // Check if we're in admin area (covers both post editor and FSE template editor)
        if (!is_admin()) {
            return;
        }

        // Additional check: Only run in block editor contexts
        if (function_exists('get_current_screen')) {
            $screen = get_current_screen();
            $is_block_editor_context = ($screen && $screen->is_block_editor()) ||
                    ($screen && $screen->id === 'site-editor');

            if (!$is_block_editor_context) {
                return;
            }
        }

        // Enqueue WordPress code editor (wraps CodeMirror)
        // This provides the wp.codeEditor JavaScript API our React component uses
        $settings = wp_enqueue_code_editor([
            'type' => 'text/css',
            'codemirror' => [
                'mode' => 'css',
                'lineNumbers' => true,
                'lineWrapping' => true,
                'autoCloseBrackets' => true,
                'matchBrackets' => true,
                'indentUnit' => 2,
                'tabSize' => 2,
                'indentWithTabs' => true,
                'lint' => true,
                'gutters' => ['CodeMirror-lint-markers', 'CodeMirror-linenumbers'],
            ],
        ]);

        // If code editor failed to enqueue (user has disabled syntax highlighting)
        // we still have a fallback textarea in the component
        if (false === $settings) {
            return;
        }

        // Also enqueue CSS lint addon for error highlighting in the gutter
        wp_enqueue_script('csslint');
    }

    /**
     * Enqueue shared control CSS files (TagMultiSelect, etc.)
     *
     * These CSS files are from shared controls that are code-split by Vite.
     * WordPress doesn't automatically enqueue CSS from dynamically imported chunks,
     * so we must manually enqueue them here.
     *
     * @since 1.0.0
     */
    public static function enqueue_shared_control_styles()
    {
        // The enqueue_block_editor_assets hook already only fires in block editor contexts
        // so we don't need additional screen checks that might fail in FSE

        $build_url = get_stylesheet_directory_uri() . '/assets/dist';

        // Note: TagMultiSelect styles are bundled into shared-controls.css via the shared controls index

        // Enqueue shared controls CSS (elementor-controls.css, StyleTabPanel.css)
        // Note: enable-tags-button.css is code-split by Vite and enqueued separately below
        // CRITICAL: This file contains :root CSS variables (--vxfse-accent-color, etc.) needed by
        // StyleTabPanel, StateTabPanel, ChooseControl inline variant, ImageUploadControl, and other controls.
        // Must be loaded for all blocks.
        wp_enqueue_style(
            'voxel-fse-shared-controls-main',
            $build_url . '/shared-controls.css',
            [],
            defined('VOXEL_FSE_VERSION') ? VOXEL_FSE_VERSION : '1.0.0'
        );

        // Enqueue Enable Tags Button CSS (code-split chunk)
        // Used by IconPickerControl, ImageUploadControl, GalleryUploadControl for dynamic tag button
        // Vite splits this from shared-controls.css because multiple entry points import it
        wp_enqueue_style(
            'voxel-fse-enable-tags-button',
            $build_url . '/enable-tags-button.css',
            [],
            defined('VOXEL_FSE_VERSION') ? VOXEL_FSE_VERSION : '1.0.0'
        );

        // Enqueue RepeaterControl CSS (code-split chunk)
        // Used by advanced-list, search-form, and other blocks with repeater fields
        wp_enqueue_style(
            'voxel-fse-repeater-control',
            $build_url . '/RepeaterControl.css',
            [],
            defined('VOXEL_FSE_VERSION') ? VOXEL_FSE_VERSION : '1.0.0'
        );

        // Enqueue Elementor Icons (eicons) for IconPickerControl buttons
        // Uses eicon-ban, eicon-upload, eicon-circle-o classes
        $lib_url = get_stylesheet_directory_uri() . '/assets/lib';
        wp_enqueue_style(
            'voxel-fse-elementor-icons',
            $lib_url . '/eicons/css/elementor-icons.min.css',
            [],
            '5.44.0'
        );
    }

    /**
     * Add editor styles for FSE iframe using add_editor_style()
     *
     * IMPORTANT: Only load truly GLOBAL child theme styles here.
     * Block-specific parent theme styles (commons, forms, social-feed) are loaded
     * via block editorStyle dependencies - this is the proper child theme pattern.
     *
     * Benefits of dependency-based loading:
     * - Styles only load when the block is actually used
     * - WordPress handles load order via dependency chain
     * - No duplicate loading (add_editor_style + wp_enqueue_style)
     * - Follows WordPress child theme best practices
     *
     * @since 1.0.0
     */
    public static function add_editor_styles_for_fse()
    {
        // Only load child theme's global CSS variables
        // Parent theme styles are loaded via block dependencies when blocks are used
        add_editor_style('assets/css/voxel-fse-commons.css');
    }

    /**
     * Replace backend alert template with frontend template
     *
     * Backend template is simplified, frontend has full icon support
     * We replace the backend template (#vx-alert-tpl) with the frontend version
     *
     * @since 1.0.0
     */
    public static function inject_frontend_alert_template()
    {
        // Only inject in block editor contexts
        if (!function_exists('get_current_screen')) {
            return;
        }

        $screen = get_current_screen();
        $is_block_editor_context = ($screen && $screen->is_block_editor()) ||
                ($screen && $screen->id === 'site-editor');

        if (!$is_block_editor_context) {
            return;
        }

        // Remove backend template and replace with frontend template
        ?>
        <script type="text/javascript">
            // Remove backend alert template
            var backendTemplate = document.getElementById('vx-alert-tpl');
            if (backendTemplate) {
                backendTemplate.remove();
            }
        </script>
        <script type="text/html" id="vx-alert-tpl">
            <div class="ts-notice ts-notice-{type}">
                <div class="alert-msg">
                    <div class="alert-ic">
                        <?php \Voxel\svg('checkmark-circle.svg') ?>
                        <?php \Voxel\svg('cross-circle.svg') ?>
                        <?php \Voxel\svg('notification.svg') ?>
                        <?php \Voxel\svg('info.svg') ?>
                    </div>
                    {message}
                </div>

                <div class="a-btn alert-actions">
                    <a href="#" class="ts-btn ts-btn-4 close-alert"><?= _x('Close', 'close alert', 'voxel') ?></a>
                </div>
            </div>
        </script>
        <?php
    }

    /**
     * Inject GoogleMaps callback stub directly in admin <head>
     *
     * CRITICAL: This MUST run before ANY scripts are loaded.
     * Google Maps API has loading=async which means it can execute immediately after download.
     * Using admin_head at priority 1 ensures the stub is defined before Google Maps loads.
     *
     * This matches the approach in admin-metabox-iframe.php which works correctly.
     *
     * @since 1.0.0
     */
    public static function inject_google_maps_stub_in_head()
    {
        // Only inject in block editor contexts
        if (!function_exists('get_current_screen')) {
            return;
        }

        $screen = get_current_screen();
        $is_block_editor_context = ($screen && $screen->is_block_editor()) ||
                ($screen && $screen->id === 'site-editor');

        if (!$is_block_editor_context) {
            return;
        }

        // Output stub script directly in head - this runs BEFORE any wp_enqueue_script output
        ?>
        <script type="text/javascript">
            // CRITICAL: Define Voxel.Maps.GoogleMaps stub IMMEDIATELY in head
            // Google Maps async script will call this when it finishes loading
            // Must be defined BEFORE the Google Maps script tag is output
            (function () {
                'use strict';

                // Initialize Voxel object structure IMMEDIATELY (synchronously)
                if (typeof window.Voxel === 'undefined') {
                    window.Voxel = {};
                }
                if (typeof window.Voxel.Maps === 'undefined') {
                    window.Voxel.Maps = {};
                }

                // Helper to check if vx:google-maps.js has loaded (defines Map class)
                function isVoxelMapsReady() {
                    return window.Voxel &&
                        window.Voxel.Maps &&
                        typeof window.Voxel.Maps.Map === 'function';
                }

                // Helper to dispatch maps:loaded event
                function dispatchMapsLoaded() {
                    if (window._voxel_maps_loaded_dispatched) return;
                    window._voxel_maps_loaded_dispatched = true;

                    if (window.Voxel && window.Voxel.Maps) {
                        window.Voxel.Maps.Loaded = true;
                    }
                    if (typeof document !== 'undefined' && document.dispatchEvent) {
                        try {
                            document.dispatchEvent(new CustomEvent('maps:loaded'));
                        } catch (e) {
                        }
                    }
                }

                // Store callback function reference
                var gmapsCallbackStub = function () {
                    window._voxel_gmaps_loaded = true;
                    window._voxel_gmaps_callback_fired = true;

                    // Only dispatch maps:loaded if vx:google-maps.js has loaded
                    if (isVoxelMapsReady()) {
                        dispatchMapsLoaded();
                    } else {
                        // Poll for vx:google-maps.js to load
                        var waitCount = 0;
                        var waitInterval = setInterval(function () {
                            waitCount++;
                            if (isVoxelMapsReady()) {
                                clearInterval(waitInterval);
                                dispatchMapsLoaded();
                            }
                            if (waitCount >= 200) { // Stop after 10 seconds
                                clearInterval(waitInterval);
                                console.error('[Voxel FSE] Timeout waiting for vx:google-maps.js');
                            }
                        }, 50);
                    }
                };

                // Assign immediately - MUST exist before Google Maps loads
                window.Voxel.Maps.GoogleMaps = gmapsCallbackStub;

                // Monitor and restore callback if commons.js replaces Voxel.Maps
                var checkCount = 0;
                var checkInterval = setInterval(function () {
                    checkCount++;
                    if (window.Voxel && window.Voxel.Maps) {
                        if (typeof window.Voxel.Maps.GoogleMaps !== 'function') {
                            window.Voxel.Maps.GoogleMaps = gmapsCallbackStub;
                            // If Google Maps already loaded, trigger callback now
                            if (window._voxel_gmaps_loaded && typeof google !== 'undefined' && google.maps && !window._voxel_maps_loaded_dispatched) {
                                gmapsCallbackStub();
                            }
                        }
                    }
                    if (checkCount >= 100) { // Stop after 5 seconds
                        clearInterval(checkInterval);
                    }
                }, 50);
            })();
        </script>
        <?php
    }

    /**
     * Register early GoogleMaps callback stub via WordPress script API (DEPRECATED)
     *
     * NOTE: This method is no longer used. The stub is now injected directly via
     * inject_google_maps_stub_in_head() because wp_add_inline_script outputs too late.
     *
     * @deprecated Use inject_google_maps_stub_in_head() instead
     * @since 1.0.0
     */
    public static function register_early_google_maps_stub()
    {
        // Deprecated - stub is now injected via admin_head
        // Keeping this method for backwards compatibility but it does nothing
    }

    /**
     * Inject GoogleMaps callback stub in frontend <head> when map-requiring blocks are present
     *
     * CRITICAL: This MUST run before ANY scripts are loaded on frontend.
     * Google Maps API has loading=async which means it can execute immediately after download.
     * If the callback (Voxel.Maps.GoogleMaps) doesn't exist, Google Maps silently fails.
     *
     * This is the frontend equivalent of inject_google_maps_stub_in_head() which handles admin contexts.
     *
     * @since 1.0.0
     */
    public static function inject_google_maps_stub_in_frontend_head()
    {
        // Only run on frontend (not in admin)
        if (is_admin()) {
            return;
        }

        // Check which map provider is configured
        // The Google Maps callback stub is ONLY needed for Google Maps provider
        // OpenStreetMap/Mapbox have different initialization mechanisms
        $map_provider = 'google_maps'; // Default
        if (function_exists('\Voxel\get')) {
            $map_provider = \Voxel\get('settings.maps.provider', 'google_maps');
        }

        // Only inject Google Maps callback stub if using Google Maps
        // OpenStreetMap uses Leaflet which doesn't need a callback - it dispatches maps:loaded on script load
        // Mapbox also doesn't use the callback mechanism
        if ($map_provider !== 'google_maps') {
            // For non-Google Maps providers, just initialize Voxel.Maps structure
            // The actual maps:loaded event is dispatched by Voxel's openstreetmap.js or mapbox.js
            ?>
            <script type="text/javascript">
                // FRONTEND: Initialize Voxel.Maps structure for OpenStreetMap/Mapbox
                (function () {
                    'use strict';
                    if (typeof window.Voxel === 'undefined') {
                        window.Voxel = {};
                    }
                    if (typeof window.Voxel.Maps === 'undefined') {
                        window.Voxel.Maps = {};
                    }
                    // OpenStreetMap/Mapbox don't use the GoogleMaps callback
                    // They dispatch maps:loaded event themselves after Leaflet/Mapbox loads
                    console.log('[VoxelFSE Frontend] Non-Google Maps provider detected, skipping callback stub');
                })();
            </script>
            <?php
            return;
        }

        // ALWAYS inject the Google Maps callback stub when using Google Maps provider
        // This is needed because:
        // 1. Google Maps API uses async loading with a callback (Voxel.Maps.GoogleMaps)
        // 2. The callback must exist BEFORE the Google Maps API script loads
        // 3. Maps can be loaded by FSE blocks OR Voxel widgets (post-feed, search-form, etc.)
        // 4. We can't predict at wp_head time which widgets will load maps
        // Output Google Maps stub script directly in head - runs BEFORE any wp_enqueue_script output
        ?>
        <script type="text/javascript">
            // FRONTEND: Define Voxel.Maps.GoogleMaps stub IMMEDIATELY in head
            // Google Maps async script will call this when it finishes loading
            // Must be defined BEFORE the Google Maps script tag is output
            (function () {
                'use strict';
                console.log('[VoxelFSE Frontend] GoogleMaps callback stub initializing...');

                // Initialize Voxel object structure IMMEDIATELY (synchronously)
                if (typeof window.Voxel === 'undefined') {
                    window.Voxel = {};
                }
                if (typeof window.Voxel.Maps === 'undefined') {
                    window.Voxel.Maps = {};
                }

                // Store reference to our Maps object
                var ourMapsObject = window.Voxel.Maps;

                // CRITICAL: Intercept attempts to replace Voxel.Maps entirely
                // commons.js does: Voxel.Maps = { ... } which would lose our await
                var _voxelMapsValue = ourMapsObject;
                Object.defineProperty(window.Voxel, 'Maps', {
                    configurable: true,
                    enumerable: true,
                    get: function() {
                        return _voxelMapsValue;
                    },
                    set: function(newValue) {
                        console.log('[VoxelFSE Frontend] Intercepted Voxel.Maps replacement');
                        // MERGE: Copy all properties from new value to our object
                        // But preserve our safe await
                        if (newValue && typeof newValue === 'object') {
                            Object.keys(newValue).forEach(function(key) {
                                if (key !== 'await' && key !== '_fsePatched') {
                                    _voxelMapsValue[key] = newValue[key];
                                }
                            });
                        }
                        // Re-apply our protected await
                        if (window._voxelFseSafeAwait) {
                            Object.defineProperty(_voxelMapsValue, 'await', {
                                configurable: true,
                                enumerable: true,
                                get: function() { return window._voxelFseSafeAwait; },
                                set: function() {
                                    console.log('[VoxelFSE Frontend] Blocked attempt to overwrite await');
                                }
                            });
                        }
                        console.log('[VoxelFSE Frontend] Merged Voxel.Maps, preserved safe await');
                    }
                });

                // CRITICAL: Provide a SAFE Maps.await implementation IMMEDIATELY
                // This prevents commons.js from corrupting script src when it replaces Voxel.Maps
                //
                // The original Voxel Maps.await does: scriptElement.src = scriptElement.dataset.src
                // If our PHP filter already set src and removed data-src, dataset.src is undefined
                // which corrupts src to the string "undefined"
                //
                // Our safe version checks if src already exists and is valid before touching it

                // Helper to check if ALL maps requirements are met
                // This does a REAL test by creating a temporary map
                var _mapsReallyReady = false;
                var _mapsTestInProgress = false;

                function checkAllMapsReady() {
                    // If we've already confirmed it works, return true
                    if (_mapsReallyReady) {
                        return true;
                    }

                    try {
                        // 1. Check Google Maps API functions exist
                        var googleReady = typeof google !== 'undefined' &&
                            google.maps &&
                            typeof google.maps.Map === 'function' &&
                            typeof google.maps.LatLng === 'function' &&
                            typeof google.maps.OverlayView === 'function';

                        // 2. Check Voxel.Maps wrapper exists
                        var voxelReady = window.Voxel &&
                            window.Voxel.Maps &&
                            typeof window.Voxel.Maps.Map === 'function';

                        if (!googleReady || !voxelReady) {
                            return false;
                        }

                        // 3. CRITICAL: Try to actually create a test map to verify internals are ready
                        // This catches the "Cannot read properties of undefined (reading 'ip')" errors
                        if (!_mapsTestInProgress) {
                            _mapsTestInProgress = true;
                            try {
                                var testDiv = document.createElement('div');
                                testDiv.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;visibility:hidden;';
                                document.body.appendChild(testDiv);

                                // This will throw if Google Maps internals aren't ready
                                var testMap = new google.maps.Map(testDiv, {
                                    zoom: 1,
                                    center: { lat: 0, lng: 0 },
                                    disableDefaultUI: true
                                });

                                // Success! Clean up
                                setTimeout(function() {
                                    if (testDiv.parentNode) {
                                        testDiv.parentNode.removeChild(testDiv);
                                    }
                                }, 100);

                                _mapsReallyReady = true;
                                _mapsTestInProgress = false;
                                console.log('[VoxelFSE Frontend] checkAllMapsReady: Test map created successfully');
                                return true;
                            } catch (testError) {
                                _mapsTestInProgress = false;
                                console.log('[VoxelFSE Frontend] checkAllMapsReady: Test map failed -', testError.message);
                                return false;
                            }
                        }

                        return false;
                    } catch (e) {
                        _mapsTestInProgress = false;
                        return false;
                    }
                }

                // Define the safe await function
                var safeAwaitFunction = function(callback) {
                    console.log('[VoxelFSE Frontend] Safe Maps.await called, Loaded flag:', window.Voxel.Maps.Loaded);

                    // CRITICAL FIX: Don't trust Loaded flag alone!
                    // Voxel or other code may set Loaded=true before Google Maps is actually ready.
                    // ALWAYS verify with checkAllMapsReady() before executing callback.

                    // If ready NOW (both Loaded flag AND actual readiness check), execute immediately
                    if (window.Voxel.Maps.Loaded && checkAllMapsReady()) {
                        console.log('[VoxelFSE Frontend] Safe Maps.await: Loaded=true AND checkAllMapsReady=true, executing callback');
                        callback();
                        return;
                    }

                    // If NOT ready but flag is true, we need to wait
                    if (window.Voxel.Maps.Loaded && !checkAllMapsReady()) {
                        console.log('[VoxelFSE Frontend] Safe Maps.await: Loaded=true but checkAllMapsReady=false, will poll');
                    }

                    // If Loaded is false, check if maps are actually ready anyway
                    if (!window.Voxel.Maps.Loaded && checkAllMapsReady()) {
                        console.log('[VoxelFSE Frontend] Safe Maps.await: Loaded=false but checkAllMapsReady=true, executing callback');
                        window.Voxel.Maps.Loaded = true;
                        callback();
                        return;
                    }

                    // Not ready - set up listener and polling
                    var callbackFired = false;

                    // Wait for maps:loaded event
                    document.addEventListener("maps:loaded", function() {
                        // Double-check readiness even on event
                        if (!callbackFired && checkAllMapsReady()) {
                            callbackFired = true;
                            console.log('[VoxelFSE Frontend] Safe Maps.await: maps:loaded event + checkAllMapsReady=true');
                            callback();
                        }
                    }, { once: true });

                    // POLL for maps readiness - this is the most reliable method
                    var pollCount = 0;
                    var pollInterval = setInterval(function() {
                        pollCount++;

                        if (checkAllMapsReady()) {
                            clearInterval(pollInterval);
                            if (!callbackFired) {
                                callbackFired = true;
                                console.log('[VoxelFSE Frontend] Safe Maps.await: Maps ready via polling (poll #' + pollCount + ')');
                                if (!window.Voxel.Maps.Loaded) {
                                    window.Voxel.Maps.Loaded = true;
                                    // Dispatch the event for other listeners
                                    document.dispatchEvent(new CustomEvent('maps:loaded'));
                                }
                                callback();
                            }
                        }

                        if (pollCount >= 200) { // 10 seconds
                            clearInterval(pollInterval);
                            console.error('[VoxelFSE Frontend] Safe Maps.await: Timeout waiting for maps');
                        }
                    }, 50);

                    // Trigger lazy loading of maps script if not yet loaded
                    // BUT: Only if the script has data-src AND no valid src
                    var mapScriptIds = ['vx:google-maps.js-js', 'google-maps-js', 'vx:mapbox.js-js', 'mapbox-gl-js'];
                    mapScriptIds.forEach(function(id) {
                        var scriptElement = document.getElementById(id);
                        if (scriptElement) {
                            var currentSrc = scriptElement.getAttribute('src');
                            var dataSrc = scriptElement.dataset.src;

                            // Only trigger soft-load if:
                            // 1. src is missing OR invalid (empty, "undefined")
                            // 2. AND data-src has a valid URL
                            if ((!currentSrc || currentSrc === '' || currentSrc === 'undefined') && dataSrc && dataSrc !== 'null' && dataSrc !== 'undefined') {
                                console.log('[VoxelFSE Frontend] Safe Maps.await triggering soft-load for: ' + id);
                                scriptElement.src = dataSrc;
                            }
                        }
                    });
                };

                // Store global reference to safe await that can't be overwritten
                window._voxelFseSafeAwait = safeAwaitFunction;

                // CRITICAL: Use Object.defineProperty to make await non-writable
                // This prevents commons.js from replacing our safe implementation
                Object.defineProperty(window.Voxel.Maps, 'await', {
                    configurable: true, // Allow redefinition by our restore code
                    enumerable: true,
                    get: function() {
                        return window._voxelFseSafeAwait;
                    },
                    set: function(newValue) {
                        // INTERCEPT: commons.js tries to overwrite await
                        // Store the original for reference but return our safe version
                        console.log('[VoxelFSE Frontend] Intercepted attempt to overwrite Maps.await, keeping safe version');
                        window._voxelOriginalAwait = newValue;
                        // Don't actually replace - keep returning our safe version
                    }
                });

                window.Voxel.Maps._fsePatched = true;
                console.log('[VoxelFSE Frontend] Safe Maps.await provided (protected with defineProperty)');

                // Helper to check if Google Maps API is fully initialized
                // The callback fires but Google's internal objects may not be ready
                function isGoogleMapsApiReady() {
                    try {
                        // Check that google.maps exists and has the core classes
                        return typeof google !== 'undefined' &&
                            google.maps &&
                            typeof google.maps.Map === 'function' &&
                            typeof google.maps.LatLng === 'function' &&
                            typeof google.maps.LatLngBounds === 'function' &&
                            typeof google.maps.OverlayView === 'function';
                    } catch (e) {
                        return false;
                    }
                }

                // Helper to check if vx:google-maps.js has loaded (defines Map class)
                function isVoxelMapsReady() {
                    return window.Voxel &&
                        window.Voxel.Maps &&
                        typeof window.Voxel.Maps.Map === 'function';
                }

                // Helper to check if BOTH Google Maps API AND Voxel wrapper are ready
                function isAllMapsReady() {
                    return isGoogleMapsApiReady() && isVoxelMapsReady();
                }

                // Helper to dispatch maps:loaded event
                function dispatchMapsLoaded() {
                    if (window._voxel_maps_loaded_dispatched) return;
                    window._voxel_maps_loaded_dispatched = true;
                    console.log('[VoxelFSE Frontend] Dispatching maps:loaded event');

                    if (window.Voxel && window.Voxel.Maps) {
                        window.Voxel.Maps.Loaded = true;
                    }
                    if (typeof document !== 'undefined' && document.dispatchEvent) {
                        try {
                            document.dispatchEvent(new CustomEvent('maps:loaded'));
                        } catch (e) {
                            console.error('[VoxelFSE Frontend] Error dispatching maps:loaded:', e);
                        }
                    }
                }

                // Store callback function reference
                var gmapsCallbackStub = function () {
                    console.log('[VoxelFSE Frontend] GoogleMaps callback fired!');
                    window._voxel_gmaps_loaded = true;
                    window._voxel_gmaps_callback_fired = true;

                    // CRITICAL: Google Maps API v3.62+ has async internals that may not be ready
                    // even when the callback fires. We need to wait for internal initialization
                    // to complete, then verify with a test Map creation.
                    //
                    // The errors like "Cannot read properties of undefined (reading 'ip')"
                    // occur when google.maps.Map is called before Google's internal objects
                    // are fully initialized.

                    function testGoogleMapsReady() {
                        try {
                            // Try to create a temporary map to test if Google Maps is really ready
                            var testDiv = document.createElement('div');
                            testDiv.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;';
                            document.body.appendChild(testDiv);

                            var testMap = new google.maps.Map(testDiv, {
                                zoom: 1,
                                center: { lat: 0, lng: 0 },
                                disableDefaultUI: true
                            });

                            // Clean up
                            setTimeout(function() {
                                if (testDiv.parentNode) {
                                    testDiv.parentNode.removeChild(testDiv);
                                }
                            }, 100);

                            console.log('[VoxelFSE Frontend] Google Maps API test: SUCCESS');
                            return true;
                        } catch (e) {
                            console.log('[VoxelFSE Frontend] Google Maps API test: FAILED -', e.message);
                            return false;
                        }
                    }

                    // Log Google Maps API readiness for debugging
                    console.log('[VoxelFSE Frontend] Google Maps API classes ready:', isGoogleMapsApiReady());
                    console.log('[VoxelFSE Frontend] Voxel.Maps ready:', isVoxelMapsReady());

                    // Wait for both Voxel.Maps AND a successful test Map creation
                    var waitCount = 0;
                    var waitInterval = setInterval(function () {
                        waitCount++;

                        var voxelReady = isVoxelMapsReady();
                        var googleReady = isGoogleMapsApiReady();

                        // Log status periodically
                        if (waitCount % 10 === 1 || waitCount === 1) {
                            console.log('[VoxelFSE Frontend] Wait #' + waitCount + ' - Google API:', googleReady, 'Voxel:', voxelReady);
                        }

                        // Only test Google Maps when both class checks pass
                        if (voxelReady && googleReady) {
                            if (testGoogleMapsReady()) {
                                console.log('[VoxelFSE Frontend] All maps now ready (wait #' + waitCount + ')');
                                clearInterval(waitInterval);
                                dispatchMapsLoaded();
                                return;
                            }
                        }

                        if (waitCount >= 200) { // Stop after 10 seconds
                            clearInterval(waitInterval);
                            console.error('[VoxelFSE Frontend] Timeout waiting for maps');
                            // Try to dispatch anyway as fallback
                            if (voxelReady) {
                                console.warn('[VoxelFSE Frontend] Dispatching anyway (Voxel ready, Google may be partial)');
                                dispatchMapsLoaded();
                            }
                        }
                    }, 50);
                };

                // Assign immediately - MUST exist before Google Maps loads
                window.Voxel.Maps.GoogleMaps = gmapsCallbackStub;
                console.log('[VoxelFSE Frontend] GoogleMaps callback stub assigned');

                // Store reference to our safe await for restoration (using global)
                var safeAwait = window._voxelFseSafeAwait;

                // CRITICAL: Save script src URLs early so we can restore them if corrupted
                // This runs BEFORE any other script can corrupt them
                window._voxel_fse_saved_srcs = {};
                var mapScriptIds = ['vx:google-maps.js-js', 'google-maps-js', 'vx:mapbox.js-js', 'mapbox-gl-js'];

                function saveScriptSrc(id) {
                    var script = document.getElementById(id);
                    if (script) {
                        var src = script.getAttribute('src');
                        if (src && src !== 'undefined' && src !== '' && src !== 'null') {
                            window._voxel_fse_saved_srcs[id] = src;
                            console.log('[VoxelFSE Frontend] Saved src for ' + id + ': ' + src.substring(0, 60) + '...');
                        }
                    }
                }

                // Track which scripts have been "rescued" by replacing with new element
                window._voxel_fse_rescued_scripts = {};

                // CRITICAL: MutationObserver to catch src corruption in REAL-TIME
                // This is the key fix - we catch the corruption IMMEDIATELY when it happens,
                // BEFORE the browser tries to load from the corrupted src.
                // Deferred scripts don't load until DOM is fully parsed, but the src attribute
                // can be changed at any time. We catch the change and revert it instantly.
                var srcObserver = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                            var script = mutation.target;
                            var id = script.id;
                            if (mapScriptIds.indexOf(id) !== -1) {
                                var newSrc = script.getAttribute('src');
                                var savedSrc = window._voxel_fse_saved_srcs[id];

                                // Check if src was corrupted
                                if ((newSrc === 'undefined' || newSrc === '' || newSrc === null) && savedSrc) {
                                    console.log('[VoxelFSE Frontend] MutationObserver: Blocked src corruption for ' + id + ', reverting to saved src');

                                    // CRITICAL: If the browser already tried to load from corrupted src,
                                    // just setting src back won't help - we need to create a new script element.
                                    // Check if script already failed by seeing if it's been "in the DOM" for a while
                                    if (!window._voxel_fse_rescued_scripts[id]) {
                                        window._voxel_fse_rescued_scripts[id] = true;

                                        // Create a fresh script element with the correct src
                                        var newScript = document.createElement('script');
                                        newScript.id = id + '-rescue';
                                        newScript.src = savedSrc;
                                        newScript.defer = script.defer;
                                        newScript.async = script.async;

                                        console.log('[VoxelFSE Frontend] MutationObserver: Creating rescue script for ' + id);

                                        // Insert after the original (which may have failed)
                                        script.parentNode.insertBefore(newScript, script.nextSibling);
                                    }

                                    // Still set the attribute back (in case browser hasn't tried yet)
                                    script.setAttribute('src', savedSrc);
                                }
                            }
                        }
                    });
                });

                // Also observe for new script elements being added to catch them early
                var documentObserver = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        mutation.addedNodes.forEach(function(node) {
                            if (node.nodeName === 'SCRIPT') {
                                var id = node.id;
                                if (mapScriptIds.indexOf(id) !== -1) {
                                    // Save the src immediately when script is added
                                    var src = node.getAttribute('src');
                                    if (src && src !== 'undefined' && src !== '' && src !== 'null') {
                                        if (!window._voxel_fse_saved_srcs[id]) {
                                            window._voxel_fse_saved_srcs[id] = src;
                                            console.log('[VoxelFSE Frontend] MutationObserver: Saved src for new script ' + id);
                                        }
                                    }

                                    // Start observing this script for src changes
                                    srcObserver.observe(node, { attributes: true, attributeFilter: ['src'] });
                                    console.log('[VoxelFSE Frontend] MutationObserver: Now watching ' + id + ' for src changes');
                                }
                            }
                        });
                    });
                });

                // Start observing the document for new scripts
                documentObserver.observe(document.documentElement, { childList: true, subtree: true });
                console.log('[VoxelFSE Frontend] MutationObserver started - watching for script additions');

                // Try to save and observe existing scripts immediately
                // (scripts may already be in DOM from server-side rendering)
                mapScriptIds.forEach(function(id) {
                    saveScriptSrc(id);
                    var script = document.getElementById(id);
                    if (script) {
                        srcObserver.observe(script, { attributes: true, attributeFilter: ['src'] });
                        console.log('[VoxelFSE Frontend] MutationObserver: Watching existing script ' + id);
                    }
                });

                // Monitor and restore both callback AND safe await if commons.js overwrites Voxel.Maps
                var checkCount = 0;
                var checkInterval = setInterval(function () {
                    checkCount++;
                    if (window.Voxel && window.Voxel.Maps) {
                        // Restore GoogleMaps callback if overwritten
                        if (typeof window.Voxel.Maps.GoogleMaps !== 'function') {
                            window.Voxel.Maps.GoogleMaps = gmapsCallbackStub;
                            console.log('[VoxelFSE Frontend] Restored GoogleMaps callback (was overwritten)');
                            // If Google Maps already loaded, trigger callback now
                            if (window._voxel_gmaps_loaded && typeof google !== 'undefined' && google.maps && !window._voxel_maps_loaded_dispatched) {
                                gmapsCallbackStub();
                            }
                        }

                        // CRITICAL: Restore safe Maps.await if it was overwritten
                        // commons.js replaces the entire Voxel.Maps object, losing our safe await
                        if (!window.Voxel.Maps._fsePatched) {
                            window.Voxel.Maps.await = safeAwait;
                            window.Voxel.Maps._fsePatched = true;
                            console.log('[VoxelFSE Frontend] Restored safe Maps.await (was overwritten by commons.js)');
                        }
                    }

                    if (checkCount >= 100) { // Stop after 5 seconds
                        clearInterval(checkInterval);
                    }
                }, 50);
            })();
        </script>
        <?php
    }

    /**
     * Bypass Voxel's soft-loading for maps scripts on frontend
     *
     * Voxel replaces src= with data-src= for maps scripts to defer loading.
     * This causes issues with FSE blocks because the maps:loaded event may never fire.
     *
     * CRITICAL: We ALWAYS add the filter to bypass soft-loading, not just when our blocks
     * are detected. This is because:
     * 1. Voxel's own widgets (post-feed with map, search-form) may load maps
     * 2. The Google Maps callback stub expects vx:google-maps.js to load
     * 3. If vx:google-maps.js has data-src, it never executes, causing timeout
     *
     * Evidence: themes/voxel/app/controllers/assets-controller.php:49-54 and :367-372
     *
     * @since 1.0.0
     */
    public static function bypass_maps_soft_loading_on_frontend()
    {
        // Only run on frontend (not in admin)
        if (is_admin()) {
            return;
        }

        // Check if map block is used on the current page
        $has_map_block = true; // Force True for Debugging/Fix

        /*
        // Check current post/page content
        if (is_singular()) {
            global $post;
            if ($post && has_blocks($post->post_content)) {
                $has_map_block = has_block('voxel-fse/map', $post);
            }
        }

        // Check widgets (block widgets)
        if (!$has_map_block && function_exists('wp_get_sidebars_widgets')) {
            $sidebars = wp_get_sidebars_widgets();
             foreach ($sidebars as $sidebar => $widgets) {
                if (is_array($widgets)) {
                    foreach ($widgets as $widget) {
                        if (strpos($widget, 'block-') === 0) {
                            $widget_id = str_replace('block-', '', $widget);
                            $widget_content = get_post_field('post_content', $widget_id);
                            if ($widget_content && has_block('voxel-fse/map', $widget_content)) {
                                $has_map_block = true;
                                break 2;
                            }
                        }
                    }
                }
            }
        }

        // Also check FSE templates (for archive pages, single templates, etc.)
        // FSE templates are stored in wp_template and wp_template_part post types
        if (!$has_map_block) {
            // Get the current template hierarchy
            $template_slugs = [];

            // Check for block theme template
            if (function_exists('wp_is_block_theme') && wp_is_block_theme()) {
                // Get current template from global
                global $_wp_current_template_content;
                if (!empty($_wp_current_template_content)) {
                    foreach ($map_blocks as $block_name) {
                        if (strpos($_wp_current_template_content, '<!-- wp:' . $block_name) !== false) {
                            $has_map_block = true;
                            break;
                        }
                    }
                }
            }
        }
        */

        // If FSE blocks that need maps are present, enqueue Voxel's map scripts
        // This is the key fix: Voxel's enqueue_maps() is only called by Elementor widgets
        // We need to call it for FSE blocks too
        if ($has_map_block && function_exists('\Voxel\enqueue_maps')) {
            // CRITICAL: Explicitly enqueue vx:commons.js FIRST
            // It defines the Voxel.Maps namespace that vx:google-maps.js extends
            // Without it, vx:google-maps.js will fail silently
            wp_enqueue_script('vx:commons.js');

            // Now enqueue the map scripts
            \Voxel\enqueue_maps();

            // Debug: Log what we're doing
            error_log('[VoxelFSE] Enqueued maps scripts for FSE blocks');
        }



        // Filter approach to bypass soft-loading for Voxel's wrapper scripts
        // Priority PHP_INT_MAX - 1 runs AFTER Voxel's filter at priority 10
        //
        // IMPORTANT: We ONLY bypass soft-loading for the WRAPPER scripts (vx:google-maps.js, etc.)
        // We do NOT bypass for the EXTERNAL API scripts (google-maps, mapbox-gl, leaflet)
        //
        // WHY: Voxel's soft-loading order is:
        // 1. vx:google-maps.js loads (defines Voxel.Maps.GoogleMaps callback)
        // 2. At the end of vx:google-maps.js: t.src = t.dataset.src (triggers Google Maps API)
        // 3. Google Maps API loads and calls Voxel.Maps.GoogleMaps callback
        //
        // If we bypass BOTH, they load in parallel and the callback may not exist when called.
        add_filter('script_loader_tag', function ($tag, $handle, $src) {
            // Only bypass soft-loading for Voxel's WRAPPER scripts, NOT external APIs
            $wrapper_scripts = [
                // Google Maps wrapper (NOT 'google-maps' - that's the external API)
                'vx:google-maps.js',
                // Mapbox wrapper (NOT 'mapbox-gl' - that's the external API)
                'vx:mapbox.js',
                // OpenStreetMap wrapper (NOT 'leaflet' - that's the external API)
                'vx:openstreetmap.js',
            ];

            if (!in_array($handle, $wrapper_scripts, true)) {
                return $tag;
            }

            // Check if data-src exists (Voxel soft-loading applied)
            if (preg_match('/data-src=["\']([^"\']+)["\']/', $tag, $matches)) {
                $data_src_value = $matches[1];

                // Force load the WRAPPER script immediately
                // Check if src attribute already exists
                if (!preg_match('/ src=["\']/', $tag)) {
                    $tag = preg_replace('/<script\s+/', '<script src="' . esc_url($data_src_value) . '" ', $tag, 1);
                }

                // Keep data-src for the wrapper script - it doesn't have the "set src from data-src" code
                // Only google-maps.js (the wrapper) has that code at the end, but it looks for 'google-maps-js' ID
                // The wrapper script has ID 'vx:google-maps.js-js', not 'google-maps-js'

                error_log("[VoxelFSE] Bypassed soft-loading for wrapper: {$handle}");
                return "<!-- VoxelFSE: Immediate Load for {$handle} -->\n" . $tag;
            }

            return $tag;
        }, PHP_INT_MAX - 1, 3);

    }


    /**
     * Enqueue Voxel core scripts (commons.js and maps) in block editor
     *
     * CRITICAL for LocationField: Provides window.Voxel.Maps API and window.Voxel.alert()
     *
     * Evidence: Voxel loads these scripts for Elementor editor but NOT for Gutenberg editor
     * - themes/voxel/app/controllers/assets-controller.php:75 - Elementor hook only
     * - themes/voxel/app/controllers/assets-controller.php:189-195 - Backend scripts (no commons/maps)
     *
     * This method matches Voxel's Elementor editor asset loading to provide identical
     * functionality in Gutenberg block editor.
     *
     * @since 1.0.0
     */
    public static function enqueue_voxel_core_scripts()
    {
        // Check if we're in admin area (covers both post editor and FSE template editor)
        if (!is_admin()) {
            return;
        }

        // Additional check: Only run in block editor contexts
        // This includes both post editor and FSE template editor
        if (function_exists('get_current_screen')) {
            $screen = get_current_screen();
            // is_block_editor() returns true for post editor, but false for FSE template editor
            // So we also check for 'site-editor' which is the FSE template editor
            $is_block_editor_context = ($screen && $screen->is_block_editor()) ||
                    ($screen && $screen->id === 'site-editor');

            if (!$is_block_editor_context) {
                return;
            }
        }

        // NOTE: We DON'T deregister Vue/commons.js here because this runs on admin_enqueue_scripts
        // which affects the main admin page - Voxel's admin UI needs Vue for backend.js, dynamic-data.js
        // The deregister happens in dequeue_vue_commons_in_block_editor() via enqueue_block_editor_assets
        // which specifically targets the editor iframe where the Vue conflict occurs

        // Enqueue our React-compatible voxel-commons.js instead
        // Provides the same Voxel.* APIs without Vue dependencies
        $commons_url = get_stylesheet_directory_uri() . '/assets/dist/voxel-commons.js';
        wp_enqueue_script(
            'voxel-fse-commons',
            $commons_url,
            [], // No dependencies - standalone vanilla JS
            defined('VOXEL_FSE_VERSION') ? VOXEL_FSE_VERSION : '1.0.0',
            true // In footer
        );

        // Add script AFTER our commons to define GoogleMaps callback
        $post_commons_script = <<<'JAVASCRIPT'
(function() {
	if (typeof window.Voxel !== 'undefined' && typeof window.Voxel.Maps !== 'undefined') {
		window.Voxel.Maps.GoogleMaps = function() {
			window.Voxel.Maps.Loaded = true;
			document.dispatchEvent(new CustomEvent('maps:loaded'));
		};

		// Check if Google Maps already loaded and called the stub
		if (window._voxel_gmaps_callback_fired && !window.Voxel.Maps.Loaded) {
			if (typeof google !== 'undefined' && google.maps) {
				window.Voxel.Maps.Loaded = true;
				document.dispatchEvent(new CustomEvent('maps:loaded'));
			}
		}
	} else {
		console.error('[Voxel FSE] Cannot define GoogleMaps callback - Voxel.Maps not available');
	}
})();
JAVASCRIPT;
        wp_add_inline_script('voxel-fse-commons', $post_commons_script, 'after');

        // Enqueue map provider scripts based on Voxel settings
        if (function_exists('\Voxel\get')) {
            $map_provider = \Voxel\get('settings.maps.provider');

            if ($map_provider === 'mapbox') {
                if (wp_script_is('mapbox-gl', 'registered')) {
                    wp_enqueue_script('mapbox-gl');
                }
                if (wp_style_is('mapbox-gl', 'registered')) {
                    wp_enqueue_style('mapbox-gl');
                }
            } else {
                // Google Maps provider (default)
                if (wp_script_is('vx:google-maps.js', 'registered')) {
                    wp_enqueue_script('vx:google-maps.js');
                }
                if (wp_script_is('google-maps', 'registered')) {
                    wp_enqueue_script('google-maps');
                }
            }
        }
    }

    /**
     * Dequeue Vue and commons.js specifically in block editor
     *
     * DISABLED: Cannot deregister Vue/commons.js because Voxel's admin UI (backend.js,
     * dynamic-data.js, vue-draggable.js) runs on the same admin page and needs Vue.
     * WordPress doesn't have separate script queues for the main admin page vs editor iframe.
     *
     * Instead, we use the voxel-fse-compat.js shim to intercept and suppress errors
     * from render_static_popups() when it tries to access .elementor-element.
     *
     * @since 1.0.0
     */
    public static function dequeue_vue_commons_in_block_editor()
    {
        // DISABLED - breaks Voxel admin UI
        // The shim approach (voxel-fse-compat.js) handles the error instead
        return;
    }

    /**
     * Dequeue Vue and commons.js in block editor context (backup for print hooks)
     *
     * DISABLED: Same reason as dequeue_vue_commons_in_block_editor - breaks Voxel admin.
     *
     * @since 1.0.0
     */
    public static function dequeue_vue_commons_in_editor()
    {
        // DISABLED - breaks Voxel admin UI
        return;
    }

    /**
     * Set CSS variable for font-family BEFORE commons.css loads
     *
     * This ensures --e-global-typography-text-font-family is set to WordPress system font
     * before commons.css applies font-family: var(--e-global-typography-text-font-family), sans-serif;
     *
     * Priority 1 ensures this runs before Voxel's enqueue_frontend_scripts (priority 5)
     * We use both wp_add_inline_style (for when commons.css is enqueued) and wp_head (as early fallback)
     */
    public static function set_font_family_css_variable()
    {
        // Only run on frontend (not in admin/editor)
        if (is_admin()) {
            return;
        }

        // Ensure commons.css is registered (Voxel will register it, but we need it registered now)
        self::ensure_voxel_styles_registered();

        $css = ':root, body { --e-global-typography-text-font-family: var(--wp--preset--font-family--system, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif); }';

        // Method 1: Add inline CSS to vx:commons.css (WordPress will add it when the style is enqueued)
        if (wp_style_is('vx:commons.css', 'registered')) {
            wp_add_inline_style('vx:commons.css', $css);
        }

        // Method 2: Also output directly in wp_head at very early priority as fallback
        // This ensures the CSS variable is set even if wp_add_inline_style doesn't work
        add_action('wp_head', function () use ($css) {
            echo '<style type="text/css" id="voxel-fse-font-family-variable">' . wp_strip_all_tags($css) . '</style>' . "\n";
        }, 0); // Priority 0 to run as early as possible
    }

    /**
     * Add popup block CSS variables to vx:commons.css via inline styles
     *
     * This is called when enqueuing vx:commons.css in the block editor.
     * Provides default CSS variables for the editor iframe.
     */
    private static function add_popup_css_variables_to_commons()
    {
        // Only in editor context
        if (!is_admin() || !function_exists('get_current_screen')) {
            return;
        }

        $screen = get_current_screen();
        if (!$screen || $screen->base !== 'post') {
            return;
        }

        // Default CSS variables for editor
        $css = ':root, .editor-styles-wrapper {' . "\n";
        $css .= '  --e-global-color-accent: #E8315F;' . "\n";
        $css .= '  --e-global-color-primary: #313135;' . "\n";
        $css .= '  --e-global-color-text: #313135;' . "\n";
        $css .= '  --e-global-typography-text-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;' . "\n";
        $css .= '}' . "\n";

        // Add as inline style to vx:commons.css
        wp_add_inline_style('vx:commons.css', $css);
    }

    /**
     * Set popup block CSS variables on main document body (frontend only)
     *
     * This ensures CSS variables are available for parent theme's commons.css
     * which applies to the body element (outside the iframe).
     *
     * Priority 1 ensures this runs before Voxel's enqueue_frontend_scripts (priority 5)
     */
    public static function set_popup_css_variables()
    {
        // Only run on frontend (not in admin/editor)
        if (is_admin()) {
            return;
        }

        // Find popup block and get its attributes
        $popup_attributes = self::get_popup_block_attributes();

        if (!$popup_attributes) {
            return;
        }

        // Get attribute values with defaults
        $elementor_accent = !empty($popup_attributes['elementorAccent']) ? esc_attr($popup_attributes['elementorAccent']) : '#E8315F';
        $elementor_primary = !empty($popup_attributes['elementorPrimary']) ? esc_attr($popup_attributes['elementorPrimary']) : '#313135';
        $elementor_text = !empty($popup_attributes['elementorText']) ? esc_attr($popup_attributes['elementorText']) : '#313135';
        $elementor_font_family = !empty($popup_attributes['elementorFontFamily'])
                ? wp_strip_all_tags($popup_attributes['elementorFontFamily'])
                : 'var(--wp--preset--font-family--system, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif)';

        // Generate CSS for main document body (outside iframe)
        // Only set --e-global-* variables (--ts-accent-* are already defined in commons.css via var(--e-global-color-accent))
        $css = 'body {' . "\n";
        $css .= '  --e-global-color-accent: ' . $elementor_accent . ';' . "\n";
        $css .= '  --e-global-color-primary: ' . $elementor_primary . ';' . "\n";
        $css .= '  --e-global-color-text: ' . $elementor_text . ';' . "\n";
        $css .= '  --e-global-typography-text-font-family: ' . $elementor_font_family . ';' . "\n";
        $css .= '}' . "\n";

        // Ensure commons.css is registered
        self::ensure_voxel_styles_registered();

        // Method 1: Add inline CSS to vx:commons.css
        if (wp_style_is('vx:commons.css', 'registered')) {
            wp_add_inline_style('vx:commons.css', $css);
        }

        // Method 2: Also output directly in wp_head at very early priority as fallback
        add_action('wp_head', function () use ($css) {
            echo '<style type="text/css" id="voxel-fse-popup-css-variables">' . wp_strip_all_tags($css) . '</style>' . "\n";
        }, 0); // Priority 0 to run as early as possible
    }

    /**
     * Get popup block attributes from current page
     *
     * Checks post content, widgets, and FSE templates for popup block
     * Returns the first popup block's attributes found
     */
    private static function get_popup_block_attributes()
    {
        $content_to_check = [];

        // Check current post/page content
        if (is_singular()) {
            global $post;
            if ($post && has_blocks($post->post_content)) {
                $content_to_check[] = $post->post_content;
            }
        }

        // Check widgets (block widgets)
        if (function_exists('wp_get_sidebars_widgets')) {
            $sidebars = wp_get_sidebars_widgets();
            foreach ($sidebars as $sidebar => $widgets) {
                if (is_array($widgets)) {
                    foreach ($widgets as $widget) {
                        if (strpos($widget, 'block-') === 0) {
                            $widget_id = str_replace('block-', '', $widget);
                            $widget_content = get_post_field('post_content', $widget_id);
                            if ($widget_content && has_blocks($widget_content)) {
                                $content_to_check[] = $widget_content;
                            }
                        }
                    }
                }
            }
        }

        // Parse blocks and find popup block
        foreach ($content_to_check as $content) {
            $blocks = parse_blocks($content);
            $popup_attributes = self::find_popup_block_in_blocks($blocks);
            if ($popup_attributes) {
                return $popup_attributes;
            }
        }

        return null;
    }

    /**
     * Recursively find popup block in block tree
     */
    private static function find_popup_block_in_blocks($blocks)
    {
        foreach ($blocks as $block) {
            if ($block['blockName'] === 'voxel-fse/popup-kit' && !empty($block['attrs'])) {
                return $block['attrs'];
            }

            // Check inner blocks
            if (!empty($block['innerBlocks'])) {
                $found = self::find_popup_block_in_blocks($block['innerBlocks']);
                if ($found) {
                    return $found;
                }
            }
        }

        return null;
    }

    /**
     * Enqueue vendor CSS (pikaday, nouislider) on frontend when popup block is used
     *
     * These styles are needed for date pickers and range sliders in popup components
     */
    public static function enqueue_frontend_vendor_styles()
    {
        // Only run on frontend (not in admin/editor)
        if (is_admin()) {
            return;
        }

        // Check if popup block is used on the current page
        // Check in post content, widgets, and FSE templates
        $has_popup_block = false;

        // Check current post/page content
        if (is_singular()) {
            global $post;
            if ($post && has_blocks($post->post_content)) {
                $has_popup_block = has_block('voxel-fse/popup-kit', $post);
            }
        }

        // Check widgets (block widgets)
        if (!$has_popup_block && function_exists('wp_get_sidebars_widgets')) {
            $sidebars = wp_get_sidebars_widgets();
            foreach ($sidebars as $sidebar => $widgets) {
                if (is_array($widgets)) {
                    foreach ($widgets as $widget) {
                        if (strpos($widget, 'block-') === 0) {
                            $widget_id = str_replace('block-', '', $widget);
                            $widget_content = get_post_field('post_content', $widget_id);
                            if ($widget_content && has_block('voxel-fse/popup-kit', $widget_content)) {
                                $has_popup_block = true;
                                break 2;
                            }
                        }
                    }
                }
            }
        }

        // If popup block is used, enqueue vendor CSS and product-form.css
        if ($has_popup_block) {
            // Ensure styles are registered
            self::ensure_voxel_styles_registered();

            // Enqueue pikaday CSS
            if (wp_style_is('pikaday', 'registered')) {
                wp_enqueue_style('pikaday');
            }

            // Enqueue nouislider CSS
            if (wp_style_is('nouislider', 'registered')) {
                wp_enqueue_style('nouislider');
            }

            // Enqueue product-form.css (needed for product form fields in popup)
            if (wp_style_is('vx:product-form.css', 'registered')) {
                wp_enqueue_style('vx:product-form.css');
            }
        }
    }

    /**
     * Enqueue bar-chart.css on frontend when sales-chart or visit-chart blocks are used
     *
     * Evidence:
     * - Voxel widget: themes/voxel/app/widgets/visits-chart-widget.php uses get_style_depends() -> ['vx:bar-chart.css']
     * - Voxel widget: themes/voxel/app/modules/stripe-connect/widgets/sales-chart-widget.php uses get_style_depends() -> ['vx:bar-chart.css']
     */
    public static function enqueue_frontend_chart_styles()
    {
        // Only run on frontend (not in admin/editor)
        if (is_admin()) {
            return;
        }

        // Check if sales-chart or visit-chart blocks are used on the current page
        $has_chart_block = false;

        // Check current post/page content
        if (is_singular()) {
            global $post;
            if ($post && has_blocks($post->post_content)) {
                $has_chart_block = has_block('voxel-fse/sales-chart', $post) || has_block('voxel-fse/visit-chart', $post);
            }
        }

        // Check widgets (block widgets)
        if (!$has_chart_block && function_exists('wp_get_sidebars_widgets')) {
            $sidebars = wp_get_sidebars_widgets();
            foreach ($sidebars as $sidebar => $widgets) {
                if (is_array($widgets)) {
                    foreach ($widgets as $widget) {
                        if (strpos($widget, 'block-') === 0) {
                            $widget_id = str_replace('block-', '', $widget);
                            $widget_content = get_post_field('post_content', $widget_id);
                            if ($widget_content && (has_block('voxel-fse/sales-chart', $widget_content) || has_block('voxel-fse/visit-chart', $widget_content))) {
                                $has_chart_block = true;
                                break 2;
                            }
                        }
                    }
                }
            }
        }

        // If chart block is used, enqueue bar-chart.css from Voxel parent theme
        if ($has_chart_block) {
            $dist = trailingslashit(get_template_directory_uri()) . 'assets/dist/';
            $version = function_exists('\Voxel\get_assets_version') ? \Voxel\get_assets_version() : '1.7.1.3';

            // Register if not already registered
            if (!wp_style_is('vx:bar-chart.css', 'registered')) {
                wp_register_style(
                        'vx:bar-chart.css',
                        $dist . (is_rtl() ? 'bar-chart-rtl.css' : 'bar-chart.css'),
                        [],
                        $version
                );
            }

            // Enqueue bar-chart.css
            wp_enqueue_style('vx:bar-chart.css');
        }
    }

    /**
     * Enqueue map.css on frontend when map block is used
     */
    public static function enqueue_frontend_map_styles()
    {
        // Only run on frontend (not in admin/editor)
        if (is_admin()) {
            return;
        }

        // Check if map block is used on the current page
        $has_map_block = true; // Force True for Debugging/Fix

        /*
        // Check current post/page content
        if (is_singular()) {
            global $post;
            if ($post && has_blocks($post->post_content)) {
                $has_map_block = has_block('voxel-fse/map', $post);
            }
        }

        // Check widgets (block widgets)
        if (!$has_map_block && function_exists('wp_get_sidebars_widgets')) {
            $sidebars = wp_get_sidebars_widgets();
            foreach ($sidebars as $sidebar => $widgets) {
                if (is_array($widgets)) {
                    foreach ($widgets as $widget) {
                        if (strpos($widget, 'block-') === 0) {
                            $widget_id = str_replace('block-', '', $widget);
                            $widget_content = get_post_field('post_content', $widget_id);
                            if ($widget_content && has_block('voxel-fse/map', $widget_content)) {
                                $has_map_block = true;
                                break 2;
                            }
                        }
                    }
                }
            }
        }

        // Check FSE templates
        if (!$has_map_block) {
            $has_map_block = self::check_fse_templates_for_block('voxel-fse/map');
        }
        */

        // If map block is used, enqueue map.css from Voxel parent theme
        if ($has_map_block) {
            self::ensure_voxel_styles_registered();

            if (wp_style_is('vx:commons.css', 'registered')) {
                wp_enqueue_style('vx:commons.css');
            }

            if (wp_style_is('vx:map.css', 'registered')) {
                wp_enqueue_style('vx:map.css');
            }
        }
    }

    /**
     * Enqueue work-hours.css on frontend when work-hours block is used
     *
     * Evidence:
     * - Voxel widget: themes/voxel/app/widgets/work-hours.php uses get_style_depends() -> ['vx:work-hours.css']
     */
    public static function enqueue_frontend_work_hours_styles()
    {
        // Only run on frontend (not in admin/editor)
        if (is_admin()) {
            return;
        }

        // Check if work-hours block is used on the current page
        $has_work_hours_block = false;

        // Check current post/page content
        if (is_singular()) {
            global $post;
            if ($post && has_blocks($post->post_content)) {
                $has_work_hours_block = has_block('voxel-fse/work-hours', $post);
            }
        }

        // Check widgets (block widgets)
        if (!$has_work_hours_block && function_exists('wp_get_sidebars_widgets')) {
            $sidebars = wp_get_sidebars_widgets();
            foreach ($sidebars as $sidebar => $widgets) {
                if (is_array($widgets)) {
                    foreach ($widgets as $widget) {
                        if (strpos($widget, 'block-') === 0) {
                            $widget_id = str_replace('block-', '', $widget);
                            $widget_content = get_post_field('post_content', $widget_id);
                            if ($widget_content && has_block('voxel-fse/work-hours', $widget_content)) {
                                $has_work_hours_block = true;
                                break 2;
                            }
                        }
                    }
                }
            }
        }

        // Check FSE templates (for blocks used in templates/template parts)
        if (!$has_work_hours_block) {
            $has_work_hours_block = self::check_fse_templates_for_block('voxel-fse/work-hours');
        }

        // If work-hours block is used, enqueue work-hours.css from Voxel parent theme
        if ($has_work_hours_block) {
            // Ensure styles are registered
            self::ensure_voxel_styles_registered();

            // Enqueue commons.css (dependency)
            if (wp_style_is('vx:commons.css', 'registered')) {
                wp_enqueue_style('vx:commons.css');
            }

            // Enqueue work-hours.css
            if (wp_style_is('vx:work-hours.css', 'registered')) {
                wp_enqueue_style('vx:work-hours.css');
            }
        }
    }



    /**
     * Check if a block is used in FSE templates or template parts
     *
     * @param string $block_name The full block name (e.g., 'voxel-fse/work-hours')
     * @return bool
     */
    private static function check_fse_templates_for_block($block_name)
    {
        // Check if we're using a block theme
        if (!function_exists('wp_is_block_theme') || !wp_is_block_theme()) {
            return false;
        }

        // Get current template
        $template_slug = get_page_template_slug();
        if (!$template_slug) {
            // Get default template based on context
            if (is_singular()) {
                $template_slug = 'single';
            } elseif (is_archive()) {
                $template_slug = 'archive';
            } elseif (is_home()) {
                $template_slug = 'home';
            } else {
                $template_slug = 'index';
            }
        }

        // Check template content
        $template = get_block_template(get_stylesheet() . '//' . $template_slug);
        if ($template && !empty($template->content) && has_block($block_name, $template->content)) {
            return true;
        }

        // Check template parts used in the template
        if ($template && !empty($template->content)) {
            $blocks = parse_blocks($template->content);
            foreach ($blocks as $block) {
                if ($block['blockName'] === 'core/template-part' && !empty($block['attrs']['slug'])) {
                    $part = get_block_template(get_stylesheet() . '//' . $block['attrs']['slug'], 'wp_template_part');
                    if ($part && !empty($part->content) && has_block($block_name, $part->content)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Check if any of the given blocks exist in FSE templates
     *
     * @param array $block_names Array of block names to check
     * @return bool True if any of the blocks are found
     */
    private static function check_fse_templates_for_blocks($block_names)
    {
        foreach ($block_names as $block_name) {
            if (self::check_fse_templates_for_block($block_name)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Ensure React and ReactDOM scripts are available on the frontend
     *
     * WordPress registers 'react' and 'react-dom' scripts but doesn't enqueue them
     * on the frontend by default. Plan C+ blocks need these scripts for hydration.
     *
     * This function detects if any React hydration blocks are present and ensures
     * the React scripts are enqueued before the block's frontend.js runs.
     */
    /**
     * Inject Voxel FSE compatibility shim directly in <head>
     *
     * Patches Voxel's commons.js to work with FSE blocks instead of Elementor widgets.
     * This prevents "Cannot read properties of null (reading 'dataset')" errors
     * when Voxel popup components try to find Elementor parent elements.
     *
     * CRITICAL: This must inject BEFORE Voxel's commons.js loads (wp_head priority 1)
     * Evidence: themes/voxel/assets/dist/commons.js lines 1486-1487
     * Voxel's base mixin expects .elementor-element and .elementor parents
     */
    public static function inject_voxel_fse_compat()
    {
        // Only run on frontend (not in admin/editor)
        if (is_admin()) {
            return;
        }

        // Read the compatibility script
        $compat_file = 'voxel-fse-compat.js';
        $compat_path = get_stylesheet_directory() . '/assets/js/' . $compat_file;

        if (file_exists($compat_path)) {
            $compat_script = file_get_contents($compat_path);
            ?>
            <script type="text/javascript">
                <?php echo $compat_script; ?>
            </script>
            <?php
        }
    }

    /**
     * Ensure React scripts are available on frontend for Plan C+ blocks
     *
     * WordPress registers react/react-dom but doesn't enqueue them on frontend by default.
     * This method checks if any React-based blocks are present and enqueues React if needed.
     */
    public static function ensure_react_on_frontend()

    {
        // Only run on frontend (not in admin/editor)
        if (is_admin()) {
            return;
        }

        // List of blocks that use React hydration on frontend
        // Must match $react_hydration_blocks in load_blocks()
        $react_blocks = [
                'voxel-fse/search-form',
                'voxel-fse/create-post',
                'voxel-fse/product-price',
                'voxel-fse/review-stats',
                'voxel-fse/print-template',
                'voxel-fse/timeline',
                'voxel-fse/countdown',
                'voxel-fse/sales-chart',
                'voxel-fse/visit-chart',
                'voxel-fse/stripe-account',
                'voxel-fse/membership-plans',
                'voxel-fse/listing-plans',
                'voxel-fse/navbar',
                'voxel-fse/advanced-list',
                'voxel-fse/userbar',
                'voxel-fse/quick-search',
                'voxel-fse/current-plan',
                'voxel-fse/cart-summary',
                'voxel-fse/post-feed',
                'voxel-fse/login',
                'voxel-fse/product-form',
                'voxel-fse/messages',
                'voxel-fse/orders',
                'voxel-fse/slider',
                'voxel-fse/gallery',
                'voxel-fse/map',
                'voxel-fse/ring-chart',
                'voxel-fse/work-hours',
                'voxel-fse/term-feed',
                'voxel-fse/image',
        ];

        $has_react_block = false;

        // Check current post/page content
        if (is_singular()) {
            global $post;
            if ($post && has_blocks($post->post_content)) {
                foreach ($react_blocks as $block_name) {
                    if (has_block($block_name, $post)) {
                        $has_react_block = true;
                        break;
                    }
                }
            }
        }

        // Check FSE templates if not found yet
        if (!$has_react_block) {
            foreach ($react_blocks as $block_name) {
                if (self::check_fse_templates_for_block($block_name)) {
                    $has_react_block = true;
                    break;
                }
            }
        }

        // Fallback: Check archive pages (stays-grid, etc.)
        // Archive pages may not be detected by is_singular() or FSE template check
        if (!$has_react_block && (is_archive() || is_home() || is_search())) {
            // For archives, check if ANY voxel-fse block exists as a safe fallback
            // This ensures React loads for search-form and other blocks on archive pages
            $has_react_block = true;
        }

        // If any React block is found, ensure React scripts are enqueued
        if ($has_react_block) {
            // WordPress 6.0+ has react and react-dom as registered scripts
            // They provide window.React and window.ReactDOM globals
            if (wp_script_is('react', 'registered')) {
                wp_enqueue_script('react');
            }
            if (wp_script_is('react-dom', 'registered')) {
                wp_enqueue_script('react-dom');
            }
        }
    }

    /**
     * Enqueue viewport subscriber (PeepSo-style pattern)
     *
     * Watches for Gutenberg viewport changes and dispatches a custom event
     * that blocks can listen to for forcing re-renders.
     */
    public static function enqueue_viewport_subscriber()
    {
        // Check if we're in admin area (covers both post editor and FSE template editor)
        if (!is_admin()) {
            return;
        }

        // Additional check: Only run in block editor contexts
        // This includes both post editor and FSE template editor
        if (function_exists('get_current_screen')) {
            $screen = get_current_screen();
            // is_block_editor() returns true for post editor, but false for FSE template editor
            // So we also check for 'site-editor' which is the FSE template editor
            $is_block_editor_context = ($screen && $screen->is_block_editor()) ||
                    ($screen && $screen->id === 'site-editor');

            if (!$is_block_editor_context) {
                return;
            }
        }

        $script = "
		(function() {
			if (typeof wp === 'undefined' || !wp.data || !wp.data.subscribe) {
				return;
			}

			let lastDevice = null;

			wp.data.subscribe(function() {
				const editPost = wp.data.select('core/edit-post');
				const editSite = wp.data.select('core/edit-site');
				
				let currentDevice = null;
				
				if (editPost && typeof editPost.getPreviewDeviceType === 'function') {
					currentDevice = editPost.getPreviewDeviceType();
				} else if (editSite && typeof editSite.getPreviewDeviceType === 'function') {
					currentDevice = editSite.getPreviewDeviceType();
				} else if (editPost && typeof editPost.__experimentalGetPreviewDeviceType === 'function') {
					currentDevice = editPost.__experimentalGetPreviewDeviceType();
				}

				if (currentDevice && currentDevice !== lastDevice) {
					lastDevice = currentDevice;
					window.dispatchEvent(new CustomEvent('voxel-fse:editorPreviewChanged', { 
						detail: { device: currentDevice } 
					}));
				}
			});
		})();
		";

        // Enqueue wp-blocks first to ensure wp.data is available
        wp_enqueue_script('wp-blocks');
        wp_add_inline_script('wp-blocks', $script);
    }

    /**
     * Disable REST API caching for block render requests
     *
     * This filter ensures that when ServerSideRender requests block content,
     * WordPress doesn't cache the response. This is critical for viewport-dependent
     * rendering where the same block should render differently based on viewport.
     *
     * @param WP_REST_Response $result Response object.
     * @param WP_REST_Server $server Server instance.
     * @param WP_REST_Request $request Request used to generate the response.
     * @return WP_REST_Response Modified response with no-cache headers.
     */
    public static function disable_block_render_cache($result, $server, $request)
    {
        // Only affect block render endpoint
        // Block render endpoint: /wp/v2/block-renderer/{block-name}
        $route = $request->get_route();

        if (strpos($route, '/wp/v2/block-renderer/') === 0) {
            // Add no-cache headers to force fresh render on every request
            $result->header('Cache-Control', 'no-cache, no-store, must-revalidate');
            $result->header('Pragma', 'no-cache');
            $result->header('Expires', '0');
        }

        return $result;
    }

    /**
     * Add import map for WordPress package imports in ES modules
     */
    public static function add_import_map()
    {
        // Add import map on both admin and frontend
        // Frontend needs it for blocks that use React (like create-post)
        // Skip only on non-block pages
        if (!is_admin() && !(defined('REST_REQUEST') && REST_REQUEST) && !has_block('voxel-fse/create-post')) {
            return;
        }

        // Create import map that maps @wordpress/* to data URLs containing global exports
        $imports = [
                '@wordpress/blocks' => 'data:text/javascript,export default window.wp.blocks;export const registerBlockType=window.wp.blocks.registerBlockType;',
                '@wordpress/block-editor' => 'data:text/javascript,export default window.wp.blockEditor;export const useBlockProps=window.wp.blockEditor.useBlockProps;export const InspectorControls=window.wp.blockEditor.InspectorControls;export const BlockControls=window.wp.blockEditor.BlockControls;export const RichText=window.wp.blockEditor.RichText;export const AlignmentToolbar=window.wp.blockEditor.AlignmentToolbar;export const BlockAlignmentToolbar=window.wp.blockEditor.BlockAlignmentToolbar;export const PanelColorSettings=window.wp.blockEditor.PanelColorSettings;export const MediaUpload=window.wp.blockEditor.MediaUpload;export const MediaUploadCheck=window.wp.blockEditor.MediaUploadCheck;export const InnerBlocks=window.wp.blockEditor.InnerBlocks;export const useInnerBlocksProps=window.wp.blockEditor.useInnerBlocksProps;',
                '@wordpress/components' => 'data:text/javascript,export default window.wp.components;export const Button=window.wp.components.Button;export const ButtonGroup=window.wp.components.ButtonGroup;export const PanelBody=window.wp.components.PanelBody;export const TextControl=window.wp.components.TextControl;export const TextareaControl=window.wp.components.TextareaControl;export const SelectControl=window.wp.components.SelectControl;export const ToggleControl=window.wp.components.ToggleControl;export const RangeControl=window.wp.components.RangeControl;export const Modal=window.wp.components.Modal;export const BaseControl=window.wp.components.BaseControl;export const Panel=window.wp.components.Panel;export const PanelRow=window.wp.components.PanelRow;export const ToolbarGroup=window.wp.components.ToolbarGroup;export const ToolbarButton=window.wp.components.ToolbarButton;export const Spinner=window.wp.components.Spinner;export const Placeholder=window.wp.components.Placeholder;export const ColorPalette=window.wp.components.ColorPalette;export const DropdownMenu=window.wp.components.DropdownMenu;export const MenuGroup=window.wp.components.MenuGroup;export const MenuItem=window.wp.components.MenuItem;',
                '@wordpress/i18n' => 'data:text/javascript,export default window.wp.i18n;export const __=window.wp.i18n.__;export const _x=window.wp.i18n._x;export const _n=window.wp.i18n._n;',
                '@wordpress/element' => 'data:text/javascript,export default window.wp.element;export const createElement=window.wp.element.createElement;export const Fragment=window.wp.element.Fragment;export const useState=window.wp.element.useState;export const useEffect=window.wp.element.useEffect;export const useRef=window.wp.element.useRef;',
                '@wordpress/data' => 'data:text/javascript,export default window.wp.data;export const useSelect=window.wp.data.useSelect;export const useDispatch=window.wp.data.useDispatch;export const dispatch=window.wp.data.dispatch;',
                '@wordpress/core-data' => 'data:text/javascript,export default window.wp.coreData;export const useEntityRecords=window.wp.coreData.useEntityRecords;export const useEntityRecord=window.wp.coreData.useEntityRecord;export const useEntityProp=window.wp.coreData.useEntityProp;',
                '@wordpress/server-side-render' => 'data:text/javascript,export default window.wp.serverSideRender;',
                '@wordpress/api-fetch' => 'data:text/javascript,export default window.wp.apiFetch;',
                'react' => 'data:text/javascript,export default window.React;export const createElement=window.React.createElement;export const Component=window.React.Component;export const Fragment=window.React.Fragment;export const useState=window.React.useState;export const useEffect=window.React.useEffect;export const useRef=window.React.useRef;export const useMemo=window.React.useMemo;export const useCallback=window.React.useCallback;export const useContext=window.React.useContext;export const createContext=window.React.createContext;export const useReducer=window.React.useReducer;export const useLayoutEffect=window.React.useLayoutEffect;export const useImperativeHandle=window.React.useImperativeHandle;export const memo=window.React.memo;export const forwardRef=window.React.forwardRef;',
                'react-dom' => 'data:text/javascript,export default window.ReactDOM;export const createPortal=window.ReactDOM.createPortal;export const unstable_batchedUpdates=window.ReactDOM.unstable_batchedUpdates||function(fn){fn();};',
                // noUiSlider - loaded from Voxel parent theme's vendor folder
                // Evidence: themes/voxel/app/controllers/assets-controller.php:141
                // Uses Proxy to defer window.noUiSlider access until runtime (after script loads)
                'nouislider' => 'data:text/javascript,const p=new Proxy({},{get:(t,k)=>window.noUiSlider?.[k]});export default p;export const create=(...a)=>window.noUiSlider.create(...a);',
        ];

        echo '<script type="importmap">' . wp_json_encode(['imports' => $imports], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . '</script>' . "\n";
        // Cache buster: updated import map
    }

    /**
     * Register block categories
     */
    public static function register_block_categories()
    {
        // Block categories are registered via filter
    }

    /**
     * Add custom block categories
     *
     * @param array $categories Existing block categories.
     * @return array Modified block categories.
     */
    public static function add_block_categories($categories)
    {
        $custom_categories = [
                [
                        'slug' => 'voxel-fse',
                        'title' => __('Voxel FSE', 'voxel-fse'),
                        'icon' => 'admin-customizer',
                ],
                [
                        'slug' => 'voxel-fse-forms',
                        'title' => __('Voxel FSE Forms', 'voxel-fse'),
                        'icon' => 'forms',
                ],
                [
                        'slug' => 'voxel-fse-social',
                        'title' => __('Voxel FSE Social', 'voxel-fse'),
                        'icon' => 'groups',
                ],
                [
                        'slug' => 'voxel-fse-commerce',
                        'title' => __('Voxel FSE Commerce', 'voxel-fse'),
                        'icon' => 'cart',
                ],
                [
                        'slug' => 'voxel-fse-users',
                        'title' => __('Voxel FSE Users', 'voxel-fse'),
                        'icon' => 'admin-users',
                ],
                [
                        'slug' => 'voxel-fse-content',
                        'title' => __('Voxel FSE Content', 'voxel-fse'),
                        'icon' => 'layout',
                ],
                [
                        'slug' => 'voxel-fse-layout',
                        'title' => __('Voxel FSE Layout', 'voxel-fse'),
                        'icon' => 'editor-table',
                ],
                [
                        'slug' => 'voxel-fse-location',
                        'title' => __('Voxel FSE Location', 'voxel-fse'),
                        'icon' => 'location',
                ],
        ];

        return array_merge($custom_categories, $categories);
    }

    /**
     * Check if Vite dev server is running
     *
     * @return bool
     */
    private static function is_dev_server_running()
    {
        // IMPORTANT: Editor blocks always use production builds
        // HMR is only for frontend development (create-post-frontend.js)
        // This avoids rungen module errors in the Gutenberg editor
        // Frontend form uses separate vite.frontend.config.js with dev server
        return false;
    }

    /**
     * Load all blocks from the blocks directory
     */
    public static function load_blocks()
    {
        $blocks_dir = get_stylesheet_directory() . '/app/blocks/src';

        if (!is_dir($blocks_dir)) {
            return;
        }

        // Enqueue Vite client for HMR in dev mode
        if (self::is_dev_server_running()) {
            add_action('enqueue_block_editor_assets', [__CLASS__, 'enqueue_vite_client']);
        }

        $block_dirs = glob($blocks_dir . '/*', GLOB_ONLYDIR);

        foreach ($block_dirs as $block_dir) {
            $block_name = basename($block_dir);
            self::register_block($block_dir, $block_name);
        }
    }

    /**
     * Register a single block
     *
     * @param string $block_dir Block directory path.
     * @param string $block_name Block name.
     */
    private static function register_block($block_dir, $block_name)
    {
        // Skip columns blocks (temporarily deactivated)
        if ($block_name === 'columns' || $block_name === 'column') {
            return;
        }

        $block_json = $block_dir . '/block.json';

        // Check for block.json (WordPress standard)
        if (file_exists($block_json)) {
            self::register_block_from_json($block_dir, $block_name, $block_json);
        } else {
            // Fallback: Check for PHP class file
            self::register_block_from_class($block_dir, $block_name);
        }
    }

    /**
     * Register block from block.json
     *
     * @param string $block_dir Block directory path.
     * @param string $block_name Block name.
     * @param string $block_json Path to block.json.
     */
    /**
     * Merge advanced tab attributes into block config
     *
     * All voxel-fse blocks automatically get AdvancedTab + VoxelTab attributes.
     * This enables consistent styling controls across all blocks:
     * - AdvancedTab: margin, padding, background, border, transform, etc.
     * - VoxelTab: sticky position, visibility rules, loop element
     *
     * @param array $block_config Block configuration from block.json.
     * @return array Block config with shared tab attributes merged.
     */
    private static function merge_advanced_tab_attributes(array $block_config): array
    {
        // Get shared tab attributes
        $advanced_attributes = get_advanced_tab_attributes();
        $voxel_attributes = get_voxel_tab_attributes();

        // Merge all shared attributes (AdvancedTab + VoxelTab)
        $shared_attributes = array_merge($advanced_attributes, $voxel_attributes);

        // Merge with block's existing attributes (block-specific attributes take precedence)
        $existing_attributes = $block_config['attributes'] ?? [];
        $block_config['attributes'] = array_merge($shared_attributes, $existing_attributes);

        return $block_config;
    }

    private static function register_block_from_json($block_dir, $block_name, $block_json)
    {
        // Parse block.json to get script file
        $block_config = json_decode(file_get_contents($block_json), true);

        if (!$block_config) {
            return;
        }

        // Merge advanced tab attributes into all blocks
        $block_config = self::merge_advanced_tab_attributes($block_config);

        // Check if block has a PHP class for render callback
        $class_file = $block_dir . '/' . ucfirst(str_replace('-', '_', $block_name)) . '_Block.php';

        if (file_exists($class_file)) {
            require_once $class_file;

            $class_name = '\\VoxelFSE\\Blocks\\Src\\' . ucfirst(str_replace('-', '_', $block_name)) . '_Block';

            if (class_exists($class_name)) {
                $block = new $class_name();
                self::$blocks[$block_name] = $block;

                // If the PHP block class defines a registration method, call it now
                if (method_exists($block, 'register_block')) {
                    try {
                        $block->register_block();
                    } catch (\Throwable $e) {
                        // Silently fail - block registration errors are handled elsewhere
                    }
                }

                return; // PHP class handles registration
            }
        }

        // Register block type from block.json
        $is_dev = self::is_dev_server_running();

        if ($is_dev) {
            // Dev mode: Override editorScript to load from Vite
            self::register_block_with_vite($block_dir, $block_name, $block_config);
        } else {
            // Production mode: Load from built manifest
            self::register_block_with_manifest($block_dir, $block_name, $block_config);
        }
    }

    /**
     * Register block with Vite dev server
     *
     * @param string $block_dir Block directory path.
     * @param string $block_name Block name.
     * @param array $block_config Block configuration from block.json.
     */
    private static function register_block_with_vite($block_dir, $block_name, $block_config)
    {
        // Get script file from block.json
        $editor_script = $block_config['editorScript'] ?? '';

        if (empty($editor_script)) {
            // Fallback: Try common patterns
            $possible_files = ['index.js', 'index.jsx', $block_name . '.js', $block_name . '.jsx'];
            foreach ($possible_files as $file) {
                if (file_exists($block_dir . '/' . $file)) {
                    $editor_script = 'file:./' . $file;
                    break;
                }
            }
        }

        if (empty($editor_script)) {
            return;
        }

        // Convert file:./script.js to actual filename
        $script_file = str_replace('file:./', '', $editor_script);

        // Find the actual file extension (.js, .jsx, .ts, .tsx)
        // block.json might say "index.js" but the actual file is "index.tsx"
        $possible_extensions = ['.js', '.jsx', '.ts', '.tsx'];
        $base_name = pathinfo($script_file, PATHINFO_FILENAME);
        $actual_file = $script_file; // Default to original

        foreach ($possible_extensions as $ext) {
            $test_file = $block_dir . '/' . $base_name . $ext;
            if (file_exists($test_file)) {
                $actual_file = $base_name . $ext;
                break;
            }
        }

        $script_handle = 'mw-block-' . $block_name;

        // Enqueue script from Vite dev server
        // Vite serves files based on the input path in vite.config.ts
        // Input: 'create-post': 'app/blocks/src/create-post/index.tsx'
        // URL: http://localhost:3000/app/blocks/src/create-post/index.tsx
        add_action('enqueue_block_editor_assets', function () use ($script_handle, $block_name, $actual_file) {
            $script_url = 'http://localhost:3000/app/blocks/src/' . $block_name . '/' . $actual_file;

            // Base dependencies for all blocks
            $script_deps = ['wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n'];

            // Add nouislider dependency for search-form block (uses range slider filter)
            if ($block_name === 'search-form') {
                $script_deps[] = 'nouislider';
            }

            wp_enqueue_script(
                    $script_handle,
                    $script_url,
                    $script_deps,
                    null,
                    true
            );

            // Add type="module" attribute for ES module format
            self::mark_script_as_module($script_handle);
        });

        // Register block type with custom script handle
        $block_args = array_merge(
                $block_config,
                ['editor_script' => $script_handle]
        );

        unset($block_args['editorScript']); // Remove file reference

        register_block_type($block_config['name'], $block_args);
    }

    /**
     * Register block with built assets from Vite manifest (production mode)
     *
     * @param string $block_dir Block directory path.
     * @param string $block_name Block name.
     * @param array $block_config Block configuration from block.json.
     */
    private static function register_block_with_manifest($block_dir, $block_name, $block_config)
    {
        // Get editor script from block.json
        $editor_script = $block_config['editorScript'] ?? '';

        if (empty($editor_script)) {
            // No editor script defined, just register the block
            register_block_type($block_dir);
            return;
        }

        // Convert file:./index.js to app/blocks/src/block-name/index.js format
        $script_file = str_replace('file:./', '', $editor_script);

        // Try to find the actual file extension (.js, .jsx, .ts, .tsx)
        $possible_extensions = ['.js', '.jsx', '.ts', '.tsx'];
        $base_name = pathinfo($script_file, PATHINFO_FILENAME);
        $actual_file = $script_file; // Default to original

        foreach ($possible_extensions as $ext) {
            $test_file = $block_dir . '/' . $base_name . $ext;
            if (file_exists($test_file)) {
                $actual_file = $base_name . $ext;
                break;
            }
        }

        // Try two possible entry key formats:
        // 1. vite.config.ts format: just the block name (e.g., 'create-post') - PRIMARY
        // 2. vite.blocks.config.js format: full path (e.g., 'app/blocks/src/create-post/index.tsx') - FALLBACK
        $entry_key_vite_config = $block_name;
        $entry_key_blocks_config = 'app/blocks/src/' . $block_name . '/' . $actual_file;

        // Build directory
        $build_dir = get_stylesheet_directory() . '/assets/dist';
        $build_url = get_stylesheet_directory_uri() . '/assets/dist';

        // Try to find the built file using manifest.json
        $manifest_path = $build_dir . '/.vite/manifest.json';
        $built_script = null;
        $built_script_url = null;
        $manifest = null;
        $entry_key = 'app/blocks/src/' . $block_name . '/' . $actual_file;

        if (file_exists($manifest_path)) {
            $manifest = json_decode(file_get_contents($manifest_path), true);

            if (isset($manifest[$entry_key]) && isset($manifest[$entry_key]['file'])) {
                $built_script = $build_dir . '/' . $manifest[$entry_key]['file'];
                $built_script_url = $build_url . '/' . $manifest[$entry_key]['file'];
            }
        }

        // Fallback: Check old location (for backwards compatibility)
        if (!$built_script || !file_exists($built_script)) {
            $built_script = $build_dir . '/' . $block_name . '/index.js';
            $built_script_url = $build_url . '/' . $block_name . '/index.js';
        }

        if ($built_script && file_exists($built_script)) {
            // Register with built assets from assets/dist/ directory
            $script_handle = 'mw-block-' . $block_name;
            $version = defined('VOXEL_FSE_VERSION') ? VOXEL_FSE_VERSION : filemtime($built_script);

            // Determine script dependencies based on block type
            $script_deps = ['wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n'];

            // Add nouislider dependency for search-form block (uses range slider filter)
            if ($block_name === 'search-form') {
                $script_deps[] = 'nouislider';
            }

            // Register the script
            wp_register_script(
                    $script_handle,
                    $built_script_url,
                    $script_deps,
                    $version,
                    true
            );

            // Add type="module" attribute for ES module format
            // WordPress editor provides import maps for @wordpress/* packages
            // Add type="module" attribute for ES module format
            // WordPress editor provides import maps for @wordpress/* packages
            self::mark_script_as_module($script_handle);

            // Check for CSS file in manifest
            $built_css = null;
            $built_css_url = null;

            if ($manifest && isset($manifest[$entry_key]['css']) && is_array($manifest[$entry_key]['css'])) {
                // Use first CSS file from manifest
                $css_file = $manifest[$entry_key]['css'][0];
                $built_css = $build_dir . '/' . $css_file;
                $built_css_url = $build_url . '/' . $css_file;
            }

            // Note: voxel-fse.css fallback removed - it was overriding styles in page editor
            // Individual block CSS files from manifest are used instead

            // Use merged $block_config (includes voxel tab attributes like visibility rules)
            // instead of re-reading block.json which would lose merged attributes
            $block_metadata = $block_config;

            if (!empty($block_metadata)) {

                // Handle editorStyle from source (for blocks with ServerSideRender)
                if (isset($block_metadata['editorStyle']) && strpos($block_metadata['editorStyle'], 'file:') === 0) {
                    $editor_style_file = str_replace('file:./', '', $block_metadata['editorStyle']);
                    $editor_style_path = $block_dir . '/' . $editor_style_file;

                    if (file_exists($editor_style_path)) {
                        $editor_style_handle = 'mw-block-' . $block_name . '-editor';
                        $editor_style_url = get_stylesheet_directory_uri() . '/app/blocks/src/' . $block_name . '/' . $editor_style_file;

                        // Dependencies: Voxel core styles for popup block
                        // Register them NOW so they're available as dependencies
                        // IMPORTANT: These dependencies ensure styles load in FSE template editor iframe
                        // The iframe uses _wp_get_iframed_editor_assets() which only includes styles
                        // registered as dependencies of the block's editorStyle
                        $editor_style_deps = [];
                        if ($block_name === 'popup-kit') {
                            // Ensure Voxel styles are registered before using them as dependencies
                            self::ensure_voxel_styles_registered();
                            // Include all Voxel core styles and vendor CSS as dependencies
                            // This ensures they load in both post editor and FSE template editor iframe
                            $editor_style_deps = [
                                    'vx:commons.css',
                                    'vx:forms.css',
                                    'vx:popup-kit.css',
                                    'vx:product-form.css',
                                    'nouislider',
                                    'pikaday'
                            ];
                        } elseif ($block_name === 'create-post') {
                            // Ensure Voxel styles are registered before using them as dependencies
                            self::ensure_voxel_styles_registered();
                            // Include Voxel form styles for create-post preview
                            // This ensures the editor preview matches the frontend exactly
                            // CRITICAL: popup-kit.css required for field popups (multiselect, taxonomy, timezone, etc.)
                            $editor_style_deps = [
                                    'vx:commons.css',
                                    'vx:forms.css',
                                    'vx:create-post.css',
                                    'vx:popup-kit.css'
                            ];
                        } elseif ($block_name === 'search-form') {
                            // Ensure Voxel styles are registered before using them as dependencies
                            self::ensure_voxel_styles_registered();
                            // Include Voxel form/popup styles for search form preview
                            $editor_style_deps = [
                                    'vx:commons.css',
                                    'vx:forms.css',
                                    'vx:popup-kit.css'
                            ];
                        } elseif ($block_name === 'timeline') {
                            // Ensure Voxel styles are registered before using them as dependencies
                            self::ensure_voxel_styles_registered();
                            // Include Voxel social feed and form styles for timeline preview
                            // Matches timeline widget dependencies from app/widgets/timeline.php
                            $editor_style_deps = [
                                    'vx:forms.css',
                                    'vx:social-feed.css'
                            ];
                        } elseif ($block_name === 'timeline-kit') {
                            // Ensure Voxel styles are registered before using them as dependencies
                            self::ensure_voxel_styles_registered();
                            // ONLY list social-feed.css - it has transitive deps: forms → commons → fse-commons
                            // WordPress resolves: fse-commons → commons → forms → social-feed → editor.css
                            // This ensures social-feed.css loads LAST so .vxf-link overrides .flexify
                            $editor_style_deps = [
                                    'vx:social-feed.css'  // Transitive: pulls in forms → commons → fse-commons
                            ];
                        } elseif ($block_name === 'work-hours') {
                            // Ensure Voxel styles are registered before using them as dependencies
                            self::ensure_voxel_styles_registered();
                            // Include Voxel work-hours styles for editor preview
                            // Matches work-hours widget dependencies from parent theme
                            $editor_style_deps = [
                                    'vx:commons.css',
                                    'vx:work-hours.css'
                            ];
                        } elseif ($block_name === 'review-stats') {
                            // Ensure Voxel styles are registered before using them as dependencies
                            self::ensure_voxel_styles_registered();
                            // Include Voxel review-stats styles for editor preview
                            // Evidence: themes/voxel/app/widgets/review-stats.php uses get_style_depends() -> ['vx:review-stats.css']
                            $editor_style_deps = [
                                    'vx:commons.css',
                                    'vx:review-stats.css'
                            ];
                        } elseif ($block_name === 'quick-search') {
                            self::ensure_voxel_styles_registered();
                            $editor_style_deps = [
                                    'vx:commons.css',
                                    'vx:forms.css'
                            ];
                        } elseif ($block_name === 'userbar') {
                            self::ensure_voxel_styles_registered();
                            $editor_style_deps = [
                                    'vx:commons.css'
                            ];
                        } elseif ($block_name === 'login') {
                            self::ensure_voxel_styles_registered();
                            $editor_style_deps = [
                                    'vx:commons.css',
                                    'vx:forms.css'
                            ];
                        } elseif ($block_name === 'product-form') {
                            self::ensure_voxel_styles_registered();
                            $editor_style_deps = [
                                    'vx:commons.css',
                                    'vx:forms.css',
                                    'vx:product-form.css'
                            ];
                        } elseif ($block_name === 'navbar') {
                            self::ensure_voxel_styles_registered();
                            $editor_style_deps = [
                                    'vx:commons.css'
                            ];
                        } elseif ($block_name === 'messages') {
                            self::ensure_voxel_styles_registered();
                            $editor_style_deps = [
                                    'vx:commons.css',
                                    'vx:forms.css'
                            ];
                        } elseif ($block_name === 'term-feed') {
                            self::ensure_voxel_styles_registered();
                            $editor_style_deps = [
                                    'vx:commons.css',
                                    'vx:post-feed.css'
                            ];
                        }

                        // WordPress requires 'wp-edit-blocks' dependency for editor styles
                        $final_deps = array_merge(['wp-edit-blocks'], $editor_style_deps);

                        wp_register_style(
                                $editor_style_handle,
                                $editor_style_url,
                                $final_deps,
                                filemtime($editor_style_path)
                        );

                        // Note: pikaday is enqueued in enqueue_voxel_core_styles()
                        // which runs at priority 10, ensuring it loads after editor.css (priority 20)

                        // Explicitly enqueue for editor (WordPress auto-enqueue might not respect deps)
                        add_action('enqueue_block_editor_assets', function () use ($editor_style_handle, $final_deps) {
                            // Ensure dependencies are loaded first
                            foreach ($final_deps as $dep) {
                                if (wp_style_is($dep, 'registered') && !wp_style_is($dep, 'enqueued')) {
                                    wp_enqueue_style($dep);
                                }
                            }
                            wp_enqueue_style($editor_style_handle);
                        }, 20); // Priority 20 to load after Voxel styles (priority 10)

                        $block_metadata['editor_style'] = $editor_style_handle;
                    }
                }

                // Handle viewScript from source (for frontend JavaScript)
                if (isset($block_metadata['viewScript']) && strpos($block_metadata['viewScript'], 'file:') === 0) {
                    $view_script_file = str_replace('file:./', '', $block_metadata['viewScript']);
                    $view_script_path = $block_dir . '/' . $view_script_file;

                    if (file_exists($view_script_path)) {
                        $view_script_handle = 'mw-block-' . $block_name . '-view';
                        $view_script_url = get_stylesheet_directory_uri() . '/app/blocks/src/' . $block_name . '/' . $view_script_file;

                        // Determine dependencies based on block type
                        // Plan C+ blocks that use React hydration need react and react-dom globals
                        // These blocks use React.createElement or ReactDOM.createRoot in their frontend.js
                        $react_hydration_blocks = [
                                'search-form',
                                'create-post',
                                'product-price',
                                'review-stats',
                                'print-template',
                                'timeline',
                                'countdown',
                                'sales-chart',
                                'visit-chart',
                                'stripe-account',
                                'membership-plans',
                                'listing-plans',
                                'navbar',
                                'advanced-list',
                                'userbar',
                                'quick-search',
                                'current-plan',
                                'cart-summary',
                                'post-feed',
                                'login',
                                'product-form',
                                'messages',
                                'orders',
                                'slider',
                                'gallery',
                                'map',
                                'ring-chart',
                                'work-hours',
                                'term-feed',
                                'columns',
                                'column',
                                'image',
                        ];
                        $view_script_deps = [];
                        if (in_array($block_name, $react_hydration_blocks, true)) {
                            // IIFE bundles use window.React and window.ReactDOM globals directly
                            // Must use 'react' and 'react-dom' handles (not wp-element) to expose these globals
                            // CRITICAL: Also include 'wp-api-fetch' for blocks that use REST API calls
                            $view_script_deps = ['react', 'react-dom', 'wp-api-fetch'];

                            // Enqueue Line Awesome icons for forms
                            $line_awesome_url = get_template_directory_uri() . '/assets/icons/line-awesome/line-awesome.css';
                            wp_register_style('voxel-line-awesome', $line_awesome_url, [], '1.3.0');
                            wp_enqueue_style('voxel-line-awesome');

                            // review-stats needs Voxel's review-stats.css for ts-review-bars styling
                            // NOTE: Enqueue via wp_enqueue_scripts hook, NOT during init
                            // This prevents commons.css from loading on all admin pages
                            if ($block_name === 'review-stats') {
                                add_action('wp_enqueue_scripts', function () {
                                    $dist = trailingslashit(get_template_directory_uri()) . 'assets/dist/';
                                    $version = function_exists('\Voxel\get_assets_version') ? \Voxel\get_assets_version() : '1.7.1.3';

                                    // Register and enqueue review-stats.css from Voxel parent
                                    if (!wp_style_is('vx:review-stats.css', 'registered')) {
                                        wp_register_style(
                                                'vx:review-stats.css',
                                                $dist . (is_rtl() ? 'review-stats-rtl.css' : 'review-stats.css'),
                                                [],
                                                $version
                                        );
                                    }
                                    wp_enqueue_style('vx:review-stats.css');
                                });
                            }

                            // quick-search needs Voxel's forms.css
                            if ($block_name === 'quick-search') {
                                add_action('wp_enqueue_scripts', function () {
                                    self::ensure_voxel_styles_registered();
                                    if (wp_style_is('vx:forms.css', 'registered')) {
                                        wp_enqueue_style('vx:forms.css');
                                    }
                                });
                            }

                            // userbar needs Voxel's commons.css
                            if ($block_name === 'userbar') {
                                add_action('wp_enqueue_scripts', function () {
                                    self::ensure_voxel_styles_registered();
                                    if (wp_style_is('vx:commons.css', 'registered')) {
                                        wp_enqueue_style('vx:commons.css');
                                    }
                                });
                            }

                            // login needs Voxel's forms.css
                            if ($block_name === 'login') {
                                add_action('wp_enqueue_scripts', function () {
                                    self::ensure_voxel_styles_registered();
                                    if (wp_style_is('vx:forms.css', 'registered')) {
                                        wp_enqueue_style('vx:forms.css');
                                    }
                                });
                            }

                            // product-form needs Voxel's product-form.css
                            if ($block_name === 'product-form') {
                                add_action('wp_enqueue_scripts', function () {
                                    self::ensure_voxel_styles_registered();
                                    if (wp_style_is('vx:product-form.css', 'registered')) {
                                        wp_enqueue_style('vx:product-form.css');
                                    }
                                });
                            }

                            // navbar needs Voxel's commons.css
                            if ($block_name === 'navbar') {
                                add_action('wp_enqueue_scripts', function () {
                                    self::ensure_voxel_styles_registered();
                                    if (wp_style_is('vx:commons.css', 'registered')) {
                                        wp_enqueue_style('vx:commons.css');
                                    }
                                });
                            }

                            // messages needs Voxel's forms.css
                            if ($block_name === 'messages') {
                                add_action('wp_enqueue_scripts', function () {
                                    self::ensure_voxel_styles_registered();
                                    if (wp_style_is('vx:forms.css', 'registered')) {
                                        wp_enqueue_style('vx:forms.css');
                                    }
                                });
                            }

                            // term-feed needs Voxel's post-feed.css
                            if ($block_name === 'term-feed') {
                                add_action('wp_enqueue_scripts', function () {
                                    self::ensure_voxel_styles_registered();
                                    if (wp_style_is('vx:post-feed.css', 'registered')) {
                                        wp_enqueue_style('vx:post-feed.css');
                                    }
                                });
                            }

                            // sales-chart and visit-chart need Voxel's bar-chart.css for chart styling
                            if ($block_name === 'sales-chart' || $block_name === 'visit-chart') {
                                $dist = trailingslashit(get_template_directory_uri()) . 'assets/dist/';
                                $version = function_exists('\Voxel\get_assets_version') ? \Voxel\get_assets_version() : '1.7.1.3';

                                // Register and enqueue bar-chart.css from Voxel parent
                                if (!wp_style_is('vx:bar-chart.css', 'registered')) {
                                    wp_register_style(
                                            'vx:bar-chart.css',
                                            $dist . (is_rtl() ? 'bar-chart-rtl.css' : 'bar-chart.css'),
                                            [],
                                            $version
                                    );
                                }
                                wp_enqueue_style('vx:bar-chart.css');
                            }

                            // membership-plans and listing-plans need Voxel's pricing-plan.css for plan styling
                            // Evidence: pricing-plans-widget.php:1518-1519
                            if ($block_name === 'membership-plans' || $block_name === 'listing-plans') {
                                add_action('wp_enqueue_scripts', function () {
                                    $dist = trailingslashit(get_template_directory_uri()) . 'assets/dist/';
                                    $version = function_exists('\Voxel\get_assets_version') ? \Voxel\get_assets_version() : '1.7.1.3';

                                    // Register and enqueue pricing-plan.css from Voxel parent
                                    if (!wp_style_is('vx:pricing-plan.css', 'registered')) {
                                        wp_register_style(
                                                'vx:pricing-plan.css',
                                                $dist . (is_rtl() ? 'pricing-plan-rtl.css' : 'pricing-plan.css'),
                                                [],
                                                $version
                                        );
                                    }
                                    wp_enqueue_style('vx:pricing-plan.css');
                                });
                            }

                            // create-post needs TinyMCE editor and Voxel CSS/JS for texteditor fields
                            if ($block_name === 'create-post') {
                                // Load WordPress classic editor assets for TinyMCE
                                // This matches Voxel's approach from render.php lines 664-665
                                add_action('wp_enqueue_scripts', function () {
                                    if (!class_exists('_WP_Editors', false)) {
                                        require_once ABSPATH . WPINC . '/class-wp-editor.php';
                                    }
                                    // Deregister editor-buttons style BEFORE enqueuing editor
                                    // This prevents Query Monitor warning about missing dependency
                                    wp_deregister_style('editor-buttons');
                                    \_WP_Editors::enqueue_default_editor();

                                    // Enqueue Voxel's CSS dependencies (from render.php lines 875-891)
                                    $assets = trailingslashit(get_template_directory_uri()) . 'assets/';
                                    $dist = trailingslashit($assets) . 'dist/';
                                    $version = function_exists('\Voxel\get_assets_version') ? \Voxel\get_assets_version() : '1.7.1.3';

                                    // Register FSE commons CSS (contains TinyMCE overrides)
                                    if (!wp_style_is('vx:fse-commons.css', 'registered')) {
                                        $fse_commons_url = get_stylesheet_directory_uri() . '/assets/css/voxel-fse-commons.css';
                                        wp_register_style('vx:fse-commons.css', $fse_commons_url, [], VOXEL_FSE_VERSION);
                                    }

                                    // Register and enqueue Voxel CSS (with fse-commons as dependency)
                                    if (!wp_style_is('vx:commons.css', 'registered')) {
                                        wp_register_style('vx:commons.css', $dist . (is_rtl() ? 'commons-rtl.css' : 'commons.css'), ['vx:fse-commons.css'], $version);
                                    }
                                    if (!wp_style_is('vx:forms.css', 'registered')) {
                                        wp_register_style('vx:forms.css', $dist . (is_rtl() ? 'forms-rtl.css' : 'forms.css'), [], $version);
                                    }
                                    if (!wp_style_is('vx:create-post.css', 'registered')) {
                                        wp_register_style('vx:create-post.css', $dist . (is_rtl() ? 'create-post-rtl.css' : 'create-post.css'), [], $version);
                                    }
                                    if (!wp_style_is('vx:popup-kit.css', 'registered')) {
                                        wp_register_style('vx:popup-kit.css', $dist . (is_rtl() ? 'popup-kit-rtl.css' : 'popup-kit.css'), [], $version);
                                    }

                                    // Check if styles are already enqueued to prevent duplicate loading in backend                                    // (this code is called multiple times for different blocks)
                                    // Enqueue all Voxel CSS (fse-commons loads automatically as dependency)
                                    if (!wp_style_is('vx:commons.css', 'enqueued')) wp_enqueue_style('vx:commons.css');
                                    if (!wp_style_is('vx:forms.css', 'enqueued')) wp_enqueue_style('vx:forms.css');
                                    if (!wp_style_is('vx:create-post.css', 'enqueued')) wp_enqueue_style('vx:create-post.css');
                                    if (!wp_style_is('vx:popup-kit.css', 'enqueued')) wp_enqueue_style('vx:popup-kit.css');

                                    // Enqueue Pikaday for date fields
                                    if (wp_script_is('pikaday', 'registered')) {
                                        wp_enqueue_script('pikaday');
                                        wp_enqueue_style('pikaday');
                                    }

                                    // CRITICAL: Use React-compatible voxel-commons.js instead of Vue-based vx:commons.js
                                    // The Vue-based commons.js causes conflicts in Gutenberg editor
                                    if (!wp_script_is('voxel-fse-commons', 'enqueued')) {
                                        $commons_url = get_stylesheet_directory_uri() . '/assets/dist/voxel-commons.js';
                                        wp_enqueue_script(
                                            'voxel-fse-commons',
                                            $commons_url,
                                            [],
                                            defined('VOXEL_FSE_VERSION') ? VOXEL_FSE_VERSION : '1.0.0',
                                            true
                                        );
                                    }
                                }, 100);

                                // TinyMCE skin overrides are in voxel-fse-commons.css
                                // (loaded as dependency of vx:commons.css above)
                            }

                            // search-form needs Voxel's commons.css, forms.css, and popup-kit.css
                            // for .ts-form, .ts-filter, .ts-btn, and popup toggle mode styling
                            // Evidence: themes/voxel/templates/widgets/search-form.php
                            if ($block_name === 'search-form') {
                                add_action('wp_enqueue_scripts', function () {
                                    $dist = trailingslashit(get_template_directory_uri()) . 'assets/dist/';
                                    $version = function_exists('\Voxel\get_assets_version') ? \Voxel\get_assets_version() : '1.7.1.3';

                                    // Register FSE commons CSS (contains CSS variable definitions)
                                    if (!wp_style_is('vx:fse-commons.css', 'registered')) {
                                        $fse_commons_url = get_stylesheet_directory_uri() . '/assets/css/voxel-fse-commons.css';
                                        wp_register_style('vx:fse-commons.css', $fse_commons_url, [], VOXEL_FSE_VERSION);
                                    }

                                    // Register Voxel CSS dependencies
                                    if (!wp_style_is('vx:commons.css', 'registered')) {
                                        wp_register_style('vx:commons.css', $dist . (is_rtl() ? 'commons-rtl.css' : 'commons.css'), ['vx:fse-commons.css'], $version);
                                    }
                                    if (!wp_style_is('vx:forms.css', 'registered')) {
                                        wp_register_style('vx:forms.css', $dist . (is_rtl() ? 'forms-rtl.css' : 'forms.css'), ['vx:commons.css'], $version);
                                    }
                                    if (!wp_style_is('vx:popup-kit.css', 'registered')) {
                                        wp_register_style('vx:popup-kit.css', $dist . (is_rtl() ? 'popup-kit-rtl.css' : 'popup-kit.css'), ['vx:commons.css'], $version);
                                    }

                                    // Enqueue all required Voxel CSS
                                    if (!wp_style_is('vx:commons.css', 'enqueued')) wp_enqueue_style('vx:commons.css');
                                    if (!wp_style_is('vx:forms.css', 'enqueued')) wp_enqueue_style('vx:forms.css');
                                    if (!wp_style_is('vx:popup-kit.css', 'enqueued')) wp_enqueue_style('vx:popup-kit.css');

                                    // Enqueue pikaday for date fields
                                    if (wp_style_is('pikaday', 'registered')) {
                                        wp_enqueue_style('pikaday');
                                    }
                                    if (wp_script_is('pikaday', 'registered')) {
                                        wp_enqueue_script('pikaday');
                                    }

                                    // Enqueue nouislider for range filter
                                    if (wp_style_is('nouislider', 'registered')) {
                                        wp_enqueue_style('nouislider');
                                    }
                                }, 100);
                            }

                            // post-feed needs Voxel's commons.css and forms.css
                            // for .ts-post-grid, .ts-card, .ts-form styling
                            // Evidence: themes/voxel/templates/widgets/post-feed.php
                            if ($block_name === 'post-feed') {
                                add_action('wp_enqueue_scripts', function () {
                                    $dist = trailingslashit(get_template_directory_uri()) . 'assets/dist/';
                                    $version = function_exists('\Voxel\get_assets_version') ? \Voxel\get_assets_version() : '1.7.1.3';

                                    // Register FSE commons CSS
                                    if (!wp_style_is('vx:fse-commons.css', 'registered')) {
                                        $fse_commons_url = get_stylesheet_directory_uri() . '/assets/css/voxel-fse-commons.css';
                                        wp_register_style('vx:fse-commons.css', $fse_commons_url, [], VOXEL_FSE_VERSION);
                                    }

                                    // Register Voxel CSS dependencies
                                    if (!wp_style_is('vx:commons.css', 'registered')) {
                                        wp_register_style('vx:commons.css', $dist . (is_rtl() ? 'commons-rtl.css' : 'commons.css'), ['vx:fse-commons.css'], $version);
                                    }
                                    if (!wp_style_is('vx:forms.css', 'registered')) {
                                        wp_register_style('vx:forms.css', $dist . (is_rtl() ? 'forms-rtl.css' : 'forms.css'), ['vx:commons.css'], $version);
                                    }

                                    // Enqueue required Voxel CSS
                                    if (!wp_style_is('vx:commons.css', 'enqueued')) wp_enqueue_style('vx:commons.css');
                                    if (!wp_style_is('vx:forms.css', 'enqueued')) wp_enqueue_style('vx:forms.css');
                                }, 100);
                            }

                            // map block needs Voxel's commons.css and map-related styling
                            if ($block_name === 'map') {
                                add_action('wp_enqueue_scripts', function () {
                                    $dist = trailingslashit(get_template_directory_uri()) . 'assets/dist/';
                                    $version = function_exists('\Voxel\get_assets_version') ? \Voxel\get_assets_version() : '1.7.1.3';

                                    // Register FSE commons CSS
                                    if (!wp_style_is('vx:fse-commons.css', 'registered')) {
                                        $fse_commons_url = get_stylesheet_directory_uri() . '/assets/css/voxel-fse-commons.css';
                                        wp_register_style('vx:fse-commons.css', $fse_commons_url, [], VOXEL_FSE_VERSION);
                                    }

                                    // Register Voxel CSS dependencies
                                    if (!wp_style_is('vx:commons.css', 'registered')) {
                                        wp_register_style('vx:commons.css', $dist . (is_rtl() ? 'commons-rtl.css' : 'commons.css'), ['vx:fse-commons.css'], $version);
                                    }

                                    // Enqueue required Voxel CSS
                                    if (!wp_style_is('vx:commons.css', 'enqueued')) wp_enqueue_style('vx:commons.css');
                                }, 100);
                            }
                        }

                        wp_register_script(
                                $view_script_handle,
                                $view_script_url,
                                $view_script_deps,
                                filemtime($view_script_path),
                                true // Load in footer
                        );

                        // Localize REST API settings for React hydration blocks
                        // Plan C+ blocks use native fetch() and need REST URL + nonce
                        if (in_array($block_name, $react_hydration_blocks, true)) {
                            wp_localize_script(
                                    $view_script_handle,
                                    'wpApiSettings',
                                    array(
                                            'root' => esc_url_raw(rest_url()),
                                            'nonce' => wp_create_nonce('wp_rest')
                                    )
                            );

                            // Note: Timeline CSS dependencies (vx:social-feed.css) are now handled
                            // via style deps when processing frontend.css (see style handling section below)
                        }

                        // CRITICAL: Localize voxelFseCreatePost for create-post block
                        // This provides ajaxUrl for Voxel's custom AJAX system (/?vx=1&action=...)
                        // and i18n strings for the frontend form
                        if ($block_name === 'create-post') {
                            wp_localize_script(
                                    $view_script_handle,
                                    'voxelFseCreatePost',
                                    array(
                                            'ajaxUrl' => add_query_arg('vx', 1, home_url('/')),
                                            'isAdminMode' => false,
                                            'isAdminMetabox' => false,
                                            'postStatus' => null, // Will be set per-post in frontend.tsx via vxconfig
                                            'i18n' => array(
                                                    'required' => __('This field is required', 'voxel-fse'),
                                                    'uploading' => __('Uploading...', 'voxel-fse'),
                                                    'processing' => __('Processing...', 'voxel-fse'),
                                                    'success' => __('Success!', 'voxel-fse'),
                                                    'error' => __('An error occurred', 'voxel-fse'),
                                            ),
                                    )
                            );
                        }

                        $block_metadata['view_script'] = $view_script_handle;
                    }
                }

                // Handle frontend style from source (for frontend CSS)
                if (isset($block_metadata['style']) && strpos($block_metadata['style'], 'file:') === 0) {
                    $style_file = str_replace('file:./', '', $block_metadata['style']);
                    $style_path = $block_dir . '/' . $style_file;

                    if (file_exists($style_path)) {
                        $style_handle = 'mw-block-' . $block_name . '-style';
                        $style_url = get_stylesheet_directory_uri() . '/app/blocks/src/' . $block_name . '/' . $style_file;

                        // Determine dependencies based on block type
                        $style_deps = [];
                        if ($block_name === 'create-post') {
                            self::ensure_voxel_styles_registered();
                            $style_deps = [
                                    'vx:commons.css',
                                    'vx:forms.css',
                                    'vx:create-post.css',
                                    'vx:popup-kit.css',
                                    'vx:product-form.css',
                                    'pikaday'
                            ];
                        } elseif ($block_name === 'popup-kit') {
                            self::ensure_voxel_styles_registered();
                            $style_deps = [
                                    'vx:commons.css',
                                    'vx:forms.css',
                                    'vx:popup-kit.css',
                                    'pikaday',
                                    'nouislider'
                            ];
                        } elseif ($block_name === 'search-form') {
                            // Search form needs Voxel form/popup styles for consistent rendering
                            self::ensure_voxel_styles_registered();
                            $style_deps = [
                                    'vx:commons.css',
                                    'vx:forms.css',
                                    'vx:popup-kit.css'
                            ];
                        } elseif ($block_name === 'timeline') {
                            // Timeline needs Voxel social feed CSS for matching parent theme styles
                            self::ensure_voxel_styles_registered();
                            $style_deps = [
                                    'vx:commons.css',
                                    'vx:forms.css',
                                    'vx:social-feed.css'
                            ];
                        } elseif ($block_name === 'timeline-kit') {
                            // Timeline-kit needs Voxel social feed CSS for matching parent theme styles
                            // social-feed.css MUST load last to override commons.css generic styles
                            self::ensure_voxel_styles_registered();
                            $style_deps = [
                                    'vx:commons.css',
                                    'vx:forms.css',
                                    'vx:social-feed.css'
                            ];
                        } elseif ($block_name === 'work-hours') {
                            // Work-hours needs Voxel work-hours CSS from parent theme
                            self::ensure_voxel_styles_registered();
                            $style_deps = [
                                    'vx:commons.css',
                                    'vx:work-hours.css'
                            ];
                        }

                        wp_register_style(
                                $style_handle,
                                $style_url,
                                $style_deps,
                                filemtime($style_path)
                        );

                        // Set the style handle in block metadata
                        // WordPress will automatically enqueue it when the block is rendered
                        $block_metadata['style'] = $style_handle;

                        // Also enqueue in block editor for preview to match frontend
                        add_action('enqueue_block_editor_assets', function () use ($style_handle, $style_deps) {
                            foreach ($style_deps as $dep) {
                                if (wp_style_is($dep, 'registered') && !wp_style_is($dep, 'enqueued')) {
                                    wp_enqueue_style($dep);
                                }
                            }
                            wp_enqueue_style($style_handle);
                        }, 25); // Priority 25 to load after editorStyle (priority 20)
                    }
                }

                // Remove file: references that have been processed
                unset($block_metadata['editorScript']);
                // Note: 'style' is now replaced with handle, not unset
                if (isset($block_metadata['style']) && strpos($block_metadata['style'], 'file:') === 0) {
                    unset($block_metadata['style']);
                }
                unset($block_metadata['editorStyle']);
                unset($block_metadata['viewScript']);

                // Handle render callback
                // Note: render.php files use 'return' statements, not 'echo'
                // So we capture the return value from include, not output buffer
                if (isset($block_metadata['render']) && strpos($block_metadata['render'], 'file:') === 0) {
                    $render_file = str_replace('file:', '', $block_metadata['render']);
                    $render_path = $block_dir . '/' . $render_file;

                    if (file_exists($render_path)) {
                        $block_metadata['render_callback'] = function ($attributes, $content, $block) use ($render_path) {
                            // Include returns the value from render.php's return statement
                            $result = include $render_path;
                            // If result is a string, return it; otherwise return empty
                            return is_string($result) ? $result : '';
                        };
                        unset($block_metadata['render']);
                    }
                }

                // Add our custom editor script
                $block_metadata['editor_script'] = $script_handle;

                // Register the block
                if (isset($block_metadata['name'])) {
                    register_block_type($block_metadata['name'], $block_metadata);
                }
            }

            return;
        }

        // Fallback: check for manifest-based build
        if (self::$vite_loader) {
            // Load manifest directly to bypass Vite_Loader's dev server detection
            // Vite outputs manifest.json in the .vite/ subdirectory
            $manifest_path = get_stylesheet_directory() . '/assets/dist/.vite/manifest.json';
            if (!file_exists($manifest_path)) {
                // No manifest and no built files - register from block.json
                register_block_type($block_dir);
                return;
            }

            $manifest = json_decode(file_get_contents($manifest_path), true);

            // Try both entry key formats
            $entry_key = null;
            $asset_data = null;

            if (isset($manifest[$entry_key_vite_config])) {
                $entry_key = $entry_key_vite_config;
                $asset_data = $manifest[$entry_key];
            } elseif (isset($manifest[$entry_key_blocks_config])) {
                $entry_key = $entry_key_blocks_config;
                $asset_data = $manifest[$entry_key];
            }

            if (!$asset_data) {
                // Fallback to block.json if entry not in manifest
                register_block_type($block_dir);
                return;
            }

            // Build production URL
            $asset_path = $asset_data['file'] ?? null;
            if (!$asset_path) {
                register_block_type($block_dir);
                return;
            }

            $asset_url = defined('MWFSE_URL')
                    ? MWFSE_URL . '/assets/dist/' . $asset_path
                    : get_stylesheet_directory_uri() . '/assets/dist/' . $asset_path;

            if ($asset_url) {
                // Register custom script with built asset
                $script_handle = 'mw-block-' . $block_name;

                // Use manifest file modification time as version for cache busting
                $version = defined('MWFSE_VERSION') ? MWFSE_VERSION : filemtime($manifest_path);

                // Base dependencies for all blocks
                $script_deps = ['wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n'];

                // Add nouislider dependency for search-form block (uses range slider filter)
                if ($block_name === 'search-form') {
                    $script_deps[] = 'nouislider';
                }

                wp_register_script(
                        $script_handle,
                        $asset_url,
                        $script_deps,
                        $version,
                        true
                );

                // Add type="module" attribute for ES module format
                self::mark_script_as_module($script_handle);

                // Enqueue CSS for this entry and its imports
                self::enqueue_manifest_css($entry_key, $block_name, $version);

                // Use merged $block_config (includes voxel tab attributes like visibility rules)
                // instead of re-reading block.json which would lose merged attributes
                $block_metadata = $block_config;

                // Remove script/style entries that reference source files
                // CSS is handled by enqueue_manifest_css() from Vite build
                unset($block_metadata['editorScript']);
                unset($block_metadata['style']);
                unset($block_metadata['editorStyle']);

                // Convert render file: reference to a callback
                if (isset($block_metadata['render']) && strpos($block_metadata['render'], 'file:') === 0) {
                    $render_file = str_replace('file:', '', $block_metadata['render']);
                    $render_path = $block_dir . '/' . $render_file;

                    // Create a render callback that includes the file
                    // Note: render.php files use 'return' statements, not 'echo'
                    // So we capture the return value from include, not output buffer
                    if (file_exists($render_path)) {
                        $block_metadata['render_callback'] = function ($attributes, $content, $block) use ($render_path) {
                            // Include returns the value from render.php's return statement
                            $result = include $render_path;
                            // If result is a string, return it; otherwise return empty
                            return is_string($result) ? $result : '';
                        };
                        unset($block_metadata['render']);
                    }
                }

                // Add our custom editor script handle
                $block_metadata['editor_script'] = $script_handle;

                // Register block type by name with fully processed metadata
                // Do NOT pass directory - that would cause WordPress to re-read block.json
                if (isset($block_metadata['name'])) {
                    register_block_type($block_metadata['name'], $block_metadata);
                }
            } else {
                // Fallback: register normally if asset not found in manifest
                register_block_type($block_dir);
            }
        } else {
            // No vite loader, fallback to block.json
            register_block_type($block_dir);
        }
    }

    /**
     * Register block from PHP class (legacy fallback)
     *
     * @param string $block_dir Block directory path.
     * @param string $block_name Block name.
     */
    private static function register_block_from_class($block_dir, $block_name)
    {
        $class_file = $block_dir . '/' . ucfirst(str_replace('-', '_', $block_name)) . '_Block.php';

        if (file_exists($class_file)) {
            require_once $class_file;

            $class_name = '\\VoxelFSE\\Blocks\\Src\\' . ucfirst(str_replace('-', '_', $block_name)) . '_Block';

            if (class_exists($class_name)) {
                $block = new $class_name();
                self::$blocks[$block_name] = $block;
            }
        }
    }

    /**
     * Enqueue CSS from manifest for a given entry and its imports
     *
     * @param string $entry_key Manifest entry key.
     * @param string $block_name Block name for handle prefix.
     * @param string|int $version Version for cache busting.
     */
    private static function enqueue_manifest_css($entry_key, $block_name, $version)
    {
        if (!self::$vite_loader) {
            return;
        }

        // Get manifest
        // Vite outputs manifest.json in the outDir root, not in .vite/ subdirectory
        $manifest_path = get_stylesheet_directory() . '/assets/dist/.vite/manifest.json';
        if (!file_exists($manifest_path)) {
            return;
        }

        $manifest = json_decode(file_get_contents($manifest_path), true);
        if (!$manifest || !isset($manifest[$entry_key])) {
            return;
        }

        $entry = $manifest[$entry_key];
        $css_files = [];

        // Collect CSS from entry
        if (isset($entry['css']) && is_array($entry['css'])) {
            $css_files = array_merge($css_files, $entry['css']);
        }

        // Collect CSS from imports
        if (isset($entry['imports']) && is_array($entry['imports'])) {
            foreach ($entry['imports'] as $import_key) {
                if (isset($manifest[$import_key]['css']) && is_array($manifest[$import_key]['css'])) {
                    $css_files = array_merge($css_files, $manifest[$import_key]['css']);
                }
            }
        }

        // Enqueue each CSS file
        foreach (array_unique($css_files) as $index => $css_file) {
            // Skip withDynamicTags and dynamic-heading-example CSS - they override Voxel theme classes
            // The React versions inherit Voxel theme classes and work fine without these CSS files
            if (strpos($css_file, 'withDynamicTags') !== false || strpos($css_file, 'dynamic-heading-example') !== false) {
                continue;
            }

            $css_handle = 'mw-block-' . $block_name . '-css-' . $index;
            $css_url = defined('MWFSE_URL')
                    ? MWFSE_URL . '/assets/dist/' . $css_file
                    : get_stylesheet_directory_uri() . '/assets/dist/' . $css_file;

            wp_enqueue_style(
                    $css_handle,
                    $css_url,
                    [],
                    $version
            );
        }
    }

    /**
     * Enqueue Vite client for HMR
     */
    public static function enqueue_vite_client()
    {
        wp_enqueue_script(
                'vite-client',
                'http://localhost:3000/@vite/client',
                [],
                null,
                false
        );

        // Add type="module" attribute
        // Add type="module" attribute
        self::mark_script_as_module('vite-client');
    }

    /**
     * Get registered block instance
     *
     * @param string $block_name Block name.
     * @return object|null Block instance or null if not found.
     */
    public static function get_block($block_name)
    {
        return self::$blocks[$block_name] ?? null;
    }

    /**
     * Get all registered blocks
     *
     * @return array
     */
    public static function get_all_blocks()
    {
        return self::$blocks;
    }

    /**
     * Apply Voxel Tab features (Visibility, Loop, VoxelScript, Styles) to block content
     *
     * This is the "Global Abstraction" that makes Voxel Tab features work
     * for all blocks in the voxel-fse/* namespace without manual render.php files.
     *
     * Features handled:
     * - Visibility Rules (show/hide based on conditions)
     * - Loop Element (repeat block for each item in data source)
     * - VoxelScript (dynamic tags like @post(title))
     * - Sticky Position CSS (from VoxelTab)
     * - Advanced Tab CSS (margin, padding, border, background, transform, etc.)
     * - Responsive Hide Classes
     * - Custom Attributes
     *
     * @param string $block_content The block content.
     * @param array $block The full block, including name and attributes.
     * @return string Modified block content.
     */
    public static function apply_voxel_tab_features($block_content, $block)
    {
        // 1. Target only our blocks
        if (!isset($block['blockName']) || strpos($block['blockName'], 'voxel-fse/') !== 0) {
            return $block_content;
        }

        // Avoid double processing for blocks that still have manual render.php logic
        // We detect this by checking if MW_VOXEL_TAB_PROCESSED constant/global is set by render.php
        // but it's cleaner to just assume blocks will be migrated or the filter handles the output.
        // Actually, if a block has render.php, it returns a string. We then process that string here.
        // If the render.php already did visibility hide (returned empty), we just return empty.

        if (empty($block_content) && empty($block['attrs'])) {
             return $block_content;
        }

        $attributes = $block['attrs'] ?? [];

        // 2. Evaluate Visibility Rules
        if (isset($attributes['visibilityRules']) || isset($attributes['visibilityBehavior'])) {
            require_once __DIR__ . '/shared/visibility-evaluator.php';
            $rules = $attributes['visibilityRules'] ?? [];
            $behavior = $attributes['visibilityBehavior'] ?? 'show';

            if (!Visibility_Evaluator::evaluate($rules, $behavior)) {
                return '';
            }
        }

        // 3. Handle Loop Element
        if (!empty($attributes['loopEnabled']) && !empty($attributes['loopSource'])) {
            require_once __DIR__ . '/shared/loop-processor.php';
            // We need the raw inner content if it's a dynamic block,
            // but for static blocks, $block_content is the saved HTML.
            // Loop_Processor::render_looped will re-run Voxel\render() on the content.
            return Loop_Processor::render_looped($attributes, $block_content);
        }

        // 4. Apply Styles (Sticky, Advanced Tab CSS, Visibility Classes)
        $block_content = self::apply_block_styles($block_content, $attributes);

        // 5. Final step: Process Voxel dynamic tags (VoxelScript)
        // This ensures tags like @post(title) work inside static blocks.
        if (function_exists('\Voxel\render')) {
            return \Voxel\render($block_content);
        }

        return $block_content;
    }

    /**
     * Apply generated styles to block content
     *
     * Injects inline styles, responsive CSS, visibility classes, and custom attributes
     * into the block's root element.
     *
     * @param string $block_content The block HTML content.
     * @param array  $attributes    Block attributes.
     * @return string Modified block content with styles applied.
     */
    private static function apply_block_styles($block_content, $attributes)
    {
        // Check if we have any style-related attributes to process
        if (!self::has_style_attributes($attributes)) {
            return $block_content;
        }

        // Get block ID - required for unique selector
        $block_id = $attributes['blockId'] ?? null;
        if (empty($block_id)) {
            return $block_content;
        }

        // Load style generator
        require_once __DIR__ . '/shared/style-generator.php';

        // Generate all styles
        $styles = Style_Generator::generate_all($attributes, $block_id);

        // If no styles or classes to apply, return original content
        if (
            empty($styles['inline_styles']) &&
            empty($styles['responsive_css']) &&
            empty($styles['classes']) &&
            empty($styles['custom_attrs']) &&
            empty($styles['element_id'])
        ) {
            return $block_content;
        }

        // Find the root element and inject styles
        $block_content = self::inject_styles_into_html(
            $block_content,
            $block_id,
            $styles['inline_styles'],
            $styles['classes'],
            $styles['custom_attrs'],
            $styles['element_id'] ?? ''
        );

        // Prepend responsive CSS as a style tag
        if (!empty($styles['responsive_css'])) {
            $style_tag = '<style>' . $styles['responsive_css'] . '</style>';
            $block_content = $style_tag . $block_content;
        }

        return $block_content;
    }

    /**
     * Check if attributes contain any style-related values
     *
     * @param array $attributes Block attributes.
     * @return bool
     */
    private static function has_style_attributes($attributes)
    {
        // Voxel Tab style attributes
        $voxel_attrs = [
            'stickyEnabled',
            'enableInlineFlex', 'enableCalcMinHeight', 'enableCalcMaxHeight',
            'scrollbarColor', 'enableBackdropBlur',
        ];

        // Advanced Tab style attributes
        $advanced_attrs = [
            'blockMargin', 'blockPadding', 'position', 'zIndex', 'elementWidth',
            'overflow', 'opacity', 'borderType', 'borderColor', 'borderWidth',
            'borderRadius', 'borderRadiusDimensions', 'boxShadow',
            'backgroundType', 'backgroundColor', 'backgroundImage', 'gradientColor',
            'transformRotateZ', 'transformOffsetX', 'transformScaleX', 'maskSwitch',
            'hideDesktop', 'hideTablet', 'hideMobile', 'customClasses', 'customCSS',
            'customAttributes', 'borderTypeHover', 'backgroundColorHover',
            'elementId', 'flexAlignSelf', 'flexOrder',
        ];

        foreach (array_merge($voxel_attrs, $advanced_attrs) as $attr) {
            if (!empty($attributes[$attr])) {
                return true;
            }
        }

        return false;
    }

    /**
     * Inject styles into HTML root element
     *
     * @param string $html          Block HTML.
     * @param string $block_id      Block unique ID.
     * @param string $inline_styles Inline style string.
     * @param array  $classes       Additional CSS classes.
     * @param array  $custom_attrs  Custom HTML attributes.
     * @param string $element_id    Custom element ID from AdvancedTab.
     * @return string Modified HTML.
     */
    private static function inject_styles_into_html($html, $block_id, $inline_styles, $classes, $custom_attrs, $element_id = '')
    {
        // Use DOMDocument for reliable HTML manipulation
        if (empty(trim($html))) {
            return $html;
        }

        // Find the first opening tag
        $pattern = '/^(\s*<[a-z][a-z0-9]*)((?:\s+[^>]*)?)(>)/is';

        if (!preg_match($pattern, $html, $matches, PREG_OFFSET_CAPTURE)) {
            return $html;
        }

        $tag_start = $matches[1][0];    // e.g., "<div"
        $existing_attrs = $matches[2][0]; // e.g., ' class="foo" style="bar"'
        $tag_end = $matches[3][0];       // ">"
        $full_match_length = strlen($matches[0][0]);

        // Build new attributes
        $new_attrs = $existing_attrs;

        // Add element ID if specified (from AdvancedTab)
        if (!empty($element_id)) {
            // Only add if id doesn't already exist
            if (!preg_match('/\sid\s*=/', $new_attrs)) {
                $new_attrs .= ' id="' . esc_attr($element_id) . '"';
            }
        }

        // Add unique block class for selector targeting
        $block_class = 'voxel-fse-block-' . $block_id;
        $all_classes = array_merge([$block_class], $classes);
        $class_string = implode(' ', array_filter($all_classes));

        // Merge with existing class attribute
        if (preg_match('/\sclass\s*=\s*["\']([^"\']*)["\']/', $new_attrs, $class_match)) {
            $existing_classes = $class_match[1];
            $merged_classes = $existing_classes . ' ' . $class_string;
            $new_attrs = preg_replace('/\sclass\s*=\s*["\'][^"\']*["\']/', ' class="' . esc_attr(trim($merged_classes)) . '"', $new_attrs);
        } else {
            $new_attrs .= ' class="' . esc_attr($class_string) . '"';
        }

        // Merge with existing style attribute
        if (!empty($inline_styles)) {
            if (preg_match('/\sstyle\s*=\s*["\']([^"\']*)["\']/', $new_attrs, $style_match)) {
                $existing_styles = rtrim($style_match[1], '; ');
                $merged_styles = $existing_styles . '; ' . $inline_styles;
                $new_attrs = preg_replace('/\sstyle\s*=\s*["\'][^"\']*["\']/', ' style="' . esc_attr($merged_styles) . '"', $new_attrs);
            } else {
                $new_attrs .= ' style="' . esc_attr($inline_styles) . '"';
            }
        }

        // Add custom attributes
        foreach ($custom_attrs as $attr_name => $attr_value) {
            // Check if attribute already exists
            if (!preg_match('/\s' . preg_quote($attr_name, '/') . '\s*=/', $new_attrs)) {
                if ($attr_value === '') {
                    $new_attrs .= ' ' . esc_attr($attr_name);
                } else {
                    $new_attrs .= ' ' . esc_attr($attr_name) . '="' . esc_attr($attr_value) . '"';
                }
            }
        }

        // Rebuild the HTML
        $new_tag = $tag_start . $new_attrs . $tag_end;
        return $new_tag . substr($html, $full_match_length);
    }

    /**
     * Check if block is registered
     *
     * @param string $block_name Block name.
     * @return bool
     */
    public static function has_block($block_name)
    {
        return isset(self::$blocks[$block_name]);
    }

    /**
     * Register REST API endpoints for blocks
     *
     * Auto-loads *_REST.php files from block directories.
     */
    public static function register_rest_endpoints()
    {
        $blocks_dir = get_stylesheet_directory() . '/app/blocks/src';

        if (!is_dir($blocks_dir)) {
            return;
        }

        $block_dirs = glob($blocks_dir . '/*', GLOB_ONLYDIR);

        foreach ($block_dirs as $block_dir) {
            // Look for *_REST.php files in the block directory
            $rest_files = glob($block_dir . '/*_REST.php');

            foreach ($rest_files as $rest_file) {
                require_once $rest_file;

                // Extract class name from file name
                // e.g., Product_Price_REST.php -> Product_Price_REST
                $class_name = basename($rest_file, '.php');
                $full_class_name = '\\VoxelFSE\\Blocks\\' . $class_name;

                if (class_exists($full_class_name)) {
                    $rest_instance = new $full_class_name();
                    if (method_exists($rest_instance, 'register_routes')) {
                        $rest_instance->register_routes();
                    }
                }
            }
        }
    }

    /**
     * Enqueue popup-kit global styles
     * 
     * Extracts CSS from popup-kit block in kit_popups template
     * and enqueues it globally on all pages
     */
    public static function enqueue_popup_kit_global_styles() {
        // NOTE: Voxel forms.css is loaded via add_editor_style() in add_editor_styles_for_fse()
        // Do NOT enqueue it here via wp_enqueue_style() - causes duplicates and breaks CSS cascade
        
        // Get kit_popups template ID
        $template_id = \Voxel\get('templates.kit_popups');
        if (!$template_id) {
            return;
        }
        
        // Get template content
        $post = get_post($template_id);
        if (!$post) {
            return;
        }
        
        // Extract <style> tags with data-voxel-popup-kit-styles attribute
        preg_match_all(
            '/<style[^>]*data-voxel-popup-kit-styles[^>]*>(.*?)<\/style>/s',
            $post->post_content,
            $matches
        );
        
        if (empty($matches[1])) {
            return;
        }
        
        // Combine all CSS
        $css = implode("\n", $matches[1]);
        
        // Enqueue inline
        // Attach to vx:commons.css which is always loaded
        if (wp_style_is('vx:commons.css', 'registered')) {
            wp_add_inline_style('vx:commons.css', $css);
        }
    }
}

// Don't auto-initialize - let functions.php control when this loads
