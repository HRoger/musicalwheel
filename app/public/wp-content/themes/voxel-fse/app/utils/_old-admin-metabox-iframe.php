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
        $is_admin_context = true;
        $is_admin_metabox = true;
        $post_id = $attributes['_admin_post_id'] ?? null;
        include plugin_dir_path(__DIR__) . 'blocks/src/create-post/render.php';
        ?>
    </div>

<?php get_footer() ?>