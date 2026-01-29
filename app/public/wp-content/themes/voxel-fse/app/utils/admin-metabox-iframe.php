<?php
/**
 * Edit post fields form in backend iframe
 * 1:1 match with Voxel's implementation
 * Evidence: themes/voxel/templates/backend/edit-post-fields.php
 *
 * @since 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

wp_enqueue_script('jquery');
add_filter('_voxel/enqueue-custom-popup-kit', '__return_false');

// CRITICAL: Bypass Voxel's soft-loading for maps scripts in admin metabox
// Voxel replaces src= with data-src= for google-maps and vx:google-maps.js scripts
// This prevents them from loading until JavaScript triggers them
// In admin metabox, we need them to load immediately for location field autocomplete
add_filter('script_loader_tag', function($tag, $handle) {
    // Only bypass soft-loading for maps-related scripts
    $maps_scripts = ['google-maps', 'vx:google-maps.js', 'mapbox-gl', 'vx:mapbox.js'];
    if (in_array($handle, $maps_scripts, true)) {
        // Convert data-src back to src to force immediate loading
        $tag = str_replace(' data-src=', ' src=', $tag);
    }
    return $tag;
}, 20, 2); // Priority 20 = run AFTER Voxel's filter (priority 10)

// Enqueue React/WordPress dependencies for create-post frontend
// Note: The actual frontend script is enqueued by admin-render.php from /app/blocks/src/create-post/frontend.js
// We just ensure the core dependencies are available here
wp_enqueue_script('wp-element'); // React
// NOTE: wp-api-fetch NOT needed - frontend.tsx uses native fetch() for headless compatibility
wp_enqueue_script('wp-i18n'); // Internationalization

// Note: Frontend script enqueuing is handled by admin-render.php which is included below
// admin-render.php enqueues 'voxel-fse-create-post-frontend' from /app/blocks/src/create-post/frontend.js

// Enqueue Voxel CSS for form styling
$assets = trailingslashit(get_template_directory_uri()) . 'assets/';
$dist = trailingslashit($assets) . 'dist/';
$voxel_version = function_exists('\Voxel\get_assets_version') ? \Voxel\get_assets_version() : '1.0';

wp_enqueue_style('vx:commons.css', $dist . (is_rtl() ? 'commons-rtl.css' : 'commons.css'), [], $voxel_version);
wp_enqueue_style('vx:forms.css', $dist . (is_rtl() ? 'forms-rtl.css' : 'forms.css'), [], $voxel_version);
wp_enqueue_style('vx:create-post.css', $dist . (is_rtl() ? 'create-post-rtl.css' : 'create-post.css'), [], $voxel_version);
wp_enqueue_style('vx:popup-kit.css', $dist . (is_rtl() ? 'popup-kit-rtl.css' : 'popup-kit.css'), [], $voxel_version);

// Enqueue Line Awesome icons
$line_awesome_url = get_template_directory_uri() . '/assets/icons/line-awesome/line-awesome.css';
wp_enqueue_style('voxel-line-awesome', $line_awesome_url, [], '1.3.0');

// Provide wpApiSettings for REST API calls
add_action('wp_head', function () {
    ?>
    <script type="text/javascript">
        var wpApiSettings = <?php echo wp_json_encode([
                'root' => esc_url_raw(rest_url()),
                'nonce' => wp_create_nonce('wp_rest'),
        ]); ?>;
    </script>
    <?php
}, 0); // Priority 0 = very first in head

// Note: Import map not needed - frontend.js is IIFE format, uses globals directly

// CRITICAL: Inject stub in head with highest priority
// Must execute before ANY scripts, especially Google Maps async script
add_action('wp_head', function () {
    ?>
    <script type="text/javascript">
        // CRITICAL: Define Voxel.Maps.GoogleMaps stub IMMEDIATELY in head
        // Google Maps async script will call this when it finishes loading
        (function () {
            'use strict';

            // Initialize Voxel object structure IMMEDIATELY (synchronously)
            if (typeof window.Voxel === 'undefined') {
                window.Voxel = {};
            }
            if (typeof window.Voxel.Maps === 'undefined') {
                window.Voxel.Maps = {};
            }

            // Store callback function reference
            var gmapsCallbackStub = function () {
                ////console.log('[Voxel FSE Admin] GoogleMaps callback stub called');
                window._voxel_gmaps_loaded = true;
                window._voxel_gmaps_callback_fired = true;

                if (window.Voxel && window.Voxel.Maps) {
                    if (typeof window.Voxel.Maps.Loaded !== 'undefined') {
                        window.Voxel.Maps.Loaded = true;
                    }
                    if (typeof document !== 'undefined' && document.dispatchEvent) {
                        try {
                            document.dispatchEvent(new CustomEvent('maps:loaded'));
                        } catch (e) {
                        }
                    }
                }
            };

            // Assign immediately - MUST exist before Google Maps loads
            window.Voxel.Maps.GoogleMaps = gmapsCallbackStub;

            ////console.log('[Voxel FSE Admin] GoogleMaps callback stub defined in head');

            // Monitor and restore callback if commons.js replaces Voxel.Maps
            var checkCount = 0;
            var checkInterval = setInterval(function () {
                checkCount++;
                if (window.Voxel && window.Voxel.Maps) {
                    if (typeof window.Voxel.Maps.GoogleMaps !== 'function') {
                        ////console.log('[Voxel FSE Admin] Restoring GoogleMaps callback (check #' + checkCount + ')');
                        window.Voxel.Maps.GoogleMaps = gmapsCallbackStub;
                        if (window._voxel_gmaps_loaded && typeof google !== 'undefined' && google.maps) {
                            gmapsCallbackStub();
                        }
                    }
                }
                if (checkCount >= 100) { // Stop after 5 seconds (100 * 50ms)
                    clearInterval(checkInterval);
                }
            }, 50);

            // Fix Voxel_Config when available
            setTimeout(function () {
                if (typeof Voxel_Config !== 'undefined') {
                    if (Voxel_Config.google_maps) {
                        Voxel_Config.google_maps.handle = 'google-maps-js';
                        ////console.log('[Voxel FSE Admin] Fixed Voxel_Config.google_maps.handle');
                    }
                    if (Voxel_Config.mapbox) {
                        Voxel_Config.mapbox.handle = 'mapbox-gl-js';
                    }
                }
            }, 100);
        })();
    </script>
    <?php
}, 1); // Priority 1 = very early in head

// ALSO output directly after header as fallback (in case wp_head doesn't work in iframe)
?>
<?php get_header() ?>
<script type="text/javascript">
    // FALLBACK: Ensure stub exists even if wp_head didn't execute
    if (typeof window.Voxel === 'undefined' || typeof window.Voxel.Maps === 'undefined' || typeof window.Voxel.Maps.GoogleMaps !== 'function') {
        if (typeof window.Voxel === 'undefined') window.Voxel = {};
        if (typeof window.Voxel.Maps === 'undefined') window.Voxel.Maps = {};

        window.Voxel.Maps.GoogleMaps = function () {
            ////console.log('[Voxel FSE Admin] GoogleMaps callback (fallback stub)');
            window._voxel_gmaps_loaded = true;
            window._voxel_gmaps_callback_fired = true;
            if (window.Voxel && window.Voxel.Maps) {
                if (typeof window.Voxel.Maps.Loaded !== 'undefined') window.Voxel.Maps.Loaded = true;
                if (typeof document !== 'undefined' && document.dispatchEvent) {
                    try {
                        document.dispatchEvent(new CustomEvent('maps:loaded'));
                    } catch (e) {
                    }
                }
            }
        };
        //console.log('[Voxel FSE Admin] GoogleMaps callback fallback stub defined after header');
    }
</script>
<style type="text/css">
    /* 1:1 match with Voxel's iframe styles */
    /* Evidence: themes/voxel/templates/backend/edit-post-fields.php:17-91 */
    html {
        scrollbar-gutter: stable;
        box-sizing: border-box;
    }

    body {
        font-family: "Arimo", sans-serif;
        font-size: 16px;
        --ts-shade-1: #313135;
        --ts-shade-2: #797a88;
        --ts-shade-3: #afb3b8;
        --ts-shade-4: #cfcfcf;
        --ts-shade-5: #f3f3f3;
        --ts-shade-6: #f8f8f8;
        --ts-shade-7: #fcfcfc;
        --ts-accent-1: #4F46E5;
        --ts-accent-2: #6A62F2;
        overflow: hidden;
        scrollbar-gutter: stable;
    }

    .ts-save-changes {
        display: none;
    }

    .ts-form-group {
        width: 100%;
    }

    .ts-filter.ts-filled svg, .ts-filter.ts-filled i {
        color: var(--ts-accent-1);
        fill: var(--ts-accent-1);
    }

    .iframe-editor-vx {
        max-width: 650px;
        margin: auto;
        padding-bottom: 300px;
        padding: 40px;
        padding-bottom: 500px;
    }

    @media (max-width: 1224px) {
        .iframe-editor-vx {
            max-width: 450px;
        }
    }

    <?php if ( post_type_supports( $post_type->get_key(), 'title' ) ): ?>
    .field-key-title {
        display: none !important;
    }

    <?php endif ?>

    <?php if ( post_type_supports( $post_type->get_key(), 'editor' ) ): ?>
    .field-key-description {
        display: none !important;
    }

    <?php endif ?>

    .field-key-_thumbnail_id, .ui-image-field {
        display: none !important;
    }
