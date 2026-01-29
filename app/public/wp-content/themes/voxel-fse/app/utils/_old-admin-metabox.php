<?php
declare(strict_types=1);

/**
 * Admin Metabox for Create Post Block
 *
 * Renders the Create Post block in the WordPress admin edit screen
 * for Voxel post types. This allows editing custom fields directly
 * in the admin interface.
 */

if ( ! defined('ABSPATH') ) {
    exit;
}

/**
 * Remove Voxel's Elementor metabox from unsupported post types
 *
 * Called on 'add_meta_boxes' hook with priority 15 (after Voxel's priority 10, before our registration at 20)
 *
 * @param string $post_type The post type
 * @param WP_Post $post The post object
 */
function voxel_fse_remove_voxel_metabox_from_unsupported_types( $post_type, $post ) {
    // Check if this post type is managed by Voxel
    $voxel_post_type = \Voxel\Post_Type::get( $post_type );
    $is_managed_by_voxel = $voxel_post_type && $voxel_post_type->is_managed_by_voxel();

    // Always exclude these system post types regardless of Voxel configuration
    $system_post_types = [ 'attachment', 'revision', 'nav_menu_item' ];

    if ( in_array( $post_type, $system_post_types, true ) ) {
        remove_meta_box( 'voxel_post_fields', $post_type, 'normal' );
        return;
    }

    // For 'post' and 'page' types: only remove if NOT managed by Voxel
    // This allows users to configure these built-in types in Voxel if desired
    if ( in_array( $post_type, [ 'post', 'page' ], true ) && ! $is_managed_by_voxel ) {
        remove_meta_box( 'voxel_post_fields', $post_type, 'normal' );
        return;
    }
}

/**
 * Register metabox for Voxel post types
 *
 * Called on 'add_meta_boxes' hook with priority 20 (after Voxel's priority 10)
 *
 * IMPORTANT: We use a DIFFERENT ID (voxel_fse_post_fields) instead of replacing Voxel's metabox.
 * This ensures WordPress's meta box detection for Gutenberg correctly identifies active metaboxes,
 * which is required for the ResizableBox (drag handle) to appear.
 *
 * Voxel's original metabox is hidden via CSS added in voxel_fse_hide_voxel_metabox().
 */
function voxel_fse_add_create_post_metabox() {
    $post = \Voxel\Post::get( get_post() );
    if ( ! ( $post && $post->is_managed_by_voxel() ) ) {
        return;
    }

    $post_type_key = $post->post_type->get_key();

    // Add our FSE metabox with a UNIQUE ID (don't remove Voxel's to preserve meta box area detection)
    // Voxel's original metabox will be hidden via CSS
    add_meta_box(
            'voxel_fse_post_fields', // Use unique ID to avoid conflicts with WordPress meta box detection
            __( 'Fields', 'voxel-fse' ) . sprintf(
                    '<a href="%s" target="_blank">%s</a>',
                    esc_url( $post->get_edit_link() ),
                    __( 'Edit in frontend form', 'voxel-fse' )
            ),
            'voxel_fse_render_create_post_metabox',
            $post_type_key,
            'normal',
            'high'
    );

    // Hide Voxel's original metabox and prevent its AJAX loading
    add_action( 'admin_head', 'voxel_fse_hide_voxel_metabox' );
    add_action( 'admin_enqueue_scripts', 'voxel_fse_patch_voxel_backend_scripts', 20 );
}

/**
 * Patch Voxel's backend.js to prevent it from loading the removed Elementor metabox
 *
 * Instead of dequeuing backend.js (which breaks Author and Expiry metaboxes),
 * we inject a script that prevents the AJAX call for the removed metabox.
 */
