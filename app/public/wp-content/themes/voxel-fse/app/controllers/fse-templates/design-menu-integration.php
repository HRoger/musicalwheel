<?php
declare(strict_types=1);

/**
 * Design Menu Integration for FSE Templates
 *
 * Hooks into Voxel's Design menu (General, Header & Footer, Taxonomies) to replace
 * Elementor template edit links with FSE Site Editor links.
 *
 * FIXED - Using same pattern as working Post Types implementation
 *
 * @package VoxelFSE\Controllers\FSE_Templates
 * @since 1.0.7
 */

namespace VoxelFSE\Controllers\Templates;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * ⭐ OPTION 2: PREVENT Voxel from creating orphan Elementor templates
 *
 * This filter intercepts wp_insert_post and cancels the creation of
 * "site template: header" and "site template: footer" Elementor templates
 * when we already have valid FSE templates stored.
 */
add_filter('wp_insert_post_data', function ($data, $postarr) {
    // Only intercept elementor_library posts
    if ($data['post_type'] !== 'elementor_library') {
        return $data;
    }

    // Check if this is a Voxel auto-created header/footer template
    $title = strtolower($data['post_title'] ?? '');
    if (strpos($title, 'site template: header') === false &&
            strpos($title, 'site template: footer') === false) {
        return $data;
    }

    // Check if we have FSE templates stored
    $fse_base_ids = get_option('mw_fse_base_template_ids', []);

    $is_header = strpos($title, 'header') !== false;
    $is_footer = strpos($title, 'footer') !== false;

    $should_block = false;

    if ($is_header && !empty($fse_base_ids['header'])) {
        $fse_post = get_post($fse_base_ids['header']);
        if ($fse_post && in_array($fse_post->post_type, ['wp_template', 'wp_template_part'], true)) {
            $should_block = true;
            // error_log("FSE PREVENTION: Blocked creation of orphan Elementor header template");
        }
    }

    if ($is_footer && !empty($fse_base_ids['footer'])) {
        $fse_post = get_post($fse_base_ids['footer']);
        if ($fse_post && in_array($fse_post->post_type, ['wp_template', 'wp_template_part'], true)) {
            $should_block = true;
            // error_log("FSE PREVENTION: Blocked creation of orphan Elementor footer template");
        }
    }

    if ($should_block) {
        // Set post_status to 'trash' and empty title to effectively cancel creation
        // We can't return false, but we can make the post unusable
        $data['post_status'] = 'auto-draft';
        $data['post_title'] = 'FSE_BLOCKED_ORPHAN_' . time();
    }

    return $data;
}, 10, 2);

/**
 * ⭐ ONE-TIME CLEANUP: Delete existing orphan Elementor templates
 *
 * Runs once to clean up any "site template: header/footer" Elementor templates
 * that were created before the prevention was in place.
 */
add_action('admin_init', function () {
    // Only run once
    if (get_option('mw_fse_orphan_cleanup_done')) {
        return;
    }

    // Check if we have FSE templates stored
    $fse_base_ids = get_option('mw_fse_base_template_ids', []);
    if (empty($fse_base_ids['header']) && empty($fse_base_ids['footer'])) {
        return; // No FSE templates, nothing to clean up
    }

    // Find and delete orphan Elementor templates
    $orphan_templates = get_posts([
            'post_type' => 'elementor_library',
            'post_status' => ['publish', 'draft', 'auto-draft'],
            'posts_per_page' => -1,
            'meta_query' => [
                    [
                            'key' => '_elementor_template_type',
                            'value' => ['header', 'footer'],
                            'compare' => 'IN',
                    ],
            ],
    ]);

    $deleted_count = 0;
    foreach ($orphan_templates as $template) {
        $title = strtolower($template->post_title);

        // Only delete "site template: header/footer" posts
        if (strpos($title, 'site template:') === false &&
                strpos($title, 'fse_blocked_orphan_') === false) {
            continue;
        }

        // Don't delete if this IS the active FSE template (shouldn't happen, but safety check)
        if ($template->ID == ($fse_base_ids['header'] ?? null) ||
                $template->ID == ($fse_base_ids['footer'] ?? null)) {
            continue;
        }

        wp_delete_post($template->ID, true);
        $deleted_count++;
    }

    if ($deleted_count > 0) {
        // error_log("FSE CLEANUP: Deleted {$deleted_count} orphan Elementor templates");
    }

    // Mark cleanup as done
    update_option('mw_fse_orphan_cleanup_done', true);
});


