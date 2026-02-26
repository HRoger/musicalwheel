<?php
declare(strict_types=1);

/**
 * Voxel FSE Child Theme
 *
 * Full Site Editing child theme for Voxel with custom blocks and DynamicTagBuilder.
 *
 * @package VoxelFSE
 * @since 1.0.0
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Theme constants
 */
define('VOXEL_FSE_VERSION', '1.0.1.' . time()); // Add timestamp to force cache invalidation
define('VOXEL_FSE_PATH', get_stylesheet_directory());
define('VOXEL_FSE_URL', get_stylesheet_directory_uri());



/**
 * Load utility classes
 */
require_once VOXEL_FSE_PATH . '/app/utils/class-vite-loader.php';
require_once VOXEL_FSE_PATH . '/app/utils/class-vite-asset-loader.php';
require_once VOXEL_FSE_PATH . '/app/utils/theme-detector.php';
require_once VOXEL_FSE_PATH . '/app/utils/admin-metabox.php';
require_once VOXEL_FSE_PATH . '/app/utils/fse-template-editor.php';
require_once VOXEL_FSE_PATH . '/app/utils/icon-processor.php';
// Note: fse-popup-menu-walker.php is loaded on demand (extends Voxel's Popup_Menu_Walker)


/**
 * Load block system
 */
require_once VOXEL_FSE_PATH . '/app/blocks/Base_Block.php';
require_once VOXEL_FSE_PATH . '/app/blocks/Block_Loader.php';

// Initialize block loader
new \VoxelFSE\Blocks\Block_Loader();

/**
 * Enqueue parent and child theme styles
 */
function voxel_fse_enqueue_styles()
{
    // Enqueue parent theme styles
    wp_enqueue_style(
            'voxel-parent-style',
            get_template_directory_uri() . '/style.css',
            array(),
            wp_get_theme()->parent()->get('Version')
    );

    // Enqueue child theme styles
    wp_enqueue_style(
            'voxel-fse-style',
            get_stylesheet_uri(),
            array('voxel-parent-style'),
            VOXEL_FSE_VERSION
    );

    // Enqueue responsive visibility classes (for AdvancedTab hide on desktop/tablet/mobile)
    wp_enqueue_style(
            'voxel-fse-responsive-visibility',
            VOXEL_FSE_URL . '/assets/css/responsive-visibility.css',
            array(),
            VOXEL_FSE_VERSION
    );

    // Enqueue WordPress REST API support for frontend blocks
    // This makes wpApiSettings (including nonce) available to JavaScript
    wp_enqueue_script('wp-api-request');
}


add_action('wp_enqueue_scripts', 'voxel_fse_enqueue_styles');

/**
 * Enqueue frontend user data for dynamic blocks
 */
function voxel_fse_enqueue_frontend_user_data() {
    $user = \Voxel\current_user();
    $userData = [
        'isLoggedIn' => is_user_logged_in(),
    ];

    if ( is_user_logged_in() && $user ) {
        $userData['avatarUrl'] = $user->get_avatar_url();
        $userData['avatarMarkup'] = $user->get_avatar_markup();
        $userData['displayName'] = $user->get_display_name();
        $userData['id'] = $user->get_id();
    } else {
        $userData['avatarUrl'] = '';
        $userData['avatarMarkup'] = '';
        $userData['displayName'] = '';
        $userData['id'] = 0;
    }

    $script = 'window.VoxelFSEUser = ' . wp_json_encode( $userData ) . ';';
    wp_add_inline_script( 'wp-api-request', $script, 'before' );
}
add_action('wp_enqueue_scripts', 'voxel_fse_enqueue_frontend_user_data', 20);

/**
 * Define MWFSE_PATH for backward compatibility with Phase 1 code
 */
if (!defined('MWFSE_PATH')) {
    define('MWFSE_PATH', VOXEL_FSE_PATH);
}
if (!defined('MWFSE_URL')) {
    define('MWFSE_URL', VOXEL_FSE_URL);
}
if (!defined('MWFSE_VERSION')) {
    define('MWFSE_VERSION', VOXEL_FSE_VERSION);
}

/**
 * Load DynamicTagBuilder system (Phase 1) - VoxelScript parser + renderer
 */