function voxel_fse_patch_voxel_backend_scripts() {
    $screen = get_current_screen();
    if ( ! $screen || $screen->base !== 'post' ) {
        return;
    }

    // Check if this is a Voxel post type
    $post_type = \Voxel\Post_Type::get( $screen->post_type );
    if ( ! $post_type ) {
        return;
    }

    // Inject script to disable the fields metabox loader in Voxel's backend.js
    // This prevents the AJAX call that tries to load the removed Elementor metabox
    wp_add_inline_script( 'vx:backend.js', '
		// Patch Voxel_Backend to skip loading the removed Elementor metabox
		if (window.Voxel_Backend && window.Voxel_Backend.components && window.Voxel_Backend.components.fieldsMetabox) {
			// Replace the mount method with a no-op
			window.Voxel_Backend.components.fieldsMetabox.mounted = function() {
				//console.log("FSE: Skipped loading Voxel Elementor fields metabox (replaced by FSE metabox)");
			};
		}
	', 'after' );
}

/**
 * Hide Voxel's original metabox via CSS
 *
 * We don't remove Voxel's metabox from the registry because that can interfere
 * with WordPress's meta box detection for Gutenberg (which controls the ResizableBox).
 * Instead, we hide it via CSS and prevent its AJAX loading via voxel_fse_patch_voxel_backend_scripts().
 */
function voxel_fse_hide_voxel_metabox() {
    $screen = get_current_screen();
    if ( ! $screen || $screen->base !== 'post' ) {
        return;
    }

    // Check if this is a Voxel post type
    $post_type = \Voxel\Post_Type::get( $screen->post_type );
    if ( ! $post_type ) {
        return;
    }

    // Hide Voxel's original metabox (voxel_post_fields) via CSS
    // Our FSE metabox (voxel_fse_post_fields) will be shown instead
    ?>
    <style type="text/css">
        /* Hide Voxel's original metabox - our FSE version (voxel_fse_post_fields) replaces it */
        #voxel_post_fields {
            display: none !important;
        }

        /* Also hide from the "Screen Options" panel to avoid confusion */
        label[for="voxel_post_fields-hide"] {
            display: none !important;
        }
    </style>
    <?php
}

/**
 * DEPRECATED: voxel_fse_remove_voxel_metaboxes
 *
 * This function is no longer used. We now keep Voxel's metabox in the registry
 * (to preserve WordPress's meta box detection for Gutenberg ResizableBox) and
 * hide it via CSS in voxel_fse_hide_voxel_metabox().
 *
 * Kept for reference only.
 */

/**
 * Render the Create Post block in the metabox
 *
 * @param WP_Post $wp_post The current post being edited
 */