/**
 * ⭐ CRITICAL FIX: Protect FSE template IDs from being overwritten by Voxel
 *
 * Voxel's create_required_templates() in templates-controller.php runs on every
 * Header & Footer page load. It checks \Voxel\template_exists() which ONLY works
 * for 'elementor_library' post types. FSE templates (wp_template) fail this check,
 * causing Voxel to create NEW Elementor templates and overwrite our config!
 *
 * Solution: We store FSE template IDs in a separate option ('mw_fse_base_template_ids')
 * and restore them after Voxel's callback runs.
 */
add_action('current_screen', function ($screen) {
    if (!$screen) {
        return;
    }

    // Only run on Design menu pages where Voxel calls create_required_templates()
    $affected_pages = [
            'design_page_vx-templates-header-footer',
            'design_page_vx-templates-taxonomies',
    ];

    if (!in_array($screen->id, $affected_pages, true)) {
        return;
    }

    // Get our stored FSE template IDs (saved when user switches to FSE template via AJAX)
    $fse_base_ids = get_option('mw_fse_base_template_ids', []);
    $fse_header_id = $fse_base_ids['header'] ?? null;
    $fse_footer_id = $fse_base_ids['footer'] ?? null;

    // ⭐ FIRST-TIME CONNECTION: If no FSE IDs stored yet, check for default templates
    if (!$fse_header_id && !$fse_footer_id) {
        $needs_initial_connection = false;
        $initial_ids = [];

        // Check if voxel-header-default.html exists
        $header_template = get_page_by_path('voxel-header-default', OBJECT, 'wp_template');
        if ($header_template && $header_template->post_status !== 'trash') {
            $initial_ids['header'] = $header_template->ID;
            $needs_initial_connection = true;
        }

        // Check if voxel-footer-default.html exists
        $footer_template = get_page_by_path('voxel-footer-default', OBJECT, 'wp_template');
        if ($footer_template && $footer_template->post_status !== 'trash') {
            $initial_ids['footer'] = $footer_template->ID;
            $needs_initial_connection = true;
        }

        // If we found default templates, connect them to Voxel's config
        if ($needs_initial_connection) {
            // Store FSE IDs for future protection
            update_option('mw_fse_base_template_ids', $initial_ids);

            // Update Voxel's config to use these templates
            if (!empty($initial_ids['header'])) {
                \Voxel\set('templates.header', $initial_ids['header']);
                $fse_header_id = $initial_ids['header'];
            }
            if (!empty($initial_ids['footer'])) {
                \Voxel\set('templates.footer', $initial_ids['footer']);
                $fse_footer_id = $initial_ids['footer'];
            }

            // error_log("FSE FIRST-TIME CONNECTION: Connected default templates - header={$fse_header_id}, footer={$fse_footer_id}");
        }
    }

    // If no FSE IDs are stored (and no defaults found), nothing to protect
    if (!$fse_header_id && !$fse_footer_id) {
        // error_log("FSE PROTECTION: No stored FSE template IDs found - nothing to protect");
        return;
    }

    // Validate the stored FSE IDs are still valid wp_template posts
    if ($fse_header_id) {
        $post = get_post($fse_header_id);
        if (!$post || !in_array($post->post_type, ['wp_template', 'wp_template_part'], true)) {
            $fse_header_id = null;
        }
    }
    if ($fse_footer_id) {
        $post = get_post($fse_footer_id);
        if (!$post || !in_array($post->post_type, ['wp_template', 'wp_template_part'], true)) {
            $fse_footer_id = null;
        }
    }

    if (!$fse_header_id && !$fse_footer_id) {
        // error_log("FSE PROTECTION: Stored FSE template IDs are invalid - clearing storage");
        delete_option('mw_fse_base_template_ids');
        return;
    }

    // Log protection attempt (uncomment for debugging)
    // error_log("FSE PROTECTION: Will restore FSE IDs - header={$fse_header_id}, footer={$fse_footer_id}");

    // Store for JavaScript access
    global $mw_fse_protected_ids;
    $mw_fse_protected_ids = [
            'header' => $fse_header_id,
            'footer' => $fse_footer_id,
    ];

    // Register a late hook to restore FSE IDs AFTER Voxel's callback runs
    add_action('admin_footer', function () use ($fse_header_id, $fse_footer_id) {
        $templates_config = \Voxel\get('templates', null, true); // Force refresh
        $current_header = $templates_config['header'] ?? null;
        $current_footer = $templates_config['footer'] ?? null;

        $restored = false;
        $orphan_ids = []; // Track IDs to delete

        if ($fse_header_id && $current_header != $fse_header_id) {
            // error_log("FSE PROTECTION: Restoring header from {$current_header} to {$fse_header_id}");

            // ⭐ Delete the orphaned Elementor template that Voxel just created
            if ($current_header && is_numeric($current_header)) {
                $orphan_post = get_post($current_header);
                if ($orphan_post && $orphan_post->post_type === 'elementor_library') {
                    $orphan_ids[] = $current_header;
                }
            }

            \Voxel\set('templates.header', $fse_header_id);
            $restored = true;
        }

        if ($fse_footer_id && $current_footer != $fse_footer_id) {
            // error_log("FSE PROTECTION: Restoring footer from {$current_footer} to {$fse_footer_id}");

            // ⭐ Delete the orphaned Elementor template that Voxel just created
            if ($current_footer && is_numeric($current_footer)) {
                $orphan_post = get_post($current_footer);
                if ($orphan_post && $orphan_post->post_type === 'elementor_library') {
                    $orphan_ids[] = $current_footer;
                }
            }

            \Voxel\set('templates.footer', $fse_footer_id);
            $restored = true;
        }

        // Delete orphaned Elementor templates
        foreach ($orphan_ids as $orphan_id) {
//            error_log("FSE PROTECTION: Deleting orphaned Elementor template ID {$orphan_id}");
            wp_delete_post($orphan_id, true); // Force delete (skip trash)
        }

        if ($restored) {
//            error_log("FSE PROTECTION: Restored FSE template IDs successfully");
        }


        // ⭐ CRITICAL: Also inject JavaScript to fix Vue app's template IDs
        // The database is restored but the Vue app already has wrong IDs from Voxel's callback
        ?>
        <script type="text/javascript">
            (function () {
                // FSE template IDs that should be used
                var fseHeaderId = <?php echo json_encode($fse_header_id); ?>;
                var fseFooterId = <?php echo json_encode($fse_footer_id); ?>;

                // Debug: uncomment for troubleshooting
                // console.log('FSE PROTECTION JS: Will correct Vue template IDs', {header: fseHeaderId, footer: fseFooterId});

                // ⭐ FIRST: Try to modify the data-config attribute BEFORE Vue parses it
                var vueElement = document.getElementById('vx-template-manager');
                if (vueElement) {
                    try {
                        var configAttr = vueElement.getAttribute('data-config');
                        if (configAttr) {
                            var config = JSON.parse(configAttr);
                            var modified = false;

                            if (config.templates && Array.isArray(config.templates)) {
                                config.templates.forEach(function (template) {
                                    if (template.category === 'header' && fseHeaderId) {
                                        template.id = fseHeaderId;
                                        modified = true;
                                    }
                                    if (template.category === 'footer' && fseFooterId) {
                                        template.id = fseFooterId;
                                        modified = true;
                                    }
                                });
                            }

                            if (modified) {
                                vueElement.setAttribute('data-config', JSON.stringify(config));
                            }
                        }
                    } catch (e) {
                        // Silent fail
                    }
                }

                // ⭐ SECOND: Also poll for Vue instance in case it's already mounted or mounts soon
                var attempts = 0;
                var maxAttempts = 20; // 2 seconds max

                function checkVueAndUpdate() {
                    attempts++;
                    var el = document.getElementById('vx-template-manager');

                    if (el && (el.__vue_app__ || el.__vue__)) {
                        var vueInstance = el.__vue_app__ ? el.__vue_app__._instance : el.__vue__;
                        var configData = el.__vue_app__
                            ? (vueInstance && vueInstance.proxy && vueInstance.proxy.config)
                            : (vueInstance && vueInstance.config);

                        if (configData && configData.templates) {
                            configData.templates.forEach(function (template) {
                                if (template.category === 'header' && fseHeaderId && template.id != fseHeaderId) {
                                    template.id = fseHeaderId;
                                }
                                if (template.category === 'footer' && fseFooterId && template.id != fseFooterId) {
                                    template.id = fseFooterId;
                                }
                            });
                            return; // Done
                        }
                    }

                    if (attempts < maxAttempts) {
                        setTimeout(checkVueAndUpdate, 100);
                    }
                }

                // Start polling after a small delay
                setTimeout(checkVueAndUpdate, 100);
            })();
        </script>
        <?php
    }, 1);

}, 1); // Priority 1 - run BEFORE Voxel's callback