require_once VOXEL_FSE_PATH . '/app/dynamic-data/loader.php';

/**
 * Load Post Types system
 */
require_once VOXEL_FSE_PATH . '/app/post-types/class-mw-post-type-repository.php';
require_once VOXEL_FSE_PATH . '/app/post-types/class-mw-post-type.php';


/**
 * Load FSE Base Controller
 */
require_once VOXEL_FSE_PATH . '/app/controllers/fse-base-controller.php';

/**
 * Load FSE Compatibility Controller
 * Enqueues compatibility shims for Voxel parent theme integration
 * CRITICAL: Must load early to patch Vue mixins before components are created
 *
 * Patches Voxel.mixins.base to prevent "Cannot read properties of null (reading 'dataset')"
 * errors when Vue components try to find Elementor parent elements.
 *
 * IMPORTANT: This is needed on BOTH frontend and editor because:
 * - Frontend: Our React blocks trigger 'voxel:static-popups' which calls render_static_popups()
 * - Editor: Gutenberg uses React, not Vue, so Vue components fail without the shim
 */
require_once VOXEL_FSE_PATH . '/app/controllers/fse-compatibility-controller.php';
new \VoxelFSE\Controllers\FSE_Compatibility_Controller();

/**
 * Load FSE Templates controller (follows Voxel pattern)
 */
require_once VOXEL_FSE_PATH . '/app/controllers/fse-templates/templates-controller.php';

// Initialize FSE Templates controller
new \VoxelFSE\Controllers\FSE_Templates\Templates_Controller();

/**
 * Load Create Post Submission controller
 * Handles form submission hooks for the Create Post FSE block
 */
require_once VOXEL_FSE_PATH . '/app/controllers/create-post-submission-controller.php';

// Initialize Create Post Submission controller
new \VoxelFSE\Controllers\Create_Post_Submission_Controller();

/**
 * Load Create Post Page controller
 * Ensures create-{post-type} form pages exist with correct slug
 */
require_once VOXEL_FSE_PATH . '/app/controllers/create-post-page-controller.php';

// Initialize Create Post Page controller
new \VoxelFSE\Controllers\Create_Post_Page_Controller();

/**
 * Load REST API controller
 * Provides REST endpoints for Gutenberg blocks to fetch dynamic data
 */
require_once VOXEL_FSE_PATH . '/app/controllers/rest-api-controller.php';

// Initialize REST API controller
new \VoxelFSE\Controllers\REST_API_Controller();

/**
 * Load Search Form Block controller
 * Provides REST endpoints for the Search Form FSE block
 */
require_once VOXEL_FSE_PATH . '/app/controllers/fse-search-form-controller.php';

// Initialize Search Form controller
new \VoxelFSE\Controllers\FSE_Search_Form_Controller();

/**
 * Load Create Post Block controller
 * Provides REST endpoints for the Create Post FSE block
 */
require_once VOXEL_FSE_PATH . '/app/controllers/fse-create-post-controller.php';

// Initialize Create Post controller
new \VoxelFSE\Controllers\FSE_Create_Post_Controller();

/**
 * Load FSE Taxonomy Icon Picker controller
 * Provides React-based icon picker for taxonomy/category admin pages
 */
require_once VOXEL_FSE_PATH . '/app/controllers/fse-taxonomy-icon-picker-controller.php';

// Initialize FSE Taxonomy Icon Picker controller
new \VoxelFSE\Controllers\FSE_Taxonomy_Icon_Picker_Controller();

/**
 * Load FSE Timeline API Controller
 * Provides REST API endpoints for the Timeline block (Plan C+ architecture)
 */
require_once VOXEL_FSE_PATH . '/app/controllers/fse-timeline-api-controller.php';

// Initialize FSE Timeline API controller
new \VoxelFSE\Controllers\FSE_Timeline_API_Controller();

/**
 * Load FSE Term Feed Controller
 * Provides REST API endpoints for the Term Feed block (Plan C+ architecture)
 */
require_once VOXEL_FSE_PATH . '/app/controllers/fse-term-feed-controller.php';

// Initialize FSE Term Feed controller
new \VoxelFSE\Controllers\FSE_Term_Feed_Controller();