</style>
<div data-elementor-type="wp-page" data-elementor-id="0" class="elementor elementor-0 iframe-editor-vx">
    <?php
    // Render FSE create-post block
    // Note: VOXEL_FSE_PATH points to theme root, not utils directory
    // Uses admin-render.php (NOT render.php) so frontend uses save.tsx (Plan C+ pattern)
    $is_admin_context = true;
    $is_admin_metabox = true;
    $post_id = $attributes['_admin_post_id'] ?? null;
    include VOXEL_FSE_PATH . '/app/blocks/src/create-post/admin-render.php';
    ?>
</div>

<?php get_footer() ?>

<!-- DEBUG: Admin Metabox Iframe Diagnostics -->
<script type="text/javascript">
    console.log('=== Voxel FSE Admin Metabox Debug ===');
    console.log('wp.element available:', typeof window.wp !== 'undefined' && typeof window.wp.element !== 'undefined');
    console.log('wp.element.createRoot available:', typeof window.wp?.element?.createRoot !== 'undefined');
    console.log('wpApiSettings:', window.wpApiSettings);

    // Check if container exists
    var container = document.querySelector('.voxel-fse-create-post-frontend');
    console.log('Container found:', !!container);
    if (container) {
        console.log('Container classes:', container.className);
        var vxconfig = container.querySelector('script.vxconfig');
        console.log('vxconfig found:', !!vxconfig);
        if (vxconfig) {
            console.log('vxconfig content:', vxconfig.textContent);
        }
    }

    // Check if localized data exists (from wp_localize_script in render.php)
    console.log('voxelFseCreatePost data:', window.voxelFseCreatePost);
    console.log('fieldsConfig count:', window.voxelFseCreatePost?.fieldsConfig?.length || 0);
    console.log('isAdminMode:', window.voxelFseCreatePost?.isAdminMode);
    console.log('isAdminMetabox:', window.voxelFseCreatePost?.isAdminMetabox);

    // DEBUG: Maps script loading diagnostics
    console.log('=== Maps Script Debug ===');
    console.log('Voxel object:', window.Voxel);
    console.log('Voxel.Maps:', window.Voxel?.Maps);
    console.log('Voxel.Maps.Autocomplete:', window.Voxel?.Maps?.Autocomplete);
    console.log('Voxel.Maps.Loaded:', window.Voxel?.Maps?.Loaded);
    console.log('google object:', typeof google !== 'undefined' ? google : 'NOT LOADED');
    console.log('google.maps:', typeof google !== 'undefined' && google.maps ? 'LOADED' : 'NOT LOADED');

    // Check which scripts are in the DOM
    var scripts = document.querySelectorAll('script[src]');
    console.log('=== Loaded Scripts ===');
    scripts.forEach(function(s) {
        if (s.src.includes('google') || s.src.includes('maps') || s.src.includes('vx:') || s.src.includes('commons') || s.src.includes('vue')) {
            console.log('Script:', s.src);
        }
    });

    // Check for form submit method exposure
    console.log('=== Form Submit Debug ===');
    var formElement = document.querySelector('.ts-create-post');
    console.log('Form element found:', !!formElement);
    if (formElement) {
        console.log('formElement.voxelSubmit:', typeof formElement.voxelSubmit);
        console.log('formElement.voxelFseSubmit:', typeof formElement.voxelFseSubmit);
    }
    console.log('window.voxelFseSubmit:', typeof window.voxelFseSubmit);

    // Monitor for maps:loaded event
    document.addEventListener('maps:loaded', function() {
        console.log('[DEBUG] maps:loaded event fired!');
        console.log('Voxel.Maps.Autocomplete after event:', window.Voxel?.Maps?.Autocomplete);
    });

    // Delayed check for script loading
    setTimeout(function() {
        console.log('=== Delayed Check (2s) ===');
        console.log('Voxel.Maps.Autocomplete:', window.Voxel?.Maps?.Autocomplete);
        console.log('google.maps:', typeof google !== 'undefined' && google.maps ? 'LOADED' : 'NOT LOADED');
    }, 2000);
</script>