function voxel_fse_render_create_post_metabox( $wp_post ) {
    // Get Voxel post type
    $post_type = \Voxel\Post_Type::get( $wp_post->post_type );
    if ( ! $post_type ) {
        echo '<p>' . esc_html__( 'Invalid post type.', 'voxel-fse' ) . '</p>';
        return;
    }

    // Get Voxel post
    $post = \Voxel\Post::get( $wp_post->ID );
    if ( ! $post ) {
        echo '<p>' . esc_html__( 'Invalid post.', 'voxel-fse' ) . '</p>';
        return;
    }

    // Check permissions
    if ( ! \Voxel\Post::current_user_can_edit( $wp_post->ID ) ) {
        echo '<p>' . esc_html__( 'You do not have permission to edit this post.', 'voxel-fse' ) . '</p>';
        return;
    }

    // Generate admin mode nonce (required by Voxel's admin handler)
    $admin_mode_nonce = wp_create_nonce( 'vx_create_post_admin_mode' );

    // Set up block attributes for admin context
    // Use default values from block.json
    $attributes = [
            'postTypeKey' => $post_type->get_key(),
            'showFormHead' => true, // Show progress bar and navigation in admin metabox (1:1 Voxel match)
            'enableDraftSaving' => false, // Use WP's save draft button instead
            'successMessage' => __( 'Your post has been updated successfully!', 'voxel-fse' ),
            'redirectAfterSubmit' => '',
            'submitButtonText' => __( 'Save Changes', 'voxel-fse' ),
            'icons' => [
                    'next' => '',
                    'prev' => '',
                    'draft' => '',
                    'publish' => '',
                    'save' => '',
                    'success' => '',
                    'view' => '',
            ],
            '_admin_mode' => true, // Flag to indicate admin context
            '_admin_post_id' => $wp_post->ID, // Pass post ID directly
            '_admin_nonce' => $admin_mode_nonce, // Nonce for admin handler
    ];

    // Render the form in an IFRAME (1:1 match with Voxel's implementation)
    // Evidence: themes/voxel/templates/backend/edit-post-metabox.php:17-26

    $iframe_url = add_query_arg( [
            'action' => 'voxel_fse_admin_get_fields_form',
            'post_type' => $post_type->get_key(),
            'post_id' => $wp_post->ID,
            '_wpnonce' => $admin_mode_nonce,
    ], home_url('/?vx=1') );
    ?>
    <div id="vx-fields-wrapper-fse">
        <iframe
                data-src="<?= esc_attr( $iframe_url ) ?>"
                style="width: 100%; display: block; min-height: 400px;"
                frameborder="0"
        ></iframe>
    </div>

    <style type="text/css">
        /* 1:1 match with Voxel's styles */
        /* Evidence: themes/voxel/templates/backend/edit-post-metabox.php:29-41 */
        .edit-post-meta-boxes-area.is-loading::before {
            display: none;
        }

        #vx-fields-wrapper-fse {
            display: flex;
            justify-content: center;
            overflow: hidden;
        }
    </style>

    <script type="text/javascript">
        /* Load iframe and setup dynamic height + Update button interception */
        /* 1:1 match with Voxel's backend.js implementation */
        /* Evidence: themes/voxel/assets/dist/backend.js */
        jQuery(document).ready(function($) {
            var wrapper = document.getElementById('vx-fields-wrapper-fse');
            if (!wrapper) return;

            var iframe = wrapper.querySelector('iframe');
            if (!iframe || !iframe.getAttribute('data-src')) return;

            // Setup ResizeObserver to dynamically set iframe height
            var resizeObserver = new ResizeObserver(function(entries) {
                requestAnimationFrame(function() {
                    if (entries[0].target.offsetHeight !== 0) {
                        iframe.style.height = entries[0].target.offsetHeight + 'px';
                    }
                });
            });

            // INTERCEPT WordPress Update button (1:1 match with Voxel's backend.js)
            // This is how Voxel saves custom fields in admin metabox
            var formSubmitted = false;
            var updateButton = null;
            var clickHandlersAttached = false;

            // Load iframe and observe content body height
            var setupObserver = function(event) {
                if (event.data === 'create-post:mounted') {
                    requestAnimationFrame(function() {
                        var iframeBody = iframe.contentWindow.document.body;
                        if (iframeBody.offsetHeight !== 0) {
                            iframe.style.height = iframeBody.offsetHeight + 'px';
                            resizeObserver.observe(iframeBody);
                        }

                        // ATTACH button handlers AFTER iframe has mounted
                        // This ensures the React component has exposed the submit method
                        if (!clickHandlersAttached) {
                            clickHandlersAttached = true;
                            //console.log('Admin metabox: Iframe mounted, attaching button handlers');

                            // Intercept #publish and #save-post buttons (1:1 match with Voxel)
                            Array.from(document.querySelectorAll('#publish, #save-post')).forEach(function(button) {
                                var clickHandler = function(event) {
                                    updateButton = event.currentTarget;
                                    if (!formSubmitted) {
                                        // Prevent WordPress save and trigger iframe form submission instead
                                        event.preventDefault();

                                        // Access the iframe's React form element and call exposed submit method
                                        var formElement = iframe.contentWindow.document.querySelector('.ts-create-post');
                                        var submitCalled = false;

                                        // Try DOM element method first
                                        if (formElement && formElement.voxelSubmit) {
                                            formElement.voxelSubmit();
                                            //console.log('Admin metabox: Called iframe submit method via DOM element');
                                            submitCalled = true;
                                        }
                                        // Fallback to window method
                                        else if (iframe.contentWindow.voxelFseSubmit) {
                                            iframe.contentWindow.voxelFseSubmit();
                                            //console.log('Admin metabox: Called iframe submit method via window object');
                                            submitCalled = true;
                                        }

                                        if (!submitCalled) {
                                            console.error('Admin metabox: Submit method not found', {
                                                formElement: formElement,
                                                hasElementMethod: formElement ? !!formElement.voxelSubmit : false,
                                                hasWindowMethod: !!iframe.contentWindow.voxelFseSubmit
                                            });
                                        }

                                        // Add visual feedback
                                        wrapper.classList.add('ts-saving');
                                        updateButton.classList.add('vx-disabled');
                                        updateButton.removeEventListener('click', clickHandler);
                                    }
                                };
                                button.addEventListener('click', clickHandler);
                            });
                        }
                    });
                    window.removeEventListener('message', setupObserver);
                }
            };

            // Listen for successful form submission from iframe
            window.addEventListener('message', function(event) {
                if (event.data === 'create-post:submitted') {
                    formSubmitted = true;
                    //console.log('Admin metabox: Received create-post:submitted message');
                    if (updateButton) {
                        // Remove disabled state and re-click to actually save WordPress fields
                        updateButton.classList.remove('vx-disabled');
                        updateButton.click();
                    }
                }
            });

            window.addEventListener('message', setupObserver);
            iframe.src = iframe.getAttribute('data-src');
        });
    </script>
    <?php
}

/**
 * AJAX handler to render the form inside the iframe
 * 1:1 match with Voxel's get_fields_form() handler
 * Evidence: themes/voxel/app/controllers/post-controller.php:72-115
 */