/**
 * Load FSE Post Feed Controller
 * Provides REST API endpoints for the Post Feed block (Plan C+ architecture)
 * - Card templates per post type
 * - Post search for manual selection
 */
require_once VOXEL_FSE_PATH . '/app/controllers/fse-post-feed-controller.php';

// Initialize FSE Post Feed controller
new \VoxelFSE\Controllers\FSE_Post_Feed_Controller();

/**
 * Load FSE Navbar API Controller
 * Provides REST API endpoints for the Navbar block (Plan C+ architecture)
 */
require_once VOXEL_FSE_PATH . '/app/controllers/fse-navbar-api-controller.php';

// Initialize FSE Navbar API controller
new \VoxelFSE\Controllers\FSE_Navbar_API_Controller();

/**
 * Load FSE Cart API Controller
 * Provides REST API endpoints for the Cart Summary block (Plan C+ architecture)
 */
require_once VOXEL_FSE_PATH . '/app/controllers/fse-cart-api-controller.php';

// Initialize FSE Cart API controller
new \VoxelFSE\Controllers\FSE_Cart_API_Controller();

/**
 * Load FSE Advanced List API Controller
 * Provides REST API endpoints for the Advanced List block (Plan C+ architecture)
 */
require_once VOXEL_FSE_PATH . '/app/controllers/fse-advanced-list-api-controller.php';

// Initialize FSE Advanced List API controller
new \VoxelFSE\Controllers\FSE_Advanced_List_API_Controller();

/**
 * Load FSE Work Hours API Controller
 * Provides REST API endpoints for the Work Hours block (Plan C+ architecture)
 */
require_once VOXEL_FSE_PATH . '/app/controllers/fse-work-hours-api-controller.php';

// Initialize FSE Work Hours API controller
new \VoxelFSE\Controllers\FSE_Work_Hours_API_Controller();

/**
 * Load FSE Messages API Controller
 * Provides REST API endpoints for the Messages block (Plan C+ architecture)
 */
require_once VOXEL_FSE_PATH . '/app/controllers/fse-messages-api-controller.php';

// Initialize FSE Messages API controller
new \VoxelFSE\Controllers\FSE_Messages_API_Controller();

/**
 * Load FSE Userbar API Controller
 * Provides REST API endpoints and server-side config injection for the Userbar block
 * - Nonces for notifications, messages, cart AJAX actions
 * - Initial unread counts (notifications, messages)
 * - Cart empty state
 * - User data (avatar, display name)
 */
require_once VOXEL_FSE_PATH . '/app/controllers/fse-userbar-api-controller.php';

// Initialize FSE Userbar API controller
new \VoxelFSE\Controllers\FSE_Userbar_API_Controller();

/**
 * Load FSE Orders API Controller
 * Provides REST API endpoints for the Orders block (Plan C+ architecture)
 */
require_once VOXEL_FSE_PATH . '/app/controllers/fse-orders-api-controller.php';

// Initialize FSE Orders API controller
new \VoxelFSE\Controllers\FSE_Orders_API_Controller();

/**
 * Load FSE Map API Controller
 * Provides REST API endpoints for the Map block (Plan C+ architecture)
 * - Post location for current-post mode
 * - Marker templates for search-form mode
 */
require_once VOXEL_FSE_PATH . '/app/controllers/fse-map-api-controller.php';

// Initialize FSE Map API controller
new \VoxelFSE\Controllers\FSE_Map_API_Controller();

/**
 * Load FSE Product Form API Controller
 * Provides REST API endpoints for the Product Form block (Plan C+ architecture)
 * - Product configuration with proper Voxel parity
 * - Cart operations with nonces
 * - Search context config for URL param mapping
 */
require_once VOXEL_FSE_PATH . '/app/controllers/fse-product-form-api-controller.php';

// Initialize FSE Product Form API controller
new \VoxelFSE\Controllers\FSE_Product_Form_API_Controller();

/**
 * Load FSE Search Controller
 * Overrides Voxel's Search_Controller to fix undefined array key warnings
 */
require_once VOXEL_FSE_PATH . '/app/controllers/frontend/search/fse-search-controller.php';

// Initialize FSE Search controller
new \VoxelFSE\Controllers\Frontend\Search\FSE_Search_Controller();