/**
 * Enqueue Line Awesome icons for Header & Footer and Taxonomies pages
 *
 * These pages use Line Awesome icons but don't enqueue the CSS by default
 */
add_action('admin_enqueue_scripts', function ($hook) {
    // Only enqueue on Design menu pages
    if (!in_array($hook, ['design_page_vx-templates-header-footer', 'design_page_vx-templates-taxonomies'], true)) {
        return;
    }

    // Enqueue Line Awesome CSS
    $base_url = trailingslashit(get_template_directory_uri()) . 'assets/icons/line-awesome/';
    wp_enqueue_style('line-awesome', $base_url . 'line-awesome.css', [], '1.3.0');
});


/**
 * Auto-create FSE templates and build URL mapping
 *
 * Uses current_screen hook because get_current_screen() is only available AFTER admin_init
 *
 * ⭐ DUPLICATION FIX: Uses transient to track already-processed templates
 * and checks for existing templates by slug before creating new ones.
 */
add_action('current_screen', function ($screen) {
    if (!$screen) {
        return;
    }

    // Only run on Design menu pages
    $design_pages = [
            'toplevel_page_voxel-templates',
            'design_page_vx-templates-header-footer',
            'design_page_vx-templates-taxonomies',
    ];

    if (!in_array($screen->id, $design_pages, true)) {
        return;
    }

    // ⭐ DEBUG: Log at page load to see what IDs are in Voxel's config
    $templates_config = \Voxel\get('templates');
    // error_log("=== FSE PAGE LOAD Debug ===");
    // error_log("FSE PAGE LOAD: Screen ID = {$screen->id}");
    // error_log("FSE PAGE LOAD: templates.header = " . ($templates_config['header'] ?? 'NULL'));
    // error_log("FSE PAGE LOAD: templates.footer = " . ($templates_config['footer'] ?? 'NULL'));

    // Get all base templates from Voxel
    $base_templates = \Voxel\get_base_templates();

    // Get active header/footer IDs to identify "Default" templates
    $active_header_id = isset($templates_config['header']) ? $templates_config['header'] : null;
    $active_footer_id = isset($templates_config['footer']) ? $templates_config['footer'] : null;

    // ⭐ NOTE: We removed the aggressive auto-sync here that was overwriting user choices.
    // Invalid template IDs are now handled by the AJAX handlers which throw proper errors.
    // If a user enters an invalid ID, they'll see an error message instead of silent overwriting.

    $fse_template_urls = [];


    // Templates that are PAGES, not FSE templates (skip these)
    $page_template_keys = [
            'templates.auth',
            'templates.current_plan',
            'templates.orders',
            'templates.checkout',
            'templates.stripe_account',
            'templates.timeline',
            'templates.inbox',
            'templates.post_stats',
            'templates.privacy_policy',
            'templates.terms',
    ];

    // Process base templates (header, footer, 404, restricted, style kits)
    // Just build URL mapping from the IDs in Voxel's config - don't create or modify templates here
    foreach ($base_templates as $template) {
        if (empty($template['id']) || empty($template['key'])) {
            continue;
        }

        // Skip page templates - let Voxel handle them
        if (in_array($template['key'], $page_template_keys, true)) {
            continue;
        }

        // ⭐ SIMPLIFIED: Just use the template ID directly from Voxel's config
        // The template ID IS the FSE template ID - no need to look up by slug
        $fse_template_id = absint($template['id']);

        // Verify the post exists
        $post = get_post($fse_template_id);
        if (!$post || $post->post_status === 'trash') {
            continue; // Skip invalid template IDs
        }

        // Map template ID to FSE Site Editor URL
        $fse_template_urls[$template['id']] = Template_Manager::get_site_editor_url($fse_template_id);
    }


    // Store base template mapping
    update_option('mw_fse_design_base_template_mapping', $fse_template_urls);

    // Get custom templates (header, footer, term_single, term_card)
    $custom_templates = \Voxel\get_custom_templates();

    // Process custom templates - ONLY build URL mapping, don't create templates
    foreach ($custom_templates as $group => $templates) {
        foreach ($templates as $template) {
            if (empty($template['id']) || empty($template['label'])) {
                continue;
            }

            // ⭐ SIMPLIFIED: Just use the template ID directly from Voxel's config
            // The template ID IS the FSE template ID - no need to look up by slug
            $fse_template_id = absint($template['id']);

            // Verify the post exists
            $post = get_post($fse_template_id);
            if (!$post || $post->post_status === 'trash') {
                continue; // Skip invalid template IDs
            }

            // Map template ID to FSE Site Editor URL
            $fse_template_urls[$template['id']] = Template_Manager::get_site_editor_url($fse_template_id);
        }
    }


    // Add custom template mappings from option
    $custom_template_mapping = get_option('mw_fse_design_custom_template_mapping', []);
    if (!empty($custom_template_mapping)) {
        $fse_template_urls = $fse_template_urls + $custom_template_mapping;
    }

    // Create ID mapping for JavaScript
    $fse_template_id_map = [];
    foreach ($fse_template_urls as $template_id => $url) {
        $fse_template_id_map[$template_id] = true;
    }
    
    // error_log( "FSE Design Menu: Template URL mapping: " . wp_json_encode( $fse_template_urls ) );

    // Store in global for JavaScript
    global $mw_fse_design_template_urls, $mw_fse_design_template_id_map;
    $mw_fse_design_template_urls = $fse_template_urls;
    $mw_fse_design_template_id_map = $fse_template_id_map;
});