function voxel_fse_ajax_admin_get_fields_form() {
    try {
        \Voxel\verify_nonce( $_REQUEST['_wpnonce'] ?? '', 'vx_create_post_admin_mode' );

        $post_type = \Voxel\Post_Type::get( $_GET['post_type'] ?? null );
        if ( ! ( $post_type && $post_type->is_managed_by_voxel() ) ) {
            throw new \Exception( __( 'Post type not provided.', 'voxel-fse' ) );
        }

        $post = \Voxel\Post::get( $_GET['post_id'] ?? null );
        if ( $post && ! $post->is_editable_by_current_user() ) {
            throw new \Exception( __( 'You cannot edit this post.', 'voxel-fse' ) );
        }

        if ( $post && $post->post_type && $post->post_type->get_key() !== $post_type->get_key() ) {
            throw new \Exception( __( 'You cannot edit this post.', 'voxel-fse' ) );
        }

        if ( ! $post && ! current_user_can( $post_type->wp_post_type->cap->create_posts ) ) {
            throw new \Exception( __( 'You cannot edit this post.', 'voxel-fse' ) );
        }

        // Set up block attributes for admin context
        $attributes = [
                'postTypeKey' => $post_type->get_key(),
                'showFormHead' => true, // Show progress bar and navigation in admin metabox (1:1 Voxel match)
                'enableDraftSaving' => false,
                'successMessage' => __( 'Your post has been updated successfully!', 'voxel-fse' ),
                'redirectAfterSubmit' => '',
                'submitButtonText' => __( 'Save Changes', 'voxel-fse' ),
                'icons' => [
                        'next' => '',
                        'prev' => '',
                        'draft' => '',
                        'publish' => '',
                        'save' => '',
                        'success' => '',
                        'view' => '',
                ],
                '_admin_mode' => true,
                '_admin_post_id' => $post ? $post->get_id() : null,
                '_admin_nonce' => wp_create_nonce( 'vx_create_post_admin_mode' ),
        ];

        // Render the iframe page (1:1 match with Voxel's template)
        // Evidence: themes/voxel/templates/backend/edit-post-fields.php
        require plugin_dir_path( __FILE__ ) . 'admin-metabox-iframe.php';
        exit;
    } catch ( \Exception $e ) {
        printf( '<p title="%s" style="display: none;">%s</p>', $e->getMessage(), __( 'An error occurred.', 'voxel-fse' ) );
        exit;
    }
}

// Register AJAX handler
add_action( 'voxel_ajax_voxel_fse_admin_get_fields_form', 'voxel_fse_ajax_admin_get_fields_form' );

/**
 * DEPRECATED: Enqueue Create Post block assets for admin
 *
 * This function is no longer used. Asset enqueuing is now handled by render.php
 * which properly detects admin metabox context and enqueues the React frontend bundle.
 *
 * The old implementation tried to enqueue view.js which doesn't exist in the build.
 * The correct approach is to use the same React component (create-post-frontend.js)
 * in both frontend and admin metabox contexts.
 *
 * @deprecated No longer called - kept for reference only
 */
/*
function voxel_fse_enqueue_create_post_assets() {
	// DEPRECATED - see note above
	// render.php handles all asset enqueuing now
}
*/

/**
 * DEPRECATED: voxel_fse_add_frontend_edit_link
 *
 * This function is no longer needed. We now add the "Edit in frontend form"
 * link directly in the metabox title at line 37-40.
 *
 * Kept for reference only.
 */
/*
function voxel_fse_add_frontend_edit_link() {
	global $post, $typenow;

	// Only run on post edit screen for Voxel post types
	$screen = get_current_screen();
	if ( ! $screen || $screen->base !== 'post' || ! $post ) {
		return;
	}

	$post_type = \Voxel\Post_Type::get( $typenow );
	if ( ! $post_type ) {
		return;
	}

	// Build frontend edit URL
	$post_type_key = $post_type->get_key();
	$frontend_edit_url = home_url( "/create-{$post_type_key}/?post_id={$post->ID}" );

	?>
	<script type="text/javascript">
	jQuery(document).ready(function($) {
		// Find our metabox title
		var $metabox = $('#voxel_fse_create_post_fields');
		if ( $metabox.length ) {
			// Find the title handle (where title text is)
			var $titleHandle = $metabox.find('.hndle');
			if ( $titleHandle.length ) {
				// Create the link
				var $link = $('<a/>', {
					href: <?php echo wp_json_encode( $frontend_edit_url ); ?>,
					text: <?php echo wp_json_encode( __( 'Edit in frontend form', 'voxel-fse' ) ); ?>,
					css: {
						'float': 'right',
						'font-size': '13px',
						'font-weight': 'normal',
						'text-decoration': 'none'
					}
				});

				// Add hover effect
				$link.hover(
					function() { $(this).css('text-decoration', 'underline'); },
					function() { $(this).css('text-decoration', 'none'); }
				);

				// Append to title
				$titleHandle.append($link);
			}
		}
	});
	</script>
	<?php
}
*/

/**
 * Save metabox data
 *
 * Note: We don't need a save handler because the Create Post block
 * handles all saves via AJAX using Voxel's existing endpoint.
 * This function is here for reference only.
 */
function voxel_fse_save_create_post_metabox( $post_id ) {
    // Not needed - AJAX handles all saves
    return;
}