/**
 * Load FSE Stripe Account API Controller
 * Provides REST API endpoints for the Stripe Account block (Plan C+ architecture)
 * - Account status (exists, charges_enabled, details_submitted)
 * - Onboard/dashboard links
 * - Shipping zones/rates for vendor shipping
 * - Nonces for AJAX operations
 */
require_once VOXEL_FSE_PATH . '/app/controllers/fse-stripe-account-api-controller.php';

// Initialize FSE Stripe Account API controller
new \VoxelFSE\Controllers\FSE_Stripe_Account_API_Controller();

/**
 * Load FSE Print Template API Controller
 * Provides REST endpoint for server-side template rendering in editor preview.
 */
require_once VOXEL_FSE_PATH . '/app/controllers/fse-print-template-api-controller.php';

new \VoxelFSE\Controllers\FSE_Print_Template_API_Controller();

/**
 * FSE Loop API Controller
 * Provides REST endpoint for expanding per-item loop configurations in the editor.
 */
require_once VOXEL_FSE_PATH . '/app/controllers/fse-loop-api-controller.php';

new \VoxelFSE\Controllers\FSE_Loop_API_Controller();

/**
 * FSE NectarBlocks Server-Side Rendering Controller
 * Provides server-side HTML for NB blocks (star-rating, icon) that have no render callback.
 * Only active during feed context (do_blocks() calls from feed controllers).
 */
require_once VOXEL_FSE_PATH . '/app/controllers/fse-nb-ssr-controller.php';

new \VoxelFSE\Controllers\FSE_NB_SSR_Controller();

/**
 * FSE NectarBlocks Dynamic Tags Controller
 * Injects Voxel dynamic tag attributes into NB blocks and resolves them on render.
 */
require_once VOXEL_FSE_PATH . '/app/controllers/fse-nb-dynamic-tags-controller.php';

new \VoxelFSE\Controllers\FSE_NB_Dynamic_Tags_Controller();

/**
 * FSE NectarBlocks Voxel Source Controller
 * Registers Voxel fields as a native data source in NB's Dynamic Data dropdown.
 * Simpler fallback alongside the @tags() system for quick field binding.
 */
require_once VOXEL_FSE_PATH . '/app/controllers/fse-nb-voxel-source-controller.php';

new \VoxelFSE\Controllers\FSE_NB_Voxel_Source_Controller();

/**
 * Note: Author and Expiry metaboxes are already handled by Voxel parent theme
 * See: themes/voxel/app/controllers/post-controller.php (lines 14, 17)
 * The parent theme uses Vue.js and already includes these metaboxes for all
 * Voxel-managed post types. No need to duplicate in child theme.
 */

/**
 * Load Courses addon module
 */
require_once VOXEL_FSE_PATH . '/app/modules/courses/courses-addon.php';

/**
 * Register FSE block patterns and templates
 */
function voxel_fse_register_block_patterns()
{
    // Block patterns will be auto-discovered from /patterns directory
    // Custom pattern registration can be added here
}

add_action('init', 'voxel_fse_register_block_patterns');

/**
 * Register custom block categories
 */
function voxel_fse_block_categories($categories)
{
    // Check if 'voxel' category already exists
    $has_voxel = false;
    foreach ($categories as $category) {
        if ($category['slug'] === 'voxel') {
            $has_voxel = true;
            break;
        }
    }

    // Add 'voxel' category if it doesn't exist
    if (!$has_voxel) {
        array_unshift($categories, [
                'slug' => 'voxel',
                'title' => __('Voxel FSE', 'voxel-fse'),
                'icon' => null,
        ]);
    }

    return array_merge(
            array(
                    array(
                            'slug' => 'mw-fse',
                            'title' => __('Voxel FSE', 'voxel-fse'),
                            'icon' => 'music',
                    ),
            ),
            $categories
    );
}

add_filter('block_categories_all', 'voxel_fse_block_categories');

/**
 * Note: Block registration is handled automatically by Block_Loader class (line 39)
 * which auto-discovers all blocks in app/blocks/src/ directory.
 * No manual registration needed here.
 */

/**
 * Localize Voxel post types for block editor
 */