/**
 * Output JavaScript override inline (same pattern as working Post Types implementation)
 *
 * Uses admin_footer hook to output script before wp_footer where enqueued scripts load
 */
add_action('admin_footer', function () {
    global $mw_fse_design_template_urls, $mw_fse_design_template_id_map;

    $screen = get_current_screen();
    if (!$screen) {
        return;
    }

    $design_pages = [
            'toplevel_page_voxel-templates',
            'design_page_vx-templates-header-footer',
            'design_page_vx-templates-taxonomies',
    ];

    if (!in_array($screen->id, $design_pages, true)) {
        return;
    }

    // ⭐ IMPORTANT: Do NOT return early if mapping is empty!
    // The replaceEditLinks and replacePreviewLinks functions work without the mapping
    // by simply replacing action=elementor with action=fse and adding canvas=view
    // Returning early would break first-visit link replacement

    // Initialize globals if not set (ensures JavaScript always has valid data)
    if (!isset($mw_fse_design_template_urls)) {
        $mw_fse_design_template_urls = [];
    }
    if (!isset($mw_fse_design_template_id_map)) {
        $mw_fse_design_template_id_map = [];
    }

    // error_log( 'Outputting JavaScript to page' );

    ?>
    <script type="text/javascript">
        (function () {
            // console.log('FSE Design Menu: Installing DOM mutation observer for href replacement...');
            // console.log('FSE Design Menu: Page URL:', window.location.href);

            // FSE template URL mapping
            var fseTemplateUrls = <?php echo wp_json_encode($mw_fse_design_template_urls, JSON_FORCE_OBJECT); ?>;
            // FSE template ID mapping (to check if a post ID is an FSE template)
            window.VoxelFSE_DesignTemplateMapping = fseTemplateUrls;
            window.VoxelFSE_DesignTemplateIDs = <?php echo wp_json_encode(isset($mw_fse_design_template_id_map) ? $mw_fse_design_template_id_map : [], JSON_FORCE_OBJECT); ?>;

            // console.log('FSE Design Menu: Initial mapping:', fseTemplateUrls);


            /**
             * Extract template ID from Elementor URL
             * URL format: http://...post.php?post=123&action=elementor
             */
            function extractTemplateIdFromUrl(url) {
                var match = url.match(/[?&]post=(\d+)/);
                return match ? match[1] : null;
            }

            /**
             * Replace Elementor URLs with action=fse in edit template buttons
             *
             * NEW APPROACH (v1.1.0):
             * Instead of replacing with Site Editor URLs, we replace action=elementor with action=fse.
             * The replace_editor filter in fse-action-handler.php will intercept action=fse
             * and redirect to Site Editor using the actual post slug from database.
             *
             * Benefits:
             * - Self-correcting: Uses post_id to get actual slug
             * - Solves wrong slug issue automatically
             * - Simpler: No URL mapping needed
             */
            function replaceEditLinks(container) {
                if (!container) {
                    container = document;
                }

                // Find all "Edit template" buttons with Elementor URLs
                var editButtons = container.querySelectorAll('a[href*="post.php"][href*="action=elementor"]');
                // console.log('FSE Design Menu: Found', editButtons.length, 'edit buttons with action=elementor');
                var replacedCount = 0;

                editButtons.forEach(function (button) {
                    var currentHref = button.getAttribute('href');
                    if (!currentHref) return;

                    // ⭐ NEW: Simply replace action=elementor with action=fse
                    // The replace_editor filter will handle the redirect using actual post data
                    var newHref = currentHref.replace('action=elementor', 'action=fse');

                    // console.log('FSE Design Menu: Replacing:', currentHref, '->', newHref);

                    button.setAttribute('href', newHref);
                    replacedCount++;
                });

                if (replacedCount > 0) {
                    // console.log('FSE Design Menu: Replaced', replacedCount, 'edit links with action=fse');
                }

                return replacedCount;
            }

            /**
             * Replace preview links (eye icons) by adding canvas=view parameter
             * The PHP interceptor will handle the actual redirect to Site Editor
             * This approach doesn't require the mapping to be ready - works immediately!
             */
            function replacePreviewLinks(container) {
                if (!container) {
                    container = document;
                }

                // Find all preview links (eye icons) that use ?p={id} format
                // These are typically: <a href="/?p=123" class="ts-button ts-outline icon-only">
                var previewLinks = container.querySelectorAll('a.ts-button.icon-only[href*="?p="], a.ts-button.ts-outline.icon-only[href*="?p="]');
                var replacedCount = 0;

                // Titles of templates that are actually PAGES (should be skipped)
                // Same list as Post Type Editor
                var pageTitles = [
                    'Create Post',
                    'Login & registration',
                    'Current plan',
                    'Orders page',
                    'Cart summary',
                    'Stripe Connect account',
                    'Newsfeed',
                    'Inbox',
                    'Post statistics',
                    'Privacy Policy',
                    'Terms & Conditions'
                ];

                previewLinks.forEach(function (link) {
                    var currentHref = link.getAttribute('href');
                    if (!currentHref) return;

                    // Skip if already has canvas=view (already replaced)
                    if (currentHref.indexOf('canvas=view') !== -1) {
                        return;
                    }

                    // Extract post ID from URL like /?p=123 or ?p=123
                    var postIdMatch = currentHref.match(/[?&]p=(\d+)/);
                    if (!postIdMatch) return;

                    // ⭐ Check if this is a known Page based on title
                    var card = link.closest('.x-template');
                    if (card) {
                        var titleEl = card.querySelector('h3');
                        if (titleEl) {
                            var title = titleEl.innerText.trim();
                            if (pageTitles.indexOf(title) !== -1) {
                                return; // Skip known pages
                            }
                        }
                    }

                    // Simply add canvas=view parameter
                    // The PHP interceptor will check if it's an FSE template and redirect accordingly
                    var separator = currentHref.indexOf('?') !== -1 ? '&' : '?';
                    var newHref = currentHref + separator + 'canvas=view';

                    link.setAttribute('href', newHref);
                    replacedCount++;
                });

                return replacedCount;
            }

            // ⭐ NEW: Debounced replacement function to avoid excessive calls
            var replaceDebounceTimer = null;

            function debouncedReplaceEditLinks() {
                if (replaceDebounceTimer) {
                    clearTimeout(replaceDebounceTimer);
                }
                replaceDebounceTimer = setTimeout(function () {
                    replaceEditLinks();
                    replacePreviewLinks(); // Also replace preview links
                }, 100);
            }

            // ⭐ NEW: Periodic check to catch any missed links (runs every 1 second)
            var periodicCheckInterval = setInterval(function () {
                var hasElementorLinks = document.querySelector('a[href*="post.php"][href*="action=elementor"]');
                var hasPreviewLinks = document.querySelector('a.ts-button.icon-only[href*="?p="]');
                if (hasElementorLinks || hasPreviewLinks) {
                    // //console.log('FSE Design Menu: Periodic check found links, replacing...');
                    replaceEditLinks();
                    replacePreviewLinks();
                }
            }, 1000);

            // ⭐ NEW: Run immediately on page load (multiple times to catch Vue rendering)
            function runInitialReplacement() {
                // //console.log('FSE Design Menu: Running initial href replacement...');
                replaceEditLinks();
                replacePreviewLinks();

                // Run again after delays to catch Vue rendering
                setTimeout(function () {
                    replaceEditLinks();
                    replacePreviewLinks();
                }, 100);
                setTimeout(function () {
                    replaceEditLinks();
                    replacePreviewLinks();
                }, 500);
                setTimeout(function () {
                    replaceEditLinks();
                    replacePreviewLinks();
                }, 1000);
                setTimeout(function () {
                    replaceEditLinks();
                    replacePreviewLinks();
                }, 2000);
            }

            // Run on DOMContentLoaded or immediately if already loaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', runInitialReplacement);
            } else {
                runInitialReplacement();
            }

            // ⭐ NEW: Listen for tab clicks as a fallback
            document.addEventListener('click', function (e) {
                var target = e.target.closest('.ts-nav-item a, .ts-tab-content a, [data-tab], .nav-tab');
                if (target) {
                    // //console.log('FSE Design Menu: Tab click detected, replacing links...');
                    setTimeout(function () {
                        replaceEditLinks();
                        replacePreviewLinks();
                    }, 200);
                    setTimeout(function () {
                        replaceEditLinks();
                        replacePreviewLinks();
                    }, 500);
                }
            }, true); // Use capture phase to catch early

            // ⭐ IMPROVED: Watch for templates tab visibility changes
            var lastVisibleState = false;
            var visibilityCheckInterval = setInterval(function () {
                // Find templates tab content (Vue renders it dynamically)
                var templatesContent = document.querySelector('.x-templates, [v-if*="templates"], [v-show*="templates"], .ts-tab-content[data-tab*="template"]');

                // Also check by looking for edit buttons in templates context
                var hasTemplatesEditButtons = document.querySelector('.x-templates a[href*="action=elementor"], [v-if*="templates"] a[href*="action=elementor"]');

                var isVisible = false;
                if (templatesContent) {
                    var style = window.getComputedStyle(templatesContent);
                    isVisible = style.display !== 'none' && style.visibility !== 'hidden' && templatesContent.offsetParent !== null;
                } else if (hasTemplatesEditButtons) {
                    // If we can see edit buttons with action=elementor in templates context, tab is visible
                    isVisible = true;
                }

                // Trigger replacement when tab becomes visible OR if it's visible and has elementor links
                if (isVisible) {
                    if (!lastVisibleState) {
                        // //console.log('FSE Design Menu: Templates tab became visible');
                        setTimeout(function () {
                            replaceEditLinks();
                            replacePreviewLinks();
                        }, 300);
                    } else {
                        // ⭐ NEW: Also check if visible tab has elementor links or preview links
                        var hasElementorLinks = document.querySelector('.x-templates a[href*="action=elementor"], [v-if*="templates"] a[href*="action=elementor"]');
                        var hasPreviewLinks = document.querySelector('.x-templates a.ts-button.icon-only[href*="?p="]');
                        if (hasElementorLinks || hasPreviewLinks) {
                            // //console.log('FSE Design Menu: Visible tab has links, replacing...');
                            debouncedReplaceEditLinks();
                        }
                    }
                }
                lastVisibleState = isVisible;
            }, 200);

            // ⭐ IMPROVED: Watch for DOM changes and replace links as Vue adds/updates them
            var observer = new MutationObserver(function (mutations) {
                var shouldReplace = false;

                mutations.forEach(function (mutation) {
                    // Check if nodes were added (Vue rendered new templates)
                    if (mutation.addedNodes.length > 0) {
                        // Check if any added node contains action=elementor links or preview links
                        for (var i = 0; i < mutation.addedNodes.length; i++) {
                            var node = mutation.addedNodes[i];
                            if (node.nodeType === 1) { // Element node
                                if (node.matches && (node.matches('a[href*="action=elementor"]') || node.matches('a.ts-button.icon-only[href*="?p="]'))) {
                                    shouldReplace = true;
                                    break;
                                }
                                if (node.querySelector && (node.querySelector('a[href*="action=elementor"]') || node.querySelector('a.ts-button.icon-only[href*="?p="]'))) {
                                    shouldReplace = true;
                                    break;
                                }
                            }
                        }
                    }

                    // Check if attributes changed (Vue updated href)
                    if (mutation.type === 'attributes' && mutation.attributeName === 'href') {
                        var target = mutation.target;
                        if (target && target.href && (target.href.indexOf('action=elementor') !== -1 || target.href.indexOf('?p=') !== -1)) {
                            shouldReplace = true;
                        }
                    }
                });

                if (shouldReplace) {
                    // //console.log('FSE Design Menu: DOM mutation detected, replacing edit links...');
                    debouncedReplaceEditLinks();
                }
            });

            // Start observing the template manager container (more aggressive)
            var templateManager = document.getElementById('vx-template-manager');
            if (templateManager) {
                observer.observe(templateManager, {
                    childList: true,       // Watch for added/removed nodes
                    subtree: true,          // Watch all descendants
                    attributes: true,       // Watch for attribute changes
                    attributeFilter: ['href'] // Only watch href attribute changes
                });
                // //console.log('FSE Design Menu: MutationObserver started on #vx-template-manager');
            } else {
                // console.warn('FSE Design Menu: #vx-template-manager element not found, watching document.body');
                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['href']
                });
            }

            // Intercept AJAX responses to update mapping when new templates are created
            var originalXHROpen = XMLHttpRequest.prototype.open;
            var originalXHRSend = XMLHttpRequest.prototype.send;

            XMLHttpRequest.prototype.open = function (method, url) {
                this._url = url;
                return originalXHROpen.apply(this, arguments);
            };

            XMLHttpRequest.prototype.send = function () {
                var xhr = this;

                this.addEventListener('load', function () {
                    // Check for custom template creation
                    if (xhr._url && xhr._url.indexOf('backend.create_custom_template') !== -1) {
                        // //console.log('FSE Design Menu: Detected custom template creation AJAX');
                        try {
                            var response = JSON.parse(xhr.responseText);
                            // //console.log('FSE Design Menu: AJAX response:', response);

                            if (response.success && response.fse_template_id && response.fse_edit_url) {
                                // Add to mapping immediately
                                // //console.log('FSE Design Menu: Adding to mapping:', response.fse_template_id, '=>', response.fse_edit_url);
                                fseTemplateUrls[response.fse_template_id] = response.fse_edit_url;
                                fseTemplateUrls[String(response.fse_template_id)] = response.fse_edit_url;
                                // Also update the ID mapping
                                if (window.VoxelFSE_DesignTemplateIDs) {
                                    window.VoxelFSE_DesignTemplateIDs[response.fse_template_id] = true;
                                    window.VoxelFSE_DesignTemplateIDs[String(response.fse_template_id)] = true;
                                }

                                // //console.log('FSE Design Menu: Updated mapping keys:', Object.keys(fseTemplateUrls));

                                // Wait a moment for Vue to render, then replace links
                                setTimeout(function () {
                                    replaceEditLinks();
                                    replacePreviewLinks();
                                }, 100);
                            }
                        } catch (e) {
                            // console.error('FSE Design Menu: Error parsing AJAX response:', e);
                        }
                    }

                    // Check for base template creation
                    if (xhr._url && xhr._url.indexOf('backend.create_base_template') !== -1) {
                        // //console.log('FSE Design Menu: Detected base template creation AJAX');
                        try {
                            var response = JSON.parse(xhr.responseText);
                            // //console.log('FSE Design Menu: Base template response:', response);

                            if (response.success && response.fse_template_id && response.fse_edit_url) {
                                fseTemplateUrls[response.fse_template_id] = response.fse_edit_url;
                                fseTemplateUrls[String(response.fse_template_id)] = response.fse_edit_url;
                                // Also update the ID mapping
                                if (window.VoxelFSE_DesignTemplateIDs) {
                                    window.VoxelFSE_DesignTemplateIDs[response.fse_template_id] = true;
                                    window.VoxelFSE_DesignTemplateIDs[String(response.fse_template_id)] = true;
                                }
                                // //console.log('FSE Design Menu: Added base template to mapping:', response.fse_template_id);

                                // Wait a moment for Vue to render, then replace links
                                setTimeout(function () {
                                    replaceEditLinks();
                                    replacePreviewLinks();
                                }, 100);
                            }
                        } catch (e) {
                            // console.error('FSE Design Menu: Error parsing base template response:', e);
                        }
                    }
                });

                return originalXHRSend.apply(this, arguments);
            };

            // //console.log('FSE Design Menu: Setup complete');
        })();
    </script>
    <?php
}, 1); // Priority 1 - early in admin_footer, before wp_footer