function voxel_fse_localize_voxel_post_types()
{
    $post_types = [];
    if (class_exists('\Voxel\Post_Type')) {
        foreach (\Voxel\Post_Type::get_voxel_types() as $post_type) {
            $post_types[] = [
                    'label' => $post_type->get_label(),
                    'value' => $post_type->get_key(),
            ];
        }
    }

    wp_localize_script(
            'wp-blocks',
            'voxelPostTypes',
            $post_types
    );
}

add_action('enqueue_block_editor_assets', 'voxel_fse_localize_voxel_post_types');

/**
 * Remove Voxel's Elementor metabox from unsupported post types
 * Priority 15 ensures this runs AFTER Voxel's registration (priority 10)
 * but BEFORE our FSE metabox registration (priority 20)
 */
add_action('add_meta_boxes', 'voxel_fse_remove_voxel_metabox_from_unsupported_types', 15, 2);

/**
 * Register FSE admin metabox alongside Voxel's Elementor metabox
 * Priority 20 ensures this runs AFTER Voxel's registration (priority 10)
 *
 * NOTE: We use a UNIQUE ID (voxel_fse_post_fields) and hide Voxel's original metabox via CSS.
 * This approach preserves WordPress's meta box detection for Gutenberg, which is required
 * for the ResizableBox (drag handle between editor and meta-boxes area) to appear.
 */
add_action('add_meta_boxes', 'voxel_fse_add_create_post_metabox', 20);

/**
 * Add theme support for FSE features
 */
function voxel_fse_setup()
{
    // Add support for editor styles
    add_theme_support('editor-styles');

    // Add support for responsive embeds
    add_theme_support('responsive-embeds');

    // Add support for experimental link color
    add_theme_support('experimental-link-color');

    // Add support for custom line height
    add_theme_support('custom-line-height');

    // Add support for custom units
    add_theme_support('custom-units');

    // NOTE: gutenberg-editor-overrides.css is now part of voxel-editor-combined.css
    // loaded via enqueue_block_assets. No longer using add_editor_style() to avoid
    // duplicate loading (add_editor_style inlines into iframe blob HTML).
}

add_action('after_setup_theme', 'voxel_fse_setup');

/**
 * Enqueue block editor assets
 */
function voxel_fse_enqueue_block_editor_assets()
{
    // NOTE: gutenberg-editor-overrides.css and responsive-visibility.css are now
    // bundled into voxel-editor-combined.css (loaded via enqueue_block_assets).
    // Loading them here via enqueue_block_editor_assets caused getCompatibilityStyles()
    // to clone them into the iframe as duplicate <style> tags.

    // Line Awesome: needed on main admin page for icon rendering in sidebar/toolbar.
    // This is intentionally on the main page only (not iframe) — icons are in the
    // WordPress admin UI, not the block content preview.
    wp_enqueue_style(
            'voxel-line-awesome',
            get_template_directory_uri() . '/assets/icons/line-awesome/line-awesome.css',
            array(),
            wp_get_theme()->parent()->get('Version')
    );
}

add_action('enqueue_block_editor_assets', 'voxel_fse_enqueue_block_editor_assets', 999);

/**
 * Enqueue Line Awesome for Voxel admin pages
 */
function voxel_fse_enqueue_admin_assets($hook)
{
    // Only enqueue on Voxel admin pages
    if (strpos($hook, 'voxel') === false && strpos($_GET['page'] ?? '', 'edit-post-type') === false) {
        return;
    }

    // Enqueue Line Awesome from parent Voxel theme
    wp_enqueue_style(
            'voxel-line-awesome',
            get_template_directory_uri() . '/assets/icons/line-awesome/line-awesome.css',
            array(),
            wp_get_theme()->parent()->get('Version')
    );
}

add_action('admin_enqueue_scripts', 'voxel_fse_enqueue_admin_assets');

/**
 * Inject Dynamic Data Store
 *
 * Pre-loads top-level data groups and modifiers on page load for instant modal opening.
 * Matches Voxel's window.Dynamic_Data_Store pattern for <100ms performance.
 */
function voxel_fse_inject_dynamic_data_store()
{
    // Only load in block editor
    if (!is_admin()) {
        return;
    }

    // Determine which namespace to use (project-specific or generic)
    $api_namespace = defined('PROJECT_NAMESPACE') ? PROJECT_NAMESPACE . '/v1' : 'voxel-fse/v1';

    // Fetch top-level groups for all contexts (post, term, user)
    $contexts = array('post', 'term', 'user');
    $groups_by_context = array();
    foreach ($contexts as $ctx) {
        $ctx_request = new WP_REST_Request('GET', "/{$api_namespace}/dynamic-data/groups");
        $ctx_request->set_param('context', $ctx);
        $ctx_response = rest_do_request($ctx_request);
        if (!is_wp_error($ctx_response) && $ctx_response->get_status() === 200) {
            $groups_by_context[$ctx] = $ctx_response->get_data();
        } else {
            $groups_by_context[$ctx] = array();
        }
    }

    // Default groups for backward compatibility (post context)
    $groups_response = rest_do_request(new WP_REST_Request('GET', "/{$api_namespace}/dynamic-data/groups"));
    $modifiers_response = rest_do_request(new WP_REST_Request('GET', "/{$api_namespace}/dynamic-data/modifiers"));

    // Fetch flat tags for instant autocomplete (Voxel pattern)
    $tags_request = new WP_REST_Request('GET', "/{$api_namespace}/dynamic-data/tags-flat");
    $tags_request->set_param('context', 'edit'); // Default context
    $tags_response = rest_do_request($tags_request);

    $groups = array();
    if (!is_wp_error($groups_response) && $groups_response->get_status() === 200) {
        $groups = $groups_response->get_data();
    }

    $modifiers = array();
    if (!is_wp_error($modifiers_response) && $modifiers_response->get_status() === 200) {
        $modifiers = $modifiers_response->get_data();
    }

    $flat_tags = array();
    if (!is_wp_error($tags_response) && $tags_response->get_status() === 200) {
        $flat_tags = $tags_response->get_data();
    }

    // Pre-load children recursively for each group (eliminates tree loading delay)
    $group_children = array();

    $fetch_children_recursive = function ($group_type, $parent = null, $depth = 0, $max_depth = 5) use (&$fetch_children_recursive, &$group_children, $api_namespace) {
        // Stop at max depth to avoid excessive loading
        if ($depth >= $max_depth) {
            return array();
        }

        // Build cache key (matches React format)
        $cache_key = $parent ? "{$group_type}:{$parent}" : $group_type;

        // Check if already cached
        if (isset($group_children[$cache_key])) {
            return $group_children[$cache_key];
        }

        // Fetch children for this level
        $children_request = new WP_REST_Request('GET', "/{$api_namespace}/dynamic-data/groups");
        $children_request->set_param('group', $group_type);
        if ($parent) {
            $children_request->set_param('parent', $parent);
        }
        $children_response = rest_do_request($children_request);

        if (is_wp_error($children_response) || $children_response->get_status() !== 200) {
            $group_children[$cache_key] = array();
            return array();
        }

        $children = $children_response->get_data();
        $group_children[$cache_key] = $children;

        // Recursively fetch children for items that have children
        if (is_array($children)) {
            foreach ($children as $child) {
                if (isset($child['hasChildren']) && $child['hasChildren'] && isset($child['key'])) {
                    // Build the parent path for the next level
                    $next_parent = $parent ? "{$parent}.{$child['key']}" : "{$group_type}.{$child['key']}";
                    $fetch_children_recursive($group_type, $next_parent, $depth + 1, $max_depth);
                }
            }
        }

        return $children;
    };

    // Pre-load children for all groups across all contexts (up to 5 levels deep)
    $all_group_types = array();
    foreach ($groups_by_context as $ctx_groups) {
        if (is_array($ctx_groups)) {
            foreach ($ctx_groups as $group) {
                if (isset($group['type']) && !in_array($group['type'], $all_group_types, true)) {
                    $all_group_types[] = $group['type'];
                }
            }
        }
    }
    foreach ($all_group_types as $group_type) {
        $fetch_children_recursive($group_type, null, 0, 5);
    }

    // Inject into JavaScript global object (Voxel pattern)
    ?>
    <script type="text/javascript">
        window.VoxelFSE_Dynamic_Data_Store = <?php echo wp_json_encode(array(
                'groups' => $groups,
                'groupsByContext' => $groups_by_context,
                'modifiers' => $modifiers,
                'flatTags' => $flat_tags,
                'groupChildren' => $group_children,
        )); ?>;
    </script>
    <?php
}

add_action('admin_head', 'voxel_fse_inject_dynamic_data_store');

/**
 * Prevent Elementor from loading CSS files from the uploads folder
 *
 * Elementor automatically generates post-specific CSS files in wp-content/uploads/elementor/css/
 * which can cause conflicts or unnecessary CSS loading. This function dequeues those files.
 *
 * Evidence: User reported post-5.css loading from uploads folder
 * Pattern: Based on Voxel's template-utils.php:103 wp_dequeue_style pattern
 *
 * @since 1.0.1
 */
function voxel_fse_dequeue_elementor_uploads_css()
{
    // Dequeue specific post CSS (post-5.css reported by user)
    wp_dequeue_style('elementor-post-5');

    // Optionally: Dequeue all Elementor post-specific CSS from uploads
    // This prevents ANY elementor-post-{ID}.css files from loading
    global $wp_styles;
    if (isset($wp_styles->registered)) {
        foreach ($wp_styles->registered as $handle => $style) {
            // Check if it's an Elementor post CSS from uploads folder
            if (strpos($handle, 'elementor-post-') === 0 &&
                isset($style->src) &&
                strpos($style->src, '/uploads/elementor/css/') !== false) {
                wp_dequeue_style($handle);
            }
        }
    }
}

// Hook with priority 100 to run AFTER Elementor enqueues its styles (usually priority 10-20)
add_action('wp_enqueue_scripts', 'voxel_fse_dequeue_elementor_uploads_css', 100);

/**
 * Disable WordPress FSE Global Styles on frontend
 *
 * WordPress FSE outputs global-styles-inline-css which conflicts with Voxel's layout.
 * Voxel handles its own styling, so we don't need WordPress's FSE global styles.
 *
 * @since 1.0.2
 */
function voxel_fse_disable_global_styles()
{
    // Only disable on frontend, not in admin/editor
    if (is_admin()) {
        return;
    }

    // Remove WordPress FSE global styles
    wp_dequeue_style('global-styles');
    wp_deregister_style('global-styles');

    // Also remove the inline CSS that WordPress adds
    remove_action('wp_enqueue_scripts', 'wp_enqueue_global_styles');
    remove_action('wp_footer', 'wp_enqueue_global_styles', 1);
}
add_action('wp_enqueue_scripts', 'voxel_fse_disable_global_styles', 100);

/**
 * Alternative: Disable Elementor's CSS file generation entirely
 * Uncomment this filter to prevent Elementor from generating CSS files in uploads folder
 *
 * Note: This will force Elementor to print CSS inline, which may affect caching
 * but ensures no external CSS files are generated
 */
// add_filter('elementor/frontend/builder_content/before_print_css', '__return_false');

/**
 * TEMPORARY: Clear block cache helper
 * Navigate to wp-admin/?clear_block_cache=1 to clear cache
 * DELETE after use
 */
require_once VOXEL_FSE_PATH . '/clear-block-cache.php';

/**
 * Verify FSE default templates on theme activation
 * 
 * WordPress automatically discovers templates from the templates/ directory.
 * This hook verifies that voxel-header-default and voxel-footer-default
 * are properly registered after theme activation.
 * 
 * @since 1.0.2
 */
add_action('after_switch_theme', function() {
    // Check if default header and footer templates exist
    $header = get_page_by_path('voxel-header-default', OBJECT, 'wp_template');
    $footer = get_page_by_path('voxel-footer-default', OBJECT, 'wp_template');
    
    // Log for debugging
    error_log('FSE Theme Activation: Default header exists: ' . ($header ? 'YES (ID: ' . $header->ID . ')' : 'NO'));
    error_log('FSE Theme Activation: Default footer exists: ' . ($footer ? 'YES (ID: ' . $footer->ID . ')' : 'NO'));
    
    // Templates should be auto-discovered from templates/ directory
    // If not found immediately, WordPress will create them on first request to Site Editor
});